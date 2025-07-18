const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        // service: process.env.EMAIL_SERVICE, // REMOVE or comment out this line
        host: 'smtp.gmail.com', // Explicitly set Gmail's SMTP host
        port: 587, // Standard SMTP port for TLS
        secure: false, // Use 'false' for STARTTLS on port 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            // Do not fail on invalid certs, important for some environments
            rejectUnauthorized: false
        }
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