import { passwordresets } from "../config/mongoCollections.js";
import { Collection } from "mongodb";

const cleanupresets = async (): Promise<string> => {
  const resetscol: Collection = await passwordresets();

  const recentTime: Date = new Date();
  recentTime.setMinutes(recentTime.getMinutes() - 30);

  const result = await resetscol.deleteMany({
    $or: [
      { requesttime: { $lt: recentTime } },
      { requesttime: { $gt: new Date() } },
    ],
  });

  if (!result.acknowledged) {
    throw new Error("Database Error");
  }

  return `Successfully cleaned up expired password reset requests deleting a total of ${result.deletedCount} records`;
};

export default cleanupresets;
