import SMTPConnect from "../../../config/smtpConnection";
import verify from "../../../data_validation";

async function sendPasswordResetEmail(
  email: string,
  secret: string
): Promise<any> {
  email = verify.email(email);
  secret = verify.UUID(secret);

  const resetdomain = `http://${process.env.SiteDomain}/resetpassword/${secret}`;

  const emailer = await SMTPConnect();
  const message = {
    from: process.env.SMTPEmail,
    to: email,
    subject: `Password reset`,
    text: `If you have requested that your password be reset, please use the link below to complete the reset.
    If you did not request a password reset no further action is required from you at this time.
    
    ${resetdomain}`,
    html: `
    <!doctype html>
    <html>
        <body>
            <p>If you have requested that your password be reset, please use the link below to complete the reset.</p><br>
            <p>If you did not request a password reset no further action is required from you at this time.</p><br>
            <a href="${resetdomain}">Reset Password</a><br>
            <br>
            Please use this link if the button is not working: <a href="${resetdomain}">${resetdomain}</a>
        </body>
    </html>
    `,
  };
  let messagesent;

  try {
    messagesent = await emailer.sendMail(message);
  } catch (e: unknown) {
    // Use 'unknown' type for error
    const error = e as { response?: string }; // Assert e as a specific error type
    const errorResponse: { status: number; message: string } = {
      status: 500,
      message: error.response || "An unknown error occurred", // Use error.response if available
    };
    throw errorResponse;
  }

  if (messagesent.rejected.length) {
    const error: { status: number; message: string } = {
      status: 400,
      message: "Email rejected",
    };
    throw error;
  }

  return messagesent;
}

async function notifyOfChangedPassword(email: string): Promise<any> {
  email = verify.email(email);
  const emailer = await SMTPConnect();

  const message = {
    from: `account-services@${process.env.MailServerDomain}`,
    to: email,
    subject: `Password Updated`,
    text: `Your password has been changed. If you did not make this change, please notify abuse@${process.env.MailServerDomain}.`,
    html: `
    <!doctype html>
    <html>
        <body>
            <p>Your password has been changed. If you did not make this change, please notify abuse@${process.env.MailServerDomain}.</p>
        </body>
    </html>
    `,
  };
  let messagesent;

  try {
    messagesent = await emailer.sendMail(message);
  } catch (e: unknown) {
    // Use 'unknown' type for error
    const error = e as { response?: string }; // Assert e as a specific error type
    const errorResponse: { status: number; message: string } = {
      status: 500,
      message: error.response || "An unknown error occurred", // Use error.response if available
    };
    throw errorResponse;
  }

  if (messagesent.rejected.length) {
    const error: { status: number; message: string } = {
      status: 400,
      message: "Email rejected",
    };
    throw error;
  }

  return messagesent;
}

export { sendPasswordResetEmail, notifyOfChangedPassword };
