import { users } from "../../../config/mongoCollections"; // Ensure this file exports a promise that resolves to a Collection
import { ObjectId } from "mongodb";

interface Projection {
  [key: string]: number; // Projection can have string keys with number values (1 or 0)
}

async function getUserByID(id: string, projection?: Projection): Promise<any> {
  // Adjust the return type as necessary
  try {
    new ObjectId(id);
  } catch {
    throw { status: 400, message: "Invalid UserID" };
  }

  if (projection && typeof projection !== "object") {
    throw { status: 500, message: "Invalid projection object" };
  }

  const usercol = await users();
  const result = await usercol.findOne(
    { _id: new ObjectId(id) },
    { projection: projection }
  );

  if (!result) {
    throw { status: 404, message: "No such user" };
  }

  return result;
}

export default getUserByID;
