import { passwordresets } from "../../../config/mongoCollections";
import verify from "../../../data_validation";
import { ObjectId, Collection, DeleteResult } from "mongodb";

async function removeReset(idString: string): Promise<DeleteResult> {
  const id = verify.validateMongoId(idString, "PasswordResetID");

  const resetscol: Collection = await passwordresets();

  const result: DeleteResult = await resetscol.deleteOne({
    _id: new ObjectId(id),
  });

  if (!result.acknowledged) {
    throw { status: 500, message: "Database error" };
  }

  if (result.deletedCount !== 1) {
    throw { status: 404, message: "Reset not found" };
  }

  return result;
}

export default removeReset;
