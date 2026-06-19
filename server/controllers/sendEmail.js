const transporter = require('./mailerConfig');

function sendEmail(to, subject, text) {
    const mailOptions = {
        from: 'rutanshc0101@gmail.com',
        to: to,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = sendEmail;
