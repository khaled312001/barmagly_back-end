import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import nodemailer from 'nodemailer';

async function testEmail() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const rawMailFrom = process.env.MAIL_FROM || smtpUser || '';
    const mailFrom = rawMailFrom.replace(/^"(.*)"$/, '$1');

    console.log('=== SMTP Test ===');
    console.log('Host:', smtpHost);
    console.log('Port:', smtpPort);
    console.log('User:', smtpUser);
    console.log('Pass:', smtpPass ? `${smtpPass.slice(0, 3)}***` : 'NOT SET');
    console.log('From:', mailFrom);
    console.log('');

    if (!smtpHost || !smtpUser || !smtpPass) {
        console.error('❌ Missing SMTP config!');
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false },
    });

    console.log('Verifying SMTP connection...');
    try {
        await transporter.verify();
        console.log('✅ SMTP connection OK');
    } catch (err) {
        console.error('❌ SMTP connection failed:', err);
        process.exit(1);
    }

    console.log('Sending test email...');
    try {
        const info = await transporter.sendMail({
            from: mailFrom,
            to: smtpUser,
            subject: 'Test Email from Barmagly',
            html: `<h2>Test Email</h2><p>SMTP is working correctly at ${new Date().toISOString()}</p>`,
        });
        console.log('✅ Email sent! Message ID:', info.messageId);
    } catch (err) {
        console.error('❌ Failed to send email:', err);
        process.exit(1);
    }
}

testEmail();
