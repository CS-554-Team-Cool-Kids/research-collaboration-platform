import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import admin from "firebase-admin";
import { createServer } from "http";
import { typeDefs } from "./graphQl/typeDefs.js";
import { resolvers } from "./graphQl/resolvers.js";
import dotenv from "dotenv";
import { Server as SocketServer } from "socket.io";

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

const httpServer = createServer();
const io = new SocketServer(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("user_connected", (data) => {
    // activeUsers[socket.id] = data; // Map socket ID to user details
    console.log("User connected:", data);
    // console.log("Active Users:", activeUsers);

    // Optionally notify other users about the new connection
    socket.broadcast.emit("user_joined", { user: data });
  });

  // Handle chat message events
  socket.on("chat_message", (data) => {
    console.log("Message received:", data);
    io.emit("chat_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start Apollo server with custom HTTP server
const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  httpServer.listen(4001, () => {
    console.log(`Socket.IO server running on http://localhost:4001`);
  });
};

startServer();
// const { url } = await startStandaloneServer(server, {
//   listen: { port: 4000 },
// });

// console.log(`🚀  Server ready at: ${url}`);
