import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

        const adminEmail = process.env.ADMIN_EMAIL || 'atreychambersoflaw@gmail.com';
        // Construct schedule URL from request origin
        const origin = req.headers.get('origin') || req.headers.get('referer') || 'https://atrey-chambers.com';
        const baseUrl = origin.replace(/\/$/, ''); // Remove trailing slash
        const scheduleUrl = `${baseUrl}/schedule`;

        // Send Email to Admin
        await transporter.sendMail({
            from: 'atreychambersoflaw@gmail.com',
            to: adminEmail,
            subject: `New Contact Form Submission from ${name}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0E3B2F;">New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #F2EBDD; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <p style="white-space: pre-wrap;">${message}</p>
            </div>
        </div>
      `,
            text: `
        New contact form submission.
        
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
        });

        // Send Thank You Email to User with promotional content and schedule link
        await transporter.sendMail({
            from: 'atreychambersoflaw@gmail.com',
            to: email,
            subject: 'Thank You for Contacting Atrey Chambers of Law LLP',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0E3B2F; margin: 0;">Atrey Chambers of Law LLP</h1>
            </div>
            
            <h2 style="color: #0E3B2F;">Thank You for Reaching Out, ${name}!</h2>
            
            <p>We have received your message and truly appreciate you taking the time to contact us. Our team of highly experienced and talented legal professionals is committed to providing exceptional legal services tailored to your unique needs.</p>
            
            <div style="background-color: #0E3B2F; color: #F2EBDD; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="margin-top: 0; color: #F2EBDD;">Why Choose Atrey Chambers?</h3>
                <ul style="line-height: 1.8;">
                    <li><strong>Expert Legal Team:</strong> Our attorneys bring decades of combined experience across diverse practice areas</li>
                    <li><strong>Proven Track Record:</strong> We have successfully represented clients in complex legal matters, including cases before the Supreme Court of India, High Courts, and various tribunals</li>
                    <li><strong>Client-Focused Approach:</strong> We understand that every case is unique and requires personalized attention and strategic solutions</li>
                    <li><strong>Comprehensive Services:</strong> From corporate law to intellectual property, from infrastructure projects to international arbitration, we cover all aspects of legal practice</li>
                    <li><strong>Esteemed Clientele:</strong> We are proud to serve government entities, major corporations, and distinguished organizations across India</li>
                </ul>
            </div>
            
            <p style="font-size: 18px; font-weight: bold; color: #0E3B2F; text-align: center; margin: 30px 0;">
                Ready to take the next step? Schedule a consultation with our expert team!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${scheduleUrl}" style="background-color: #0E3B2F; color: #F2EBDD; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                    Schedule a Call with Us
                </a>
            </div>
            
            <p>Our team will review your message and get back to you within 24-48 hours. In the meantime, feel free to explore our website to learn more about our services and expertise.</p>
            
            <div style="background-color: #F2EBDD; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Address:</strong> 24, Gyan Kunj, Basement, Laxmi Nagar, Delhi - 110092</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> +91-11-22053080, 22023821</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> support@atreychambers.com</p>
            </div>
            
            <p style="margin-top: 30px;">
                We look forward to the opportunity to serve you and help you achieve your legal objectives.
            </p>
            
            <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The Team at Atrey Chambers of Law LLP</strong>
            </p>
        </div>
      `,
            text: `
        Thank You for Reaching Out, ${name}!
        
        We have received your message and truly appreciate you taking the time to contact us. Our team of highly experienced and talented legal professionals is committed to providing exceptional legal services tailored to your unique needs.
        
        Why Choose Atrey Chambers?
        - Expert Legal Team: Our attorneys bring decades of combined experience across diverse practice areas
        - Proven Track Record: We have successfully represented clients in complex legal matters, including cases before the Supreme Court of India, High Courts, and various tribunals
        - Client-Focused Approach: We understand that every case is unique and requires personalized attention and strategic solutions
        - Comprehensive Services: From corporate law to intellectual property, from infrastructure projects to international arbitration, we cover all aspects of legal practice
        - Esteemed Clientele: We are proud to serve government entities, major corporations, and distinguished organizations across India
        
        Ready to take the next step? Schedule a consultation with our expert team!
        
        Schedule a Call: ${scheduleUrl}
        
        Our team will review your message and get back to you within 24-48 hours. In the meantime, feel free to explore our website to learn more about our services and expertise.
        
        Contact Information:
        Address: 24, Gyan Kunj, Basement, Laxmi Nagar, Delhi - 110092
        Phone: +91-11-22053080, 22023821
        Email: support@atreychambers.com
        
        We look forward to the opportunity to serve you and help you achieve your legal objectives.
        
        Best regards,
        The Team at Atrey Chambers of Law LLP
      `,
        });

        return NextResponse.json({ success: true, message: 'Thank you for your message. We will get back to you soon!' });
    } catch (error) {
        console.error('Error processing contact form:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

