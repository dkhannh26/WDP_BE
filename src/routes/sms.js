require("dotenv").config();
const express = require('express');
const nodemailer = require('nodemailer');
var emailRouter = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

emailRouter.get('/testemail', (req, res) => {
    res.send('Test email route is working!');
});

emailRouter.post('/send-email', (req, res) => {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
        return res.status(400).json({
            error: "Missing required fields: 'to', 'subject', or 'body'."
        });
    }

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: to,
        subject: subject,
        text: body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
            return res.status(500).json({
                error: 'Failed to send email',
                details: error
            });
        }
        console.log('Email sent: ' + info.response);
        res.send('Email sent successfully!');
    });
});

module.exports = emailRouter;
