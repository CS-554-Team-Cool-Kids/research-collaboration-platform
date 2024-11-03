import { ObjectId, Collection, UpdateResult } from "mongodb";
import { users } from "../../../config/mongoCollections";
import getUserByID from "./getUserInfoByID";
import verify from "../../../data_validation";
import hash from "../../hashPassword";
import { notifyOfChangedPassword } from "../emails/sendPasswordResetEmail";

// Define a type for the getUserByID response, assuming it only returns an object with the email
interface UserEmail {
  email: string;
}

async function setPassword(
  id: string,
  password: string
): Promise<UpdateResult> {
  try {
    new ObjectId(id);
  } catch {
    throw { status: 400, message: "Invalid UserID" };
  }

  // Hash and validate the password
  password = await hash(verify.password(password));

  // Get users collection
  const usercol: Collection = await users();

  const result: UpdateResult = await usercol.updateOne(
    { _id: new ObjectId(id), status: { $not: { $eq: "Disabled" } } },
    {
      $set: { password: password, status: "Active" },
      $unset: { registrationcode: "" },
    }
  );

  if (!result.acknowledged) {
    throw { status: 500, message: "Database error when setting user password" };
  }

  if (result.matchedCount !== 1) {
    throw { status: 404, message: "No such user" };
  }

  // Fetch the user's email
  const useremail: UserEmail = await getUserByID(id, { _id: 0, email: 1 });

  // Notify the user about the password change
  await notifyOfChangedPassword(useremail.email);

  return result;
}

export default setPassword;
