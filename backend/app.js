import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import admin from "firebase-admin";
import { typeDefs } from "./typeDefs.js";
import { resolvers } from "./resolvers/index.js";
import dotenv from "dotenv";
// import serviceAccount from "./rcp-auth-d49e3-firebase-adminsdk-6o7n9-b1f9f6a99b.json" assert { type: "json" };
dotenv.config();

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const getUserFromToken = async (token) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return null;
  }
};

// const { url } = await startStandaloneServer(server, {
//   listen: { port: 4000 },
// });

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    const user = token ? await getUserFromToken(token) : null;
    return { user };
  },
});

console.log(`🚀  Server ready at: ${url}`);
