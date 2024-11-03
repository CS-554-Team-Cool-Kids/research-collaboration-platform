import nodemailer, { Transporter } from "nodemailer";

let transporter: Transporter | undefined = undefined;

function smtpConnection(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTPServerURL,
      port: Number(process.env.SMTPPort), // Convert to number
      secure: false,
      auth: {
        user: process.env.SMTPUsername,
        pass: process.env.SMTPPassword,
      },
    });
  }
  return transporter;
}

export default smtpConnection;
