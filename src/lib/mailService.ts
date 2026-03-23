import nodemailer from 'nodemailer';

export const sendLeadNotification = async (lead: any) => {
    try {
        // Strip surrounding quotes Vercel might add to env var values
        const stripQuotes = (s?: string) => s ? s.replace(/^"(.*)"$/, '$1').trim() : s;

        const smtpHost = stripQuotes(process.env.SMTP_HOST);
        const smtpPort = Number(process.env.SMTP_PORT) || 465;
        const smtpUser = stripQuotes(process.env.SMTP_USER);
        const smtpPass = stripQuotes(process.env.SMTP_PASS);

        if (!smtpHost || !smtpUser || !smtpPass) {
            console.error('SMTP not configured: missing SMTP_HOST, SMTP_USER, or SMTP_PASS');
            return false;
        }

        // Strip surrounding quotes from MAIL_FROM if present
        const rawMailFrom = process.env.MAIL_FROM || smtpUser;
        const mailFrom = rawMailFrom.replace(/^"(.*)"$/, '$1').trim();

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        const mailOptions = {
            from: mailFrom,
            to: smtpUser,
            subject: `New Lead: ${lead.name} - ${lead.service || 'General Inquiry'}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #0070f3;">New Lead Received</h2>
                    <p><strong>Name:</strong> ${lead.name}</p>
                    <p><strong>Email:</strong> ${lead.email}</p>
                    <p><strong>Phone:</strong> ${lead.phone || 'N/A'}</p>
                    <p><strong>Company:</strong> ${lead.company || 'N/A'}</p>
                    <p><strong>Service:</strong> ${lead.service || 'N/A'}</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;" />
                    <h3>Message:</h3>
                    <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${lead.message}</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
