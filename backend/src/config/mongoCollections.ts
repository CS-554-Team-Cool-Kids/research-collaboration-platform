// mongoCollections.ts
import { dbConnection } from "./mongoConnection";
import { Collection, Db } from "mongodb";

// Define an interface for your collections
interface Collections {
  users: Collection;
  passwordresets: Collection;
}

// Define a type for collection names
type CollectionNames = keyof Collections;

const collections: Partial<Collections> = {};

// A generic function to get collections
const getCollectionFn = (collectionName: CollectionNames) => {
  return async (): Promise<Collection> => {
    if (!collections[collectionName]) {
      const db: Db = await dbConnection();
      collections[collectionName] = db.collection(collectionName);
    }

    return collections[collectionName] as Collection;
  };
};

// Export collections with proper typing
export const users = getCollectionFn("users");
export const passwordresets = getCollectionFn("passwordresets");

// Export the type for use in other files
export type { CollectionNames };
