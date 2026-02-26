import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import * as ics from 'ics';
import { google } from 'googleapis';

// Initialize Google Calendar API
function getCalendarClient() {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const calendarId = process.env.GOOGLE_CALENDAR_ID || serviceAccountEmail;

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

        const date = new Date(dateStr);
        const endDate = new Date(date);
        endDate.setHours(endDate.getHours() + 1); // 1 hour duration

        // Create ICS Event
        const event: ics.EventAttributes = {
            start: [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()],
            duration: { hours: 1 },
            title: `Consultation: ${service} with ${name}`,
            description: `Service: ${service}\nClient: ${name} (${email})\nMessage: ${message}`,
            location: 'Online Meeting',
            url: 'https://atrey-chambers.com', // Replace with actual URL
            organizer: { name: 'Atrey Chambers', email: 'atreychambersoflaw@gmail.com' },
            attendees: [
                { name: name, email: email, rsvp: true, partstat: 'ACCEPTED', role: 'REQ-PARTICIPANT' },
                { name: 'Abhishek Atrey', email: 'atreychambersoflaw@gmail.com', role: 'REQ-PARTICIPANT' }
            ]
        };

        const { error, value: icsContent } = ics.createEvent(event);
        if (error) {
            console.error('Error creating ICS:', error);
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
                    start: {
                        dateTime: date.toISOString(),
                        timeZone: 'UTC',
                    },
                    end: {
                        dateTime: endDate.toISOString(),
                        timeZone: 'UTC',
                    },
                    location: 'Online Meeting',
                    attendees: [
                        { email: email, displayName: name },
                        { email: process.env.ADMIN_EMAIL || 'atreychambersoflaw@gmail.com', displayName: 'Abhishek Atrey' },
                    ],
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: 'email', minutes: 24 * 60 }, // 1 day before
                            { method: 'popup', minutes: 30 }, // 30 minutes before
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
                    sendUpdates: 'all', // Send invites to all attendees
                });

                calendarEventId = response.data.id;
                console.log('Google Calendar event created:', calendarEventId);
            } catch (calendarError: any) {
                console.error('Error creating Google Calendar event:', calendarError);
                // Continue with email even if calendar creation fails
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

        // Prepare attachments
        const attachments: any[] = [
            {
                filename: 'invite.ics',
                content: icsContent,
                contentType: 'text/calendar',
            }
        ];

        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            attachments.push({
                filename: file.name,
                content: buffer,
            });
        }

        const adminEmail = process.env.ADMIN_EMAIL || 'atreychambersoflaw@gmail.com';
        const meetingLink = calendarEventId 
            ? `https://calendar.google.com/calendar/event?eid=${calendarEventId}`
            : 'Check your Google Calendar';

        // Send Email to Admin
        await transporter.sendMail({
            from: 'atreychambersoflaw@gmail.com',
            to: adminEmail,
            subject: `New Consultation Request: ${service} - ${name}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0E3B2F;">New Consultation Request Received</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>Date:</strong> ${date.toLocaleString()}</p>
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
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

        // Send Confirmation to User
        const calendarLink = calendarEventId 
            ? `https://calendar.google.com/calendar/event?eid=${calendarEventId}`
            : null;

        await transporter.sendMail({
            from: 'atreychambersoflaw@gmail.com',
            to: email,
            subject: `Consultation Confirmed: ${service} - Atrey Chambers`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0E3B2F;">Consultation Confirmed</h2>
            <p>Dear ${name},</p>
            <p>Thank you for scheduling a consultation with Atrey Chambers of Law LLP.</p>
            <div style="background-color: #F2EBDD; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Service:</strong> ${service}</p>
                <p><strong>Date & Time:</strong> ${date.toLocaleString()}</p>
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
                {
                    filename: 'invite.ics',
                    content: icsContent,
                    contentType: 'text/calendar',
                }
            ],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
