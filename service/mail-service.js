const nodemailer = require('nodemailer');

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  // TODO: create markup for message.
  async sendActivationMail(to, link) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `Activate your account on ${process.env.API_URL}`,
      text: '',
      html: `
      <div>
      <h1>
      Activate your account on link
      </h1>
      <a href="${link}">
      ${link}
      </a>
      </div>`,
    });
  }
}

module.exports = new MailService();
