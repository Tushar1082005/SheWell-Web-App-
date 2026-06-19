const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rutanshc0101@gmail.com',
        pass: 'lgkk pjie ivpy vobz'
    }
});

module.exports = transporter;
