import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import * as ics from 'ics';
import { google } from 'googleapis';
import { sanitizeForEmail, isValidEmail } from '@/lib/sanitize';
import { validateOrigin } from '@/lib/csrf';
import { checkRateLimit, RATE_LIMITS, getClientIp } from '@/lib/rate-limit';

function getCalendarClient() {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!serviceAccountEmail || !privateKey) {
        return null;
    }

    const auth = new google.auth.JWT({
        email: serviceAccountEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    return google.calendar({ version: 'v3', auth });
}

export async function POST(req: NextRequest) {
    // CSRF protection
    if (!validateOrigin(req)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Rate limiting: 5 submissions per 10 minutes per IP
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`schedule:${ip}`, RATE_LIMITS.contactForm);
    if (!rateCheck.allowed) {
        return NextResponse.json(
            { error: 'Too many submissions. Please try again later.' },
            {
                status: 429,
                headers: { 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) },
            }
        );
    }

    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const service = formData.get('service') as string;
        const dateStr = formData.get('date') as string;
        const message = formData.get('message') as string;
        const file = formData.get('file') as File | null;

        if (!name || !email || !service || !dateStr) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        // Sanitize all user inputs for safe HTML insertion
        const safeName = sanitizeForEmail(name);
        const safeEmail = sanitizeForEmail(email);
        const safeService = sanitizeForEmail(service);
        const safeMessage = message ? sanitizeForEmail(message) : '';

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
        }
        const endDate = new Date(date);
        endDate.setHours(endDate.getHours() + 1);

        // Create ICS Event (using raw values — ICS is plain text, not HTML)
        const event: ics.EventAttributes = {
            start: [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()],
            duration: { hours: 1 },
            title: `Consultation: ${service} with ${name}`,
            description: `Service: ${service}\nClient: ${name} (${email})\nMessage: ${message || 'No message provided'}`,
            location: 'Online Meeting',
            url: 'https://www.atreychambers.com',
            organizer: { name: 'Atrey Chambers', email: 'atreychambersoflaw@gmail.com' },
            attendees: [
                { name: name, email: email, rsvp: true, partstat: 'ACCEPTED', role: 'REQ-PARTICIPANT' },
                { name: 'Abhishek Atrey', email: 'atreychambersoflaw@gmail.com', role: 'REQ-PARTICIPANT' }
            ]
        };

        const { error: icsError, value: icsContent } = ics.createEvent(event);
        if (icsError) {
            console.error('Error creating ICS:', icsError);
            return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 });
        }

        // Create event in Google Calendar
        let calendarEventId = null;
        const calendar = getCalendarClient();

        if (calendar) {
            try {
                const calendarId = process.env.GOOGLE_CALENDAR_ID || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

                const googleEvent = {
                    summary: `Consultation: ${service} with ${name}`,
                    description: `Service: ${service}\nClient: ${name} (${email})\nMessage: ${message || 'No message provided'}`,
                    start: { dateTime: date.toISOString(), timeZone: 'UTC' },
                    end: { dateTime: endDate.toISOString(), timeZone: 'UTC' },
                    location: 'Online Meeting',
                    attendees: [
                        { email: email, displayName: name },
                        { email: process.env.ADMIN_EMAIL || 'atreychambersoflaw@gmail.com', displayName: 'Abhishek Atrey' },
                    ],
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: 'email' as const, minutes: 24 * 60 },
                            { method: 'popup' as const, minutes: 30 },
                        ],
                    },
                    conferenceData: {
                        createRequest: {
                            requestId: `consultation-${Date.now()}`,
                            conferenceSolutionKey: { type: 'hangoutsMeet' },
                        },
                    },
                };

                const response = await calendar.events.insert({
                    calendarId: calendarId!,
                    requestBody: googleEvent,
                    conferenceDataVersion: 1,
                    sendUpdates: 'all',
                });

                calendarEventId = response.data.id;
            } catch (calendarError) {
                console.error('Error creating Google Calendar event:', calendarError);
            }
        }

        // Configure Nodemailer
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Email credentials not configured');
            return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const attachments: { filename: string; content: string | Buffer; contentType?: string }[] = [
            { filename: 'invite.ics', content: icsContent!, contentType: 'text/calendar' }
        ];

        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            attachments.push({ filename: file.name, content: buffer });
        }

        const adminEmail = process.env.ADMIN_EMAIL || 'atreychambersoflaw@gmail.com';
        const meetingLink = calendarEventId
            ? `https://calendar.google.com/calendar/event?eid=${calendarEventId}`
            : 'Check your Google Calendar';

        // Send Email to Admin (using sanitized values in HTML)
        await transporter.sendMail({
            from: 'atreychambersoflaw@gmail.com',
            to: adminEmail,
            subject: `New Consultation Request: ${safeName} - ${safeService}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0E3B2F;">New Consultation Request Received</h2>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Service:</strong> ${safeService}</p>
            <p><strong>Date:</strong> ${date.toLocaleString()}</p>
            ${safeMessage ? `<p><strong>Message:</strong> ${safeMessage}</p>` : ''}
            ${calendarEventId ? `<p><strong>Calendar Event:</strong> <a href="${meetingLink}">View in Google Calendar</a></p>` : ''}
            <p>A calendar invite has been sent to the client.</p>
        </div>
      `,
            text: `
        New consultation request received.

        Name: ${name}
        Email: ${email}
        Service: ${service}
        Date: ${date.toLocaleString()}
        Message: ${message || 'No message provided'}

        ${calendarEventId ? `Calendar Event: ${meetingLink}` : 'Calendar event created in Google Calendar'}
      `,
            attachments,
        });

        // Send Confirmation to User (using sanitized values in HTML)
        const calendarLink = calendarEventId
            ? `https://calendar.google.com/calendar/event?eid=${calendarEventId}`
            : null;

        await transporter.sendMail({
            from: 'atreychambersoflaw@gmail.com',
            to: email.trim(),
            subject: `Consultation Confirmed: ${service} - Atrey Chambers`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0E3B2F;">Consultation Confirmed</h2>
            <p>Dear ${safeName},</p>
            <p>Thank you for scheduling a consultation with Atrey Chambers of Law LLP.</p>
            <div style="background-color: #F2EBDD; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Service:</strong> ${safeService}</p>
                <p><strong>Date &amp; Time:</strong> ${date.toLocaleString()}</p>
                <p><strong>Duration:</strong> 1 hour</p>
                <p><strong>Location:</strong> Online Meeting</p>
            </div>
            ${calendarLink ? `
                <p style="margin: 20px 0;">
                    <a href="${calendarLink}" style="background-color: #0E3B2F; color: #F2EBDD; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Add to Google Calendar
                    </a>
                </p>
            ` : ''}
            <p>We have sent you a calendar invitation. Please check your email and add it to your calendar.</p>
            <p>If you need to reschedule or have any questions, please don't hesitate to contact us.</p>
            <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>Atrey Chambers of Law LLP</strong>
            </p>
        </div>
      `,
            text: `
        Dear ${name},

        Thank you for scheduling a consultation with Atrey Chambers of Law LLP.

        Service: ${service}
        Date & Time: ${date.toLocaleString()}
        Duration: 1 hour
        Location: Online Meeting

        ${calendarLink ? `Add to Google Calendar: ${calendarLink}` : 'A calendar invitation has been sent to your email.'}

        If you need to reschedule or have any questions, please don't hesitate to contact us.

        Best regards,
        Atrey Chambers of Law LLP
      `,
            attachments: [
                { filename: 'invite.ics', content: icsContent!, contentType: 'text/calendar' }
            ],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
