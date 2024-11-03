import { MongoClient, Db } from "mongodb";
import { mongoConfig } from "./settings";

let _connection: MongoClient | undefined = undefined;
let _db: Db | undefined = undefined;

const dbConnection = async (): Promise<Db> => {
  if (!_connection) {
    _connection = await MongoClient.connect(mongoConfig.serverUrl);
    _db = _connection.db(mongoConfig.database);
  }

  // Check if _db is still undefined and throw an error if it is
  if (!_db) {
    throw new Error("Database connection failed.");
  }

  return _db; // Now TypeScript knows _db is a Db
};

const closeConnection = async (): Promise<void> => {
  if (_connection) {
    await _connection.close();
    _connection = undefined; // Reset the connection after closing
    _db = undefined; // Optionally reset _db too
  }
};

export { dbConnection, closeConnection };
