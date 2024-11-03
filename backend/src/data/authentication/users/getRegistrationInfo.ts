import { users } from "../../../config/mongoCollections"; // Ensure this file exports a promise that resolves to a Collection
import verify from "../../../data_validation"; // Assume this has proper TypeScript definitions

interface UserRegistrationInfo {
  // Define the shape of the UserRegistrationInfo document according to your database schema
  _id: string; // Assuming _id is a string; adjust if it's an ObjectId
  identification: {
    type: string;
    number: string;
  };
}

async function getRegistrationInfo(
  registrationcode: string
): Promise<UserRegistrationInfo> {
  registrationcode = verify.UUID(registrationcode);

  const usercol = await users();
  const result = await usercol.findOne<UserRegistrationInfo>(
    { registrationcode: registrationcode, status: "Initialized" }, // Corrected spelling of "Initialized"
    { projection: { _id: 1, identification: 1 } }
  );

  if (!result) {
    throw { status: 404, message: "Invalid registration link" };
  }

  return result;
}

export default getRegistrationInfo;
