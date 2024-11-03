import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors"; // Import CORS
import session from "express-session";
import MongoStore from "connect-mongo";
import smtpConnection from "./config/smtpConnection";
import { dbConnection } from "./config/mongoConnection";
import route from "./routes/index";
import scheduler from "./cronjobs/index"; // Import the SimpleScheduler instance

// Initialize SMTP and database connections
const smtpConnectionInstance = smtpConnection();
const databaseConnectionInstance = dbConnection();

const app: Application = express();

// Middleware for JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors()); // Enable CORS for all routes

// Session configuration
app.use(
  session({
    secret: process.env.CookieSecret || "defaultSecret", // Provide a default value
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.mongoServerUrl || "mongodb://localhost:27017", // Provide a default MongoDB URL
      dbName: process.env.mongoDbname || "defaultDbName", // Provide a default DB name
    }),
  })
);

// CSRF Token handling middleware
app.use("/", (req: Request, res: Response, next: NextFunction) => {
  if (req.body._csrf) {
    req.headers["x-csrf-token"] = req.body._csrf;
    delete req.body._csrf;
  }
  next();
});

// Initialize API routes
route(app);

// Verify SMTP connection
smtpConnectionInstance.verify((error: Error | null, success: boolean) => {
  if (error) {
    console.error("Failed to connect to SMTP:", error);
    throw new Error("Failed to connect to SMTP");
  } else {
    console.log("Connected to SMTP Server");
  }
});

// Start the server
const startServer = async () => {
  try {
    const dbConnected = await databaseConnectionInstance;

    if (dbConnected) {
      console.log("Connected to Database Server");

      // Start the cleanup scheduler
      scheduler.start(30); // Start cleanup every 30 minutes
      console.log("Scheduler started for cleanup every 30 minutes.");

      const PORT: number = Number(process.env.PORT) || 5000;
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } else {
      throw new Error("Failed to connect to database");
    }
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

// Start the server
startServer().catch((err) => console.error(err));
