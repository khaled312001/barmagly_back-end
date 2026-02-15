import nodemailer from 'nodemailer';

export const sendLeadNotification = async (lead: any) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Verify connection configuration
        await transporter.verify();

        const mailOptions = {
            from: process.env.MAIL_FROM || process.env.SMTP_USER,
            to: process.env.SMTP_USER, // Send to admin
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
        console.log('Email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
