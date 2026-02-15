import dotenv from 'dotenv';
import { sendLeadNotification } from './src/lib/mailService';

dotenv.config();

async function main() {
    console.log('Testing email sending...');
    console.log('SMTP Config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        from: process.env.MAIL_FROM
    });

    const testLead = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        company: 'Test Corp',
        service: 'Testing',
        message: 'This is a test message to verify SMTP configuration.'
    };

    const success = await sendLeadNotification(testLead);
    if (success) {
        console.log('Email sent successfully!');
    } else {
        console.error('Failed to send email.');
    }
}

main().catch(console.error);
