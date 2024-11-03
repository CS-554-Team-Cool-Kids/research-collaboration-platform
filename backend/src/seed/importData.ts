import "dotenv/config";
import * as mongoCollections from "../config/mongoCollections";
import { ObjectId } from "mongodb";
import users from "./seeds/usersData";

// Replace ObjectId or other MongoDB types in the imported JSON-like structure
const replaceOid = (jsonObject: any): any => {
  if (jsonObject && typeof jsonObject === "object") {
    for (const key in jsonObject) {
      if (jsonObject[key]?.$oid) {
        jsonObject[key] = new ObjectId(jsonObject[key].$oid);
      } else if (jsonObject[key]?.$date) {
        jsonObject[key] = new Date(jsonObject[key].$date);
      } else if (jsonObject[key]?.$numberInt) {
        jsonObject[key] = parseInt(jsonObject[key].$numberInt);
      } else if (jsonObject[key]?.$numberDecimal) {
        jsonObject[key] = parseFloat(jsonObject[key].$numberDecimal);
      } else if (jsonObject[key]?.$numberLong) {
        jsonObject[key] = parseInt(jsonObject[key].$numberLong);
      } else if (jsonObject[key]?.$numberDouble) {
        jsonObject[key] = parseFloat(jsonObject[key].$numberDouble);
      } else if (Array.isArray(jsonObject[key])) {
        jsonObject[key].forEach((item: any) => replaceOid(item));
      } else {
        replaceOid(jsonObject[key]);
      }
    }
  }
  return jsonObject;
};

const importData = async (): Promise<void> => {
  try {
    // Define the collections to process
    const collections: Array<keyof typeof mongoCollections> = ["users"];
    const dataSources: Record<string, any> = {
      users, // Directly reference the imported users data
    };

    for (const collection of collections) {
      const data = dataSources[collection]; // Fetch data from the imported module

      if (data) {
        replaceOid(data); // Replace any placeholder types in the data
        const dbCollection = await mongoCollections[collection]();
        await dbCollection.deleteMany({});
        await dbCollection.insertMany(data);
        console.log(`Inserted ${data.length} documents into ${collection}`);
      } else {
        console.error(`No data loaded for collection: ${collection}`);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
};

await importData();
