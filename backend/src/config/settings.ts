import "dotenv/config";

export const mongoConfig: { serverUrl: string; database: string } = {
  serverUrl: process.env.mongoServerUrl || "",
  database: "rcp",
};
