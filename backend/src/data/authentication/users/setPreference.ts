import { ObjectId } from "mongodb";
import { users } from "../../../config/mongoCollections";
import verify from "../../../data_validation";

// Define the setTheme function with proper type annotations
export async function setTheme(
  idString: string,
  darkmode: boolean
): Promise<any> {
  // Validate the user ID
  const id = verify.validateMongoId(idString, "User");

  const userCollection = await users();

  const result = await userCollection.updateOne(
    { _id: new ObjectId(id) }, // Ensure id is converted to ObjectId
    {
      $set: {
        "preferences.darkmode": darkmode,
      },
    }
  );

  if (!result.acknowledged) {
    throw { status: 500, message: "Database error" };
  }

  return result;
}
