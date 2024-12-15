import dotenv from "dotenv";
dotenv.config();

/*export const mongoConfig = {
  serverUrl: process.env.mongoServerUrl,
  database: process.env.mongoDbname,
};*/

export const mongoConfig = {
  serverUrl: 'mongodb://localhost:27017/',
  database: 'final'
};
