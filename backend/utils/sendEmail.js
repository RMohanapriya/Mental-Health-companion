const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // For self-signed certificates or local development, you might need:
        // tls: {
        //   rejectUnauthorized: false
        // }
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM || "Mental Health App <noreply@mentalhealthapp.com>",
        to: options.to,
        subject: options.subject,
        html: options.html,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;