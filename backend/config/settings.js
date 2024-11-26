import dotenv from "dotenv";
dotenv.config();

export const mongoConfig = {
  serverUrl: process.env.mongoServerUrl,
  database: process.env.mongoDbname,
};
