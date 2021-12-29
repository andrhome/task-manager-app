const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'homandrej@gmail.com',
    subject: 'This is my first email that is created by SendGrid!',
    text: `Hi! It works correctly:) It was sent by ${name}`,
  });
};

module.exports = {
  sendWelcomeEmail
}
