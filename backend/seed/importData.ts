import "dotenv/config";
import * as mongoCollections from "../config/mongoCollections";
import { ObjectId } from "mongodb";
import fs from "fs";

function replaceOid(jsonObject: any): any {
  if (jsonObject && typeof jsonObject === "object") {
    for (const key in jsonObject) {
      if (jsonObject[key]?.$oid) {
        jsonObject = new ObjectId(jsonObject[key].$oid);
      } else if (jsonObject[key]?.$date) {
        jsonObject = new Date(jsonObject[key].$date);
      } else if (jsonObject[key]?.$numberInt) {
        jsonObject = parseInt(jsonObject[key].$numberInt);
      } else if (jsonObject[key]?.$numberDecimal) {
        jsonObject = parseFloat(jsonObject[key].$numberDecimal);
      } else if (jsonObject[key]?.$numberLong) {
        jsonObject = parseInt(jsonObject[key].$numberLong);
      } else if (jsonObject[key]?.$numberDouble) {
        jsonObject = parseFloat(jsonObject[key].$numberDouble);
      } else if (Array.isArray(jsonObject[key])) {
        jsonObject[key].forEach((item) => replaceOid(item));
      } else {
        replaceOid(jsonObject[key]);
      }
    }
  }
  return jsonObject;
}

const importData = async (): Promise<void> => {
  try {
    const collections: Array<mongoCollections.CollectionNames> = ["users"];

    const loadJSON = (filePath: string): any => {
      try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
      } catch (error) {
        console.error(`Error loading JSON file: ${error}`);
        return null;
      }
    };

    for (const collection of collections) {
      const data = loadJSON(`seed/seeds/${collection}Data.json`);
      if (data) {
        replaceOid(data);
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
