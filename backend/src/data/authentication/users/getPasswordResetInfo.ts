import { passwordresets } from "../../../config/mongoCollections"; // Ensure this file exports a promise that resolves to a Collection
import verify from "../../../data_validation"; // Assume this has proper TypeScript definitions

interface PasswordReset {
  // Define the shape of the PasswordReset document according to your database schema
  secret: string;
  requesttime: Date;
  // Add other properties as needed
}

async function getPasswordResetInfo(secret: string): Promise<PasswordReset> {
  secret = verify.UUID(secret);

  const resetscol = await passwordresets();

  const recentTime = new Date();
  recentTime.setMinutes(recentTime.getMinutes() - 30);

  const reset = await resetscol.findOne<PasswordReset>({
    secret: secret,
    requesttime: { $gte: recentTime, $lte: new Date() },
  });

  if (!reset) {
    throw { status: 404, message: "No active reset found for user" };
  }

  return reset;
}

export default getPasswordResetInfo;
