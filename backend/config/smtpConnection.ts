import nodemailer, { Transporter } from "nodemailer";

let transporter: Transporter | undefined = undefined;

function connect(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      pool: true,
      host: process.env.SMTPServerURL,
      port: Number(process.env.SMTPPort), // Convert to number
      maxConnections: 11,
      secure: true, // use TLS
      auth: {
        user: process.env.SMTPUsername,
        pass: process.env.SMTPPassword,
      },
    });
  }
  return transporter;
}

export default connect;
