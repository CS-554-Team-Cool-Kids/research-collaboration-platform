import { randomUUID } from "crypto";
import { passwordresets, users } from "../../../config/mongoCollections"; // Ensure this file exports a promise that resolves to a Collection
import verify from "../../../data_validation"; // Assume this has proper TypeScript definitions
import { sendPasswordResetEmail } from "../emails/sendPasswordResetEmail"; // Ensure this has proper TypeScript definitions
import { ObjectId } from "mongodb";

interface User {
  _id: ObjectId; // MongoDB ObjectId type
}

interface PasswordReset {
  secret: string;
  userid: ObjectId; // MongoDB ObjectId type
  requesttime: Date;
}

async function initiatePasswordReset(
  email: string
): Promise<{ successful: boolean }> {
  // Validate email format
  email = verify.email(email);

  // Get collections
  const usercol = await users();
  const resetscol = await passwordresets();

  // Find user by email
  const user: User | null = await usercol.findOne(
    { email: email, status: "Active" },
    { projection: { _id: 1 } }
  );

  if (!user) {
    // Hide the fact that no such user exists from the client
    return { successful: true };
  }

  // Get recent time for checking existing requests
  const recentTime = new Date();
  recentTime.setMinutes(recentTime.getMinutes() - 30);

  // Check for existing reset requests
  const existingResetDoc = await resetscol.findOne({
    userid: user._id,
    requesttime: { $gte: recentTime, $lte: new Date() },
  });

  // Extract relevant fields to match PasswordReset interface
  let existingreset: PasswordReset | null = null;

  if (existingResetDoc) {
    existingreset = {
      secret: existingResetDoc.secret,
      userid: existingResetDoc.userid,
      requesttime: existingResetDoc.requesttime,
    };
  }

  // Do not resend email if a reset has already been requested
  if (existingreset) {
    return { successful: true };
  }

  // Generate a unique reset secret
  let secret: string = randomUUID();

  // Check for duplicate secrets
  let duplicatesecretDoc = await resetscol.findOne({ secret: secret });

  // Ensure the generated secret is unique
  while (duplicatesecretDoc) {
    // Regenerate secret until a unique one is generated
    secret = randomUUID();
    duplicatesecretDoc = await resetscol.findOne({ secret: secret });
  }

  // Insert the new password reset request
  const insertion = await resetscol.insertOne({
    secret: secret,
    userid: user._id,
    requesttime: new Date(),
  });

  // Check if insertion was successful
  if (!insertion.acknowledged || !insertion.insertedId) {
    // Move to catch
    const error = { status: 500, message: "Database insertion error" };
    throw error;
  }

  try {
    // Send the password reset email
    await sendPasswordResetEmail(email, secret);
    return { successful: true };
  } catch (e) {
    // Clean up if email sending fails
    await resetscol.deleteOne({ _id: insertion.insertedId });
    throw e;
  }
}

export default initiatePasswordReset;
