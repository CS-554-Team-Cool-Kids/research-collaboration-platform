/* NOTES

parentValue - References the type def that called it
    so for example when we execute numOfEmployees we can reference
    the parent's properties with the parentValue Paramater

args - Used for passing any arguments in from the client
    for example, when we call 
    addEmployee(firstName: String!, lastName: String!, employerId: Int!): Employee
		
*/

//IMPORT STATEMENTS

//GraphQLError: Used for handling GraphQL-specific errors
import { GraphQLError } from "graphql";
import admin from "firebase-admin";

//MongoDB: collections for users, projects, updates, and applications
import {
  users as userCollection,
  projects as projectCollection,
  updates as updateCollection,
  applications as applicationCollection,
  comments as commentCollection
} from "../config/mongoCollections.js";

//ObjectId: MongoDB's unique IDs
import { ObjectId } from "mongodb";

//Redis: import and initialize to handle client
import { createClient } from "redis";
const redisClient = createClient();

//Catch any Redis client errors and log them for debugging
redisClient.on("error", (err) => console.error("Redis Client Error", err));

// Connect to Redis, and confirm if connection is good or something went wrong.
(async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
})();

//Helpers
import * as helpers from "./helpers.js";
//import * as propagators from "./propagationHelpers.js";

//RESOLVERS
export const resolvers = {
  //QUERIES
  Query: {

    //FETCH ALL

    //Query: users: [User]
    //Purpose: Fetch all users from MongoDB
    //Cache: Cached by list of users in Redis for one hour
    //REQUIRES CHANGE: NO

    users: async () => {
      //Cache key constructor and check
      const cacheKey = "users";
      const cachedUsers = await redisClient.get(cacheKey);

      //If users are cached, return the parsed JSON (JSON string to object)
      if (cachedUsers) {
        console.log("Returning users from cache.");
        return JSON.parse(cachedUsers);
      }

      //If not cached, pull userCollection and the find all [find({})] users
      const users = await userCollection();
      const allUsers = await users.find({}).toArray();

      //If no users, throw GraphQLError
      if (allUsers.length === 0) {
        console.log("No users found in the database.");
        return [];
      }

      //Cache pulled users, set to cachekey
      //Expiration: 1 hour (60 x 60 = 3600 seconds)
      await redisClient.set(cacheKey, JSON.stringify(allUsers), { EX: 3600 });
      console.log("Users have been fetched from database and are now cached.");

      //Return allUsers
      return allUsers;
    },

    //projects: [Project]
    //Purpose: Fetch all projects from MongoDB
    //Cache: Cached by list of projects in Redis for one hour

    projects: async () => {
      //Cache key constructor and check
      const cacheKey = "projects";
      const cachedProjects = await redisClient.get(cacheKey);

      //If projects are cached, return the parsed JSON (JSON string to object)
      if (cachedProjects) {
        console.log("Returning projects from cache.");
        return JSON.parse(cachedProjects);
      }

      //If not cached, pull projectCollection and the find all [find({})] projects
      const projects = await projectCollection();
      const allProjects = await projects.find({}).toArray();

      //If no projects, throw GraphQLError
      if (allProjects.length === 0) {
        console.log("No projects found in the database.");
        return [];
      }

      //Cache pulled projects, set to cachekey
      //Expiration: 1 hour (60 x 60 = 3600 seconds)
      await redisClient.set(cacheKey, JSON.stringify(allProjects), {
        EX: 3600,
      });
      console.log(
        "Projects have been fetched from database and are now cached."
      );

      //Return
      return allProjects;
    },

    //updates: [Update]
    //Purpose: Fetch all updates from MongoDB
    //Cache: Cached by list of updates in Redis for one hour

    /*updates: async () => {
      //Cache key constructor and check
      const cacheKey = "updates";
      const cachedUpdates = await redisClient.get(cacheKey);

      //If projects are updates, return the parsed JSON (JSON string to object)
      if (cachedUpdates) {
        console.log("Returning updates from cache.");
        const parsedUpdates = JSON.parse(cachedUpdates);

        // Filter out invalid comments for each update
        // A comment is valid if:
        // 1. It exists (not null or undefined).
        // 2. It has a unique '_id'.
        // 3. It has a 'commenter' object with its own '_id'.
        parsedUpdates.forEach(update => {
          if (update.comments) {
            update.comments = update.comments.filter(comment => {
              return comment && comment._id && comment.commenter && comment.commenter._id;
            });
          }
        });

        return parsedUpdates;

      const updates = await updateCollection();
      const allUpdates = await updates.find({}).toArray();

      //If no updates, throw GraphQLError
      if (allUpdates.length === 0) {
        throw new GraphQLError("Internal Server Error", {
          //INTERNAL_SERVER_ERROR = status code 500
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }

      // Filter out null comments for each update
      allUpdates.forEach(update => {
        if (update.comments) {
          update.comments = update.comments.filter(comment => {
            return comment && comment._id && comment.commenter && comment.commenter._id;
          });
        }
      });

      //Cache pulled updates, set to cachekey
      //Expiration: 1 hour (60 x 60 = 3600 seconds)
      await redisClient.set(cacheKey, JSON.stringify(allUpdates), { EX: 3600 });
      console.log(
        "Updates have been fetched from database and are now cached."
      );

      //Return updates
      return allUpdates;
    },*/

    updates: async () => {
      // Cache key constructor and check
      const cacheKey = "updates";
      const cachedUpdates = await redisClient.get(cacheKey);
    
      // If updates are cached, return the parsed JSON (JSON string to object)
      if (cachedUpdates) {
        console.log("Returning updates from cache.");
        return JSON.parse(cachedUpdates);
      }
    
      // Pull updates collection from MongoDB
      const updates = await updateCollection();
    
      // Find all updates from the database
      const allUpdates = await updates.find({}).toArray();
    
      // If no updates are found, throw an error
      if (allUpdates.length === 0) {
        console.log("No updates found in the database.");
        return [];
      }
    
      // Cache updates for 1 hour
      await redisClient.set(cacheKey, JSON.stringify(allUpdates), { EX: 3600 });
      console.log("Updates have been fetched from the database and are now cached.");
    
      // Return all updates
      return allUpdates;
    },

    //applications: [Application]
    //Purpose: Fetch all applications from MongoDB
    //Cache: Cached by list of applications in Redis for one hour

    /*applications: async () => {
      //Cache key constructor and check
      const cacheKey = "applications";
      const cachedApplications = await redisClient.get(cacheKey);

      //If projects are applications, return the parsed JSON (JSON string to object)
      if (cachedApplications) {
        console.log("Returning applications from cache.");
        return JSON.parse(cachedApplications);
      }

      const applications = await applicationCollection();
      const allApplications = await applications.find({}).toArray();

      //If no updates, throw GraphQLError
      // if (allApplications.length === 0) {
      //   throw new GraphQLError("Internal Server Error", {
      //     //INTERNAL_SERVER_ERROR = status code 500
      //     extensions: { code: "INTERNAL_SERVER_ERROR" },
      //   });
      // }

      // Filter out null comments for each application
      allApplications.forEach(application => {
        if (application.comments) {
          application.comments = application.comments.filter(comment => {
            return comment && comment._id && comment.commenter && comment.commenter._id;
          });
        }
      });

      //Cache pulled applications, set to cachekey
      //Expiration: 1 hour (60 x 60 = 3600 seconds)
      await redisClient.set(cacheKey, JSON.stringify(allApplications), {
        EX: 3600,
      });
      console.log(
        "Applications have been fetched from database and are now cached."
      );

      //Return applications
      return allApplications || [];
    },*/

    applications: async () => {
      // Cache key constructor and check
      const cacheKey = "applications";
      const cachedApplications = await redisClient.get(cacheKey);
    
      // If applications are cached, return the parsed JSON (JSON string to object)
      if (cachedApplications) {
        console.log("Returning applications from cache.");
        return JSON.parse(cachedApplications);
      }
    
      // Pull applications collection from MongoDB
      const applications = await applicationCollection();
    
      // Fetch all applications from the database
      const allApplications = await applications.find({}).toArray();
    
      // If no applications are found, throw an error
      if (allApplications.length === 0) {
        console.log("No applications found in the database.");
        return [];
      }
    
      // Cache applications for 1 hour
      await redisClient.set(cacheKey, JSON.stringify(allApplications), {
        EX: 3600,
      });
    
      console.log("Applications have been fetched from the database and are now cached.");
    
      // Return all applications
      return allApplications;
    },
    

    //Query: comments: [Comment]
    //Purpose: Fetch all comments from MongoDB
    //Cache: Cached by list of comments in Redis for one hour

    /*comments: async () => {
      //Cache key constructor and check
      const cacheKey = "comments";
      const cachedComments = await redisClient.get(cacheKey);

      //If comments are cached, return the parsed JSON (JSON string to object)
      if (cachedComments) {
        console.log("Returning comments from cache.");
        const parsedComments = JSON.parse(cachedComments);

        // Filter out comments associated with non-existent updates
        const updates = await updateCollection();
        // Use distinct to create an array of all unique update IDs
        const validUpdateIds = await updates.distinct("_id");

        const applications = await applicationCollection();
        const validApplicationIds = await applications.distinct("_id");

        // Filter out invalid comments
        const filteredComments = parsedComments.filter(comment => {
          
          if (comment.commentDestination === "UPDATE") {
            // Verify that the update associated with this comment exists in the list of valid update IDs
            //So if some of the valid update ids have the comment's destintation id, return true
            return validUpdateIds.some(id => id.equals(new ObjectId(comment.destinationId)));
          }

          if (comment.commentDestination === "APPLICATION") {
            return validApplicationIds.some(id => id.equals(new ObjectId(comment.destinationId)));
          }

          //Returning true within the filter means that we want to keep this comment
          return true; 

        });

        return filteredComments;

      }

      //If not cached, pull commentCollection and the find all [find({})] users
      const comments = await commentCollection();
      const allComments = await comments.find({}).toArray();

      //If no comments, throw GraphQLError
      if (allComments.length === 0) {
        throw new GraphQLError(
          "Comments not able to be pulled from database.",
          {
            //INTERNAL_SERVER_ERROR = status code 500
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }

      //Repeat the filtering of invalid updates related comments like in the cache
      const updates = await updateCollection();
      const validUpdateIds = await updates.distinct("_id");

      const applications = await applicationCollection();
      const validApplicationIds = await applications.distinct("_id");

      // Filter out invalid comments
      const filteredComments = allComments.filter(comment => {
        if (comment.commentDestination === "UPDATE") {
          return validUpdateIds.some(id => id.equals(new ObjectId(comment.destinationId)));
        }
        if (comment.commentDestination === "APPLICATION") {
          return validApplicationIds.some(id => id.equals(new ObjectId(comment.destinationId)));
        }
        return true; 
      });

      //Cache pulled comments, set to cachekey
      //Expiration: 1 hour (60 x 60 = 3600 seconds)
      await redisClient.set(cacheKey, JSON.stringify(filteredComments), {
        EX: 3600,
      });
      console.log(
        "Comments have been fetched from database and are now cached."
      );

      //Return allComments
      return filteredComments;
    },*/

    comments: async () => {
      // Cache key constructor and check
      const cacheKey = "comments";
      const cachedComments = await redisClient.get(cacheKey);
    
      // If comments are cached, return the parsed JSON (JSON string to object)
      if (cachedComments) {
        console.log("Returning comments from cache.");
        return JSON.parse(cachedComments);
      }
    
      // Pull the comments collection from MongoDB
      const comments = await commentCollection();
    
      // Fetch all comments from the database
      const allComments = await comments.find({}).toArray();
    
      // If no comments are found, throw an error
      if (allComments.length === 0) {
        console.log("No comments found in the database.");
        return [];
      }
    
      // Cache comments for 1 hour
      await redisClient.set(cacheKey, JSON.stringify(allComments), { EX: 3600 });
    
      console.log("Comments have been fetched from the database and are now cached.");
    
      // Return all comments
      return allComments;
    },
    
    //GET BY ID

    //getUserById(_id: String!): User
    //Purpose: Fetch an user by ID from MongoDB; check Redis cache first
    //Cache: Cached by user ID in Redis indefinitely

    /*Notes
            The two arguments in the resolver:
                1. `_` (parent): Represents the parent object in the GraphQL resolver chain, ignored here as it is not used.
                2. `args`: Contains the arguments passed to the resolver from the GraphQL query (e.g., args._id in this case).
            */

    getUserById: async (_, args) => {
      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["_id"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Helpers: check objectId
      helpers.checkArg(args._id, "string", "id");

      //Cache key constructor and check
      //Why use 'user:': ensures seperation between types with ids (users, projects, etc); clarity
      const cacheKey = `user:${args._id}`;
      const cachedUser = await redisClient.get(cacheKey);

      //If the cachedUser is cached, return the parsed JSON (JSON string to object)
      if (cachedUser) {
        console.log("Returning user from cache.");
        return JSON.parse(cachedUser);
      }

      //If not cached, pull user collection and then findOne specific user
      const users = await userCollection();
      const user = await users.findOne({ _id: new ObjectId(args._id) });

      //If no user, throw GraphQLError
      if (!user) {
        throw new GraphQLError("User not found in the database.", {
          //Optional object: extra information. NOT_FOUND = status code 404
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      //Set user into redis Cache; set to cacheKey
      //No expiration on cache
      await redisClient.set(cacheKey, JSON.stringify(user));
      console.log("User has been fetched from database and is now cached.");

      //Return user
      return user;
    },

    //getProjectById(_id: String!): Project
    //Purpose: Fetch a project by ID from MongoDB; check Redis cache first
    //Cache: Cached by project ID in Redis indefinitely

    getProjectById: async (_, args) => {
      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["_id"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Helpers: check objectId
      helpers.checkArg(args._id, "string", "id");

      //Cache key constructor and check
      //Why use 'project:': ensures seperation between types with ids; clarity
      const cacheKey = `project:${args._id}`;
      const cachedProject = await redisClient.get(cacheKey);

      //If the project is cached, return the parsed JSON (JSON string to object)
      if (cachedProject) {
        console.log("Returning project from cache.");
        return JSON.parse(cachedProject);
      }

      //If not cached, pull project collection and then findOne specific project
      const projects = await projectCollection();
      const project = await projects.findOne({ _id: new ObjectId(args._id) });

      //If no project, throw GraphQLError

      if (!project) {
        throw new GraphQLError("Project Not Found", {
          //Optional object: extra information. NOT_FOUND = status code 404
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      //Set project into redis Cache; set to cacheKey
      //No expiration on cache
      await redisClient.set(cacheKey, JSON.stringify(project));
      console.log("Project has been fetched from database and is now cached.");

      //Return project
      return project;
    },

    //getUpdateById(_id: String!): Update
    //Purpose: Fetch a update by ID from MongoDB; check Redis cache first
    //Cache: Cached by update ID in Redis indefinitely

    /*getUpdateById: async (_, args) => {
      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          //404
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["_id"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            //404
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Helpers: check objectId
      helpers.checkArg(args._id, "string", "id");

      //Cache key constructor and check
      //Why use 'update:': ensures seperation between types with ids ; clarity
      const cacheKey = `update:${args._id}`;
      const cachedUpdate = await redisClient.get(cacheKey);

      //If the update is cached, return the parsed JSON (JSON string to object)
      if (cachedUpdate) {
        const parsedUpdate = JSON.parse(cachedUpdate);
        // Null check for comments to ensure no invalid data
        if (parsedUpdate.comments) {
          parsedUpdate.comments = parsedUpdate.comments.filter(comment => {
            return comment && comment._id && comment.commenter && comment.commenter._id;
          });
        }
        return parsedUpdate;
      }

      //If not cached, pull the update collection and then findOne based on update id
      const updates = await updateCollection();
      const update = await updates.findOne({ _id: new ObjectId(args._id) });

      //If no update, throw GraphQLError
      if (!update) {
        throw new GraphQLError("Update Not Found", {
          //Optional object: extra information. NOT_FOUND = status code 404
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Null check for comments to ensure no invalid data
      if (update.comments) {
        update.comments = update.comments.filter(comment => {
          return comment && comment._id && comment.commenter && comment.commenter._id;
        });
      }

      //Cache update indefinitely
      await redisClient.set(cacheKey, JSON.stringify(update));
      console.log("Update has been fetched from database and is now cached.");

      //Return update
      return update;
    },*/

    getUpdateById: async (_, args) => {
      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    
      // Check for extra fields
      const fieldsAllowed = ["_id"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }
    
      // Helpers: check ObjectId
      helpers.checkArg(args._id, "string", "id");
    
      // Cache key constructor and check
      const cacheKey = `update:${args._id}`;
      const cachedUpdate = await redisClient.get(cacheKey);
    
      // If the update is cached, return the parsed JSON
      if (cachedUpdate) {
        console.log("Returning update from cache.");
        return JSON.parse(cachedUpdate);
      }
    
      // If not cached, pull the update collection and findOne based on update ID
      const updates = await updateCollection();
      const update = await updates.findOne({ _id: new ObjectId(args._id) });
    
      // If no update, throw GraphQLError
      if (!update) {
        throw new GraphQLError("Update Not Found", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    
      // Cache update indefinitely
      await redisClient.set(cacheKey, JSON.stringify(update));
      console.log("Update has been fetched from database and is now cached.");
    
      // Return update
      return update;
    },
    
    //getApplicationById(_id: String!): Application
    //Purpose: Fetch an application by ID from MongoDB; check Redis cache first
    //Cache: Cached by application ID in Redis indefinitely

    /*getApplicationById: async (_, args) => {
      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          //404
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["_id"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            //404
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Helpers: check objectId
      helpers.checkArg(args._id, "string", "id");

      //Cache key constructor and check
      //Why use 'application:': ensures seperation between types with ids ; clarity
      const cacheKey = `application:${args._id}`;
      const cachedApplication = await redisClient.get(cacheKey);

      //If the application is cached, return the parsed JSON (JSON string to object)
      if (cachedApplication) {
        
        const parsedApplication = JSON.parse(cachedApplication);

        // Filter out null comments
        if (parsedApplication.comments) {
          parsedApplication.comments = parsedApplication.comments.filter(comment => {
            return comment && comment._id && comment.commenter && comment.commenter._id;
          });
        }

        console.log("Returning application from cache.");
        return parsedApplication;
      }

      //If not cached, pull the application collection and then findOne based on application id
      const applications = await applicationCollection();
      const application = await applications.findOne({
        _id: new ObjectId(args._id),
      });

      //If no application, throw GraphQLError
      if (!application) {
        throw new GraphQLError("Application Not Found", {
          //Optional object: extra information. NOT_FOUND = status code 404
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Filter out null comments
      if (application.comments) {
        application.comments = application.comments.filter(comment => {
          return comment && comment._id && comment.commenter && comment.commenter._id;
        });
      }

      //Cache application indefinitely
      await redisClient.set(cacheKey, JSON.stringify(application));
      console.log(
        "Application has been fetched from database and is now cached."
      );

      //Return application
      return application;
    },*/

    getApplicationById: async (_, args) => {
      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    
      // Check for extra fields
      const fieldsAllowed = ["_id"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }
    
      // Helpers: check ObjectId
      helpers.checkArg(args._id, "string", "id");
    
      // Cache key constructor and check
      const cacheKey = `application:${args._id}`;
      const cachedApplication = await redisClient.get(cacheKey);
    
      // If the application is cached, return the parsed JSON
      if (cachedApplication) {
        console.log("Returning application from cache.");
        return JSON.parse(cachedApplication);
      }
    
      // If not cached, pull the application collection and findOne based on application ID
      const applications = await applicationCollection();
      const application = await applications.findOne({
        _id: new ObjectId(args._id),
      });
    
      // If no application, throw GraphQLError
      if (!application) {
        throw new GraphQLError("Application Not Found", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    
      // Cache application indefinitely
      await redisClient.set(cacheKey, JSON.stringify(application));
      console.log("Application has been fetched from database and is now cached.");
    
      // Return application
      return application;
    },

    //getCommentById(_id: String!): Comment
    //Purpose: Fetch a comment by ID from MongoDB; check Redis cache first
    //Cache: Cached by comment ID in Redis indefinitely
    //INCLUDES same filters as fetch all comment

    /*getCommentById: async (_, args) => {
      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["_id"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Helpers: check objectId
      helpers.checkArg(args._id, "string", "id");

      //Cache key constructor and check
      //Why use 'comment:': ensures seperation between types with ids (users, projects, etc); clarity
      const cacheKey = `comment:${args._id}`;
      const cachedComment = await redisClient.get(cacheKey);

      //If the cachedUser is cached, return the parsed JSON (JSON string to object)
      if (cachedComment) {
        console.log("Returning comment from cache.");
        const parsedComment = JSON.parse(cachedComment);

        // Check if the comment's destination is "UPDATE" and validate update ID
        if (parsedComment.commentDestination === "UPDATE") {
          const updates = await updateCollection();
          const validUpdateIds = await updates.distinct("_id");

          if (!validUpdateIds.some(id => id.equals(new ObjectId(parsedComment.destinationId)))) {
            throw new GraphQLError("Comment is associated with a non-existent update.", {
              extensions: { code: "BAD_USER_INPUT" },
            });
          }
          } 

        // Check if the comment's destination is "APPLICATION" and validate application ID
        else if (parsedComment.commentDestination === "APPLICATION") {
          
          const applications = await applicationCollection();
          const validApplicationIds = await applications.distinct("_id");
          
          if (!validApplicationIds.some(id => id.equals(new ObjectId(parsedComment.destinationId)))) {
            throw new GraphQLError("Comment is associated with a non-existent application.", {
              extensions: { code: "BAD_USER_INPUT" },
            });
          }
        }

        return parsedComment;

      }

      //If not cached, pull comment collection and then findOne specific comment
      const comments = await commentCollection();
      const comment = await comments.findOne({ _id: new ObjectId(args._id) });


      //If no comment, throw GraphQLError
      if (!comment) {
        throw new GraphQLError("Comment not found in the database.", {
          //Optional object: extra information. NOT_FOUND = status code 404
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check if the comment's destination is "UPDATE" and validate update ID
      if (comment.commentDestination === "UPDATE") {
        
        const updates = await updateCollection();
        const validUpdateIds = await updates.distinct("_id");

        if (!validUpdateIds.some(id => id.equals(new ObjectId(comment.destinationId)))) {
          throw new GraphQLError("Comment is associated with a non-existent update.", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

      } 
      // Check if the comment's destination is "APPLICATION" and validate application ID
      else if (comment.commentDestination === "APPLICATION") {
        
        const applications = await applicationCollection();
        const validApplicationIds = await applications.distinct("_id");

        if (!validApplicationIds.some(id => id.equals(new ObjectId(comment.destinationId)))) {
          throw new GraphQLError("Comment is associated with a non-existent application.", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Set comment into redis Cache; set to cacheKey
      //No expiration on cache
      await redisClient.set(cacheKey, JSON.stringify(comment));
      console.log("Comment has been fetched from database and is now cached.");

      //Return comment
      return comment;
    },*/

    getCommentById: async (_, args) => {
      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    
      // Check for extra fields
      const fieldsAllowed = ["_id"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }
    
      // Helpers: check ObjectId
      helpers.checkArg(args._id, "string", "id");
    
      // Cache key constructor and check
      const cacheKey = `comment:${args._id}`;
      const cachedComment = await redisClient.get(cacheKey);
    
      if (cachedComment) {
        console.log("Returning comment from cache.");
        return JSON.parse(cachedComment);
      }
    
      // Fetch comment from the database
      const comments = await commentCollection();
      const comment = await comments.findOne({ _id: new ObjectId(args._id) });
    
      if (!comment) {
        throw new GraphQLError("Comment not found in the database.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    
      // Cache comment
      await redisClient.set(cacheKey, JSON.stringify(comment));
      console.log("Comment has been fetched from database and is now cached.");
    
      return comment;
    },
    

    //ADDITIONAL SEARCH FUNCTIONALITIES

    // getProfessorsByProjectId(projectId: String!): [User]
    // Purpose: Fetch all professors of a project by the project ID

    getProfessorsByProjectId: async (_, args) => {
      // Check if required field 'projectId' is present
      if (!args.projectId) {
        throw new GraphQLError("The projectId field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["projectId"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Check objectID
      helpers.checkArg(args.projectId, "string", "id");

      // Cache key constructor and check
      const cacheKey = `professors:${args.projectId}`;
      const cachedProfessors = await redisClient.get(cacheKey);

      //If projects are cached, then return
      if (cachedProfessors) {
        return JSON.parse(cachedProfessors);
      }

      //If not cached, pull entire project collction
      const projects = await projectCollection();

      //Pull all projects associated with the provided projectId using find.
      //Change the string projectId argument into an objectId
      const project = await projects.findOne({
        _id: new ObjectId(args.projectId),
      });

      // Check if project exists
      if (!project) {
        throw new GraphQLError("Project not found in the database.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      /*
      // Extract professors field
      const professors = project.professors || [];

      // Cache the result
      await redisClient.set(cacheKey, JSON.stringify(professors), { EX: 3600 });

      // Return the list of professors
      return professors;*/

      //Pull users
      const users = await userCollection();
      
      //Pull array of professorIds from the project objects
      const professorIds = project.professors || [];

      //Match all professorIds against the user objects. Store in array
      const professors = await users
        .find({ _id: { $in: professorIds.map((id) => new ObjectId(id)) }, role: "PROFESSOR" })
        .toArray();
    
      // Cach
      await redisClient.set(cacheKey, JSON.stringify(professors), { EX: 3600 });
    
      // Return the array of professor User objects
      return professors;
      
    },

    // getStudentsByProjectId(projectId: String!): [User]
    // Purpose: Fetch all students of a project by the project ID

    getStudentsByProjectId: async (_, args) => {
      // Check if required field 'projectId' is present
      if (!args.projectId) {
        throw new GraphQLError("The projectId field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["projectId"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Check objectID
      helpers.checkArg(args.projectId, "string", "id");

      // Cache key constructor and check
      const cacheKey = `students:${args.projectId}`;
      const cachedStudents = await redisClient.get(cacheKey);

      //If projects are cached, then return
      if (cachedStudents) {
        return JSON.parse(cachedStudents);
      }

      //If not cached, pull entire project collction
      const projects = await projectCollection();

      //Pull all projects associated with the provided projectId using find.
      //Change the string projectId argument into an objectId
      const project = await projects.findOne({
        _id: new ObjectId(args.projectId),
      });

      // Check if project exists
      if (!project) {
        throw new GraphQLError("Project not found in the database.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      /*
      // Extract students field
      const students = project.students || [];

      // Cache the result
      await redisClient.set(cacheKey, JSON.stringify(students), { EX: 3600 });

      // Return the list of students
      return students;*/
      //Pull users
      const users = await userCollection();
      
      //Pull array of professorIds from the project objects
      const studentIds = project.students || [];

      //Match all studentIds against the user objects. Store in array
      //ADD the extra match element that their role needs to be STUDENT
      const students = await users
        .find({ _id: { $in: studentIds.map((id) => new ObjectId(id)) }, role: "STUDENT" })
        .toArray();
    
      // Cache
      await redisClient.set(cacheKey, JSON.stringify(students), { EX: 3600 });
    
      // Return the array of student User objects
      return students;
    },

    //GET PROJECT BY USER ID

    getProjectsByUserId: async (_, args) => {
      // Check if required field 'userId' is present
      if (!args._id) {
        throw new GraphQLError("The userId field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["_id"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Check objectID
      helpers.checkArg(args._id, "string", "id");

      //Turn args._id into an object id 
      const userId = args._id;

      //If not cached, pull entire project collction
      const projects = await projectCollection();

      // Fetch all projects where the user is listed in professors or students
      const userProjects = await projects
        .find({
          $or: [
            { professors: userId }, 
            { students: userId },   
          ],
        })
        .toArray();

      // Return the list of projects
      return userProjects;
    },

    // getCommentsByUpdateId(updateId: String!): [Comment]
    // Purpose: Fetch all comments of an update by the update ID

    /*getCommentsByUpdateId: async (_, args) => {
      // Check if required field 'projectId' is present
      if (!args.updateId) {
        throw new GraphQLError("The updateId field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["updateId"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Check objectID
      helpers.checkArg(args.updateId, "string", "id");

      // Cache key constructor and check
      const cacheKey = `comments:${args.updateId}`;
      const cachedComments = await redisClient.get(cacheKey);

      // Filter comments logic (PREVIOUSLY: this is the same filtering done in get all updates and get all applications, but it's nicer to break it into a helper function. Before it was just repeated)
      const filterComments = (comments) => {
        return comments.filter(comment => {
          return comment && comment._id && comment.commenter && comment.commenter._id;
        });
      };

      //If comments are cached, then return
      if (cachedComments) {
        const parsedComments = JSON.parse(cachedComments);
        return filterComments(parsedComments);
      }

      //If not cached, pull entire update collction
      const updates = await updateCollection();

      //Pull all updates associated with the provided updateId using find.
      //Change the string update argument into an objectId
      const update = await updates.findOne({
        _id: new ObjectId(args.updateId),
      });

      //Handle missing update
      if (!update) {
        throw new GraphQLError("Update not found in the database.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

       // Filter comments from the database
      const comments = filterComments(update.comments || []);

      // Cache the result
      await redisClient.set(cacheKey, JSON.stringify(comments), { EX: 3600 });

      // Return the list of comments
      return comments;
    },*/

    getCommentsByUpdateId: async (_, args) => {
     /* // Check if required field 'updateId' (updateId) is present
      if (!updateId) {
        throw new GraphQLError("The updateId field (_id) is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    
      // Check for extra fields
      const fieldsAllowed = ["_id"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }*/

      // Validate the 'updateId' argument
      helpers.checkArg(args.updateId, "string", "updateId");
    
      // Cache key constructor and check
      const cacheKey = `comments:${args.updateId}`;
      const cachedComments = await redisClient.get(cacheKey);
    
      // If comments are cached, return them
      if (cachedComments) {
        console.log("Returning comments from cache.");
        return JSON.parse(cachedComments);
      }
    
      // Fetch comments from the database based on destinationId
      const comments = await commentCollection();
      const fetchedComments = await comments
        .find({ destinationId: args.updateId }) 
        .toArray();
    
      // Cache the result
      await redisClient.set(cacheKey, JSON.stringify(fetchedComments), { EX: 3600 });
    
      // Return the list of comments
      return fetchedComments;
    },

    
    // getCommentsByApplicationId(updateId: String!): [Comment]
    // Purpose: Fetch all comments of an application by the application ID

    /*getCommentsByApplicationId: async (_, args) => {
      // Check if required field 'applicationId' is present
      if (!args.applicationId) {
        throw new GraphQLError("The applicationId field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["applicationId"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Check objectID
      helpers.checkArg(args.applicationId, "string", "id");

      // Cache key constructor and check
      const cacheKey = `comments:${args.applicationId}`;
      const cachedComments = await redisClient.get(cacheKey);

      // Filter comments logic
      const filterComments = (comments) => {
        return comments.filter(comment => {
          return comment && comment._id && comment.commenter && comment.commenter._id;
        });
      };

      //If comments are cached, then return
      if (cachedComments) {
        const parsedComments = JSON.parse(cachedComments);
        return filterComments(parsedComments);
      }

      //If not cached, pull entire application collction
      const applications = await applicationCollection();

      //Pull the application associated with the provided applicationId using find.
      //Change the string update argument into an objectId
      const application = await applications.findOne({
        _id: new ObjectId(args.applicationId),
      });

      //Handle missing application
      if (!application) {
        throw new GraphQLError("Application not found in the database.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Extract comments field
      const comments = filterComments(application.comments || []);

      // Cache the result
      await redisClient.set(cacheKey, JSON.stringify(comments), { EX: 3600 });

      // Return the list of comments
      return comments;
    },*/

    getCommentsByApplicationId: async (_, args) => {
      // Check if required field '_id' (applicationId) is present
      if (!args.applicationId) {
        throw new GraphQLError("The applicationId field (_id) is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    
      // Check for extra fields
      const fieldsAllowed = ["applicationId"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }
    
      // Validate _id as a string
      helpers.checkArg(args.applicationId, "string", "id");
    
      // Cache key constructor and check
      const cacheKey = `comments:${args.applicationId}`;
      const cachedComments = await redisClient.get(cacheKey);
    
      // If comments are cached, return them
      if (cachedComments) {
        console.log("Returning comments from cache.");
        return JSON.parse(cachedComments);
      }
    
      // Fetch comments from the database based on destinationId
      const comments = await commentCollection();
      const fetchedComments = await comments
        .find({ destinationId: args._id }) 
        .toArray();
    
      // Cache the result
      await redisClient.set(cacheKey, JSON.stringify(fetchedComments), { EX: 3600 });
    
      // Return the list of comments
      return fetchedComments;
    },

    //projectsByDepartment(department: Department!): [Project]
    //Purpose: Fetch all projects that match the specified department
    //Cache: Cached by department in Redis for one hour

    projectsByDepartment: async (_, args) => {
      // Check if required fields are present
      if (!args.department) {
        throw new GraphQLError("The department field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["department"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Helpers, checks
      helpers.checkArg(args.department, "string", "department");

      //Cache key constructor and check
      //Cache key: note as department, and then use the provided argument's department as we're pulling based on this
      const cacheKey = `department:${args.department.trim()}`;
      const cachedDepartment = await redisClient.get(cacheKey);

      //If the department is cached, return the parsed JSON (JSON string to object)
      if (cachedDepartment) {
        console.log("Returning projects from stated department from cache.");
        return JSON.parse(cachedDepartment);
      }

      //If department not cached, pull the project collection then all project with the specific department
      //Use the '.find' function again, but this time, use match the department (as oppposed to the id as usual)
      const projects = await projectCollection();
      const projectsByDepartmnet = await projects
        .find({ department: args.department.trim() })
        .toArray();

      //If no projects by department found, retrun an empty array
      if (projectsByDepartmnet.length === 0) {
        console.log("No projects found for the department.");
        //Why empty array and not throw error? Allowing the possibility that projects of this department simply not added yet.
        return [];
      }

      //Cache the departmnet for one hour.
      //Expiration: 1 hour (60 x 60 = 3600 seconds)
      await redisClient.set(cacheKey, JSON.stringify(projectsByDepartmnet), {
        EX: 3600,
      });
      console.log(
        "Projects by department have been fetched from database and are now cached."
      );

      //Return the projectsByDepartment
      return projectsByDepartmnet;
    },

    //updatesBySubject(subject: UpdateSubject!): [Update]
    //Purpose: Fetch all updates that match the specified subject
    //Cache: Cached by subject in Redis for one hour
    //FILTERS out null comments, the same logic implemented in fetch all updates

    /*updatesBySubject: async (_, args) => {
      // Check if required fields are present
      if (!args.subject) {
        throw new GraphQLError("The subject field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["subject"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Helpers,checks
      helpers.checkArg(args.subject, "string", "subject");
      helpers.checkSubject(args.subject);

      //Cache key constructor and check
      //Cache key: note as subject, and then use the provided argument's subject as we're pulling based on this
      const cacheKey = `subject:${args.subject.trim()}`;
      const cachedSubject = await redisClient.get(cacheKey);

      //If the subject is cached, return the parsed JSON (JSON string to object)
      if (cachedSubject) {
        console.log("Returning updates from stated subject from cache.");
        
        const parsedUpdates = JSON.parse(cachedSubject);

        // Filter out null comments for each update
        parsedUpdates.forEach(update => {
          if (update.comments) {
            update.comments = update.comments.filter(comment => {
              return comment && comment._id && comment.commenter && comment.commenter._id;
            });
          }
        });

        return parsedUpdates;

      }

      //If subject not cached, pull the update collection then all update with the specific subject
      //Use the '.find' function again, but this time, use match the subject (as oppposed to the id as usual)
      const updates = await updateCollection();
      const updatesBySubject = await updates
        .find({ subject: args.subject.trim() })
        .toArray();

      //If no projects by subject found, retrun an empty array
      if (updatesBySubject.length === 0) {
        console.log("No updates found for the subject.");
        //Why empty array and not throw error? Allowing the possibility that updates of this subjects simply not added yet.
        return [];
      }

      // Filter out null comments for each update
      updatesBySubject.forEach(update => {
        if (update.comments) {
          update.comments = update.comments.filter(comment => {
            return comment && comment._id && comment.commenter && comment.commenter._id;
          });
        }
      });

      //Cache the subject for one hour.
      //Expiration: 1 hour (60 x 60 = 3600 seconds)
      await redisClient.set(cacheKey, JSON.stringify(updatesBySubject), {
        EX: 3600,
      });
      console.log(
        "Updates by subject have been fetched from database and are now cached."
      );

      //Return the updatesBySubject
      return updatesBySubject;
    },*/

    // updatesBySubject(subject: UpdateSubject!): [Update]
    // Purpose: Fetch all updates that match the specified subject
    // Cache: Cached by subject in Redis for one hour

    updatesBySubject: async (_, args) => {
      // Check if required fields are present
      if (!args.subject) {
        throw new GraphQLError("The subject field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["subject"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      // Helpers, checks
      // Validate subject as a string
      helpers.checkArg(args.subject, "string", "subject");

      // Ensure subject matches the enum of UpdateSubject
      helpers.checkSubject(args.subject);

      // Cache key constructor and check
      // Cache key: note as subject, and then use the provided argument's subject as we're pulling based on this
      const cacheKey = `subject:${args.subject.trim()}`;
      const cachedSubject = await redisClient.get(cacheKey);

      // If the subject is cached, return the parsed JSON (JSON string to object)
      if (cachedSubject) {
        console.log("Returning updates from stated subject from cache.");
        return JSON.parse(cachedSubject);
      }

      // If subject not cached, pull the update collection then all updates with the specific subject
      // Use the '.find' function to match the subject (instead of the ID as usual)
      const updates = await updateCollection();
      const updatesBySubject = await updates
        .find({ subject: args.subject.trim() })
        .toArray();

      // If no updates by subject found, return an empty array
      if (updatesBySubject.length === 0) {
        console.log("No updates found for the subject.");
        // Why empty array and not throw error? Allowing the possibility that updates of this subject have simply not been added yet.
        return [];
      }

      // Cache the subject for one hour.
      // Expiration: 1 hour (60 x 60 = 3600 seconds)
      await redisClient.set(cacheKey, JSON.stringify(updatesBySubject), {
        EX: 3600,
      });
      console.log(
        "Updates by subject have been fetched from database and are now cached."
      );

      // Return the updatesBySubject
      return updatesBySubject;
    },


    //projectsByCreatedYear(min: Int!, max: Int!): [Project]
    //Purpose: Fetch all projects established within a min/max year range
    //Cache: Cached by year range in Redis for one hour

    projectsByCreatedYear: async (_, args) => {
      const { min, max } = args;
      const currentYear = new Date().getFullYear();

      // Check for extra fields
      const fieldsAllowed = ["min", "max"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }
      //Checks
      //CheckArg will be enough this time for the checking of required fields.
      helpers.checkYearRange(min, max);
      helpers.checkArg(min, "number", "min");
      helpers.checkArg(max, "number", "max");

      //Cache key constructor and check
      //Cache key: note as createYear, and then use the provided argument's createYear as we're pulling based on this
      const cacheKey = `createdYear:${min}:${max}`;
      const cachedProjectsByYear = await redisClient.get(cacheKey);

      if (cachedProjectsByYear) {
        console.log("Returning projects by stated years from cache.");
        return JSON.parse(cachedProjectsByYear);
      }

      //If no projects cached by year established, then pull all projects
      const projects = await projectCollection();

      // Turn projects into an array to allow for filtering.
      const allProjects = await projects.find({}).toArray();

      // Filter projects based on year range by converting string dates to Date objects
      const projectsByCreatedRange = allProjects.filter((project) => {
        
        if (!project.createdDate) return false;

        const projectYear = new Date(project.createdDate).getFullYear();

        //Return the boolean based on if the year is within the provided range
        return projectYear >= min && projectYear <= max;

      });

      if (projectsByCreatedRange.length === 0) {
        console.log("For the specified year range, no projects found.");
        return [];
      }

      //Cache the projectsByCreatedRange for one hour.
      //Expiration: 1 hour (60 x 60 = 3600 seconds)
      await redisClient.set(cacheKey, JSON.stringify(projectsByCreatedRange), {
        EX: 3600,
      });
      console.log(
        "Projects for this year range have been fetched from database and are now cached."
      );

      //Return the projects from within the range
      return projectsByCreatedRange;
    },

    //searchProjectByTitle(searchTerm: String!): [Project]
    //Purpose: Search projects by title, case-insensitive
    //Cache: Cached by search term in Redis for one hour

    searchProjectByTitle: async (_, args) => {
      // Check if required field 'searchTerm' is present
      if (!args.searchTerm) {
        throw new GraphQLError("The searchTerm field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["searchTerm"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Checks
      helpers.checkArg(args.searchTerm, "string", "searchTerm");

      // Ensure case-insensitive caching by making the search term lowercase
      const lowercaseSearchTerm = args.searchTerm.toLowerCase().trim();

      // Cache key constructor and check
      // Cache key: note as search term for project
      const cacheKey = `search:project:${lowercaseSearchTerm}`;
      const cachedProjectsByTitle = await redisClient.get(cacheKey);

      //If projects cached based on search term, return
      if (cachedProjectsByTitle) {
        console.log("Returning projects found by search term from cache.");
        return JSON.parse(cachedProjectsByTitle);
      }

      //If projects not cached based on search term, pull the project collection
      const projects = await projectCollection();

      //Use the '.find' function again
      //$regex: regular expression for pattern matching, $options: 'i' for case-insensitive search
      const projectsByTitle = await projects
        .find({ title: { $regex: args.searchTerm.trim(), $options: "i" } })
        .toArray();

      // If no projects are found, return an empty array
      if (projectsByTitle.length === 0) {
        console.log("No projects found matching the given search term.");
        return [];
      }

      //Set projectsByTitle to cache based on cacheKey
      await redisClient.set(cacheKey, JSON.stringify(projectsByTitle), {
        EX: 3600,
      });

      //Return the projects found by search term (for title)
      return projectsByTitle;
    },

    //searchUserByName(searchTerm: String!): [User]
    //Purpose: Search users by name, case-insensitive
    //Cache: Cached by search term in Redis for one hour

    searchUserByName: async (_, args) => {
      // Check if required field 'searchTerm' is present
      if (!args.searchTerm) {
        throw new GraphQLError("The searchTerm field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["searchTerm"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      // Checks
      helpers.checkArg(args.searchTerm, "string", "searchTerm");

      // Ensure case-insensitive caching by mamkaing the search term lowercase
      const lowercaseSearchTerm = args.searchTerm.toLowerCase().trim();

      // Cache key constructor and check
      // Cache key: note as search term for user
      const cacheKey = `search:user:${lowercaseSearchTerm}`;
      const cachedUsersBySearch = await redisClient.get(cacheKey);

      //If users cachedUsersBySearch by searchTerm, return
      if (cachedUsersBySearch) {
        console.log("Returning searched users from cache.");
        return JSON.parse(cachedUsersBySearch);
      }

      //If users not cached by search term, then pull user collection
      const users = await userCollection();

      //Use the '.find' function again
      // $regex: regular expression for pattern matching, $options: 'i' for case-insensitive search
      const usersBySearch = await users
        .find({
          $or: [
            { firstName: { $regex: args.searchTerm.trim(), $options: "i" } },
            { lastName: { $regex: args.searchTerm.trim(), $options: "i" } },
          ],
        })
        .toArray();

      //If no user for search term, return an empty array
      if (usersBySearch.length === 0) {
        console.log("A user was not found matching the search criteria.");
        return [];
      }

      //Cache the usersBySearch for one hour.
      //Expiration: 1 hour (60 x 60 = 3600 seconds)
      await redisClient.set(cacheKey, JSON.stringify(usersBySearch), {
        EX: 3600,
      });
      console.log(
        "Searched users were fetched from database and are now cached."
      );

      //Return the users pulled based on search term (name)
      return usersBySearch;
    },
  },

  //COMPUTED VALUES
  //For user, project, update

    User: {

      numOfApplications: async (parentValue) => {
        const applications = await applicationCollection();
        const numOfApplications = await applications.countDocuments({
          applicantId: parentValue._id.toString(),
        });
        return numOfApplications || 0;
      },
  
      applications: async (parentValue) => {
        const applications = await applicationCollection();
        const userApplications = await applications
          .find({
            applicantId: parentValue._id.toString(),
          })
          .toArray();
        return userApplications || [];
      },
  
      numOfProjects: async (parentValue) => {
        const projects = await projectCollection();
        const numOfProjects = await projects.countDocuments({
          $or: [
            { professors: parentValue._id.toString() },
            { students: parentValue._id.toString() },
          ],
        });
        return numOfProjects || 0;
      },
  
      projects: async (parentValue) => {
        const projects = await projectCollection();
        const userProjects = await projects
          .find({
            $or: [
              { professors: parentValue._id.toString() },
              { students: parentValue._id.toString() },
            ],
          })
          .toArray();
        return userProjects || [];
      },
    },
  
    Project: {

      numOfApplications: async (parentValue) => {
        const applications = await applicationCollection();
        const numOfApplications = await applications.countDocuments({
          projectId: parentValue._id.toString(),
        });
        return numOfApplications || 0;
      },
  
      applications: async (parentValue) => {
        const applications = await applicationCollection();
        const projectApplications = await applications
          .find({ projectId: parentValue._id.toString() })
          .toArray();
        return projectApplications || [];
      },
  
      numOfUpdates: async (parentValue) => {
        const updates = await updateCollection();
        const numOfUpdates = await updates.countDocuments({
          projectId: parentValue._id.toString(),
        });
        return numOfUpdates || 0;
      },
  
      updates: async (parentValue) => {
        const updates = await updateCollection();
        const projectUpdates = await updates
          .find({ projectId: parentValue._id.toString() })
          .toArray();
        return projectUpdates || [];
      },
  
      professors: async (parentValue) => {
        const users = await userCollection();
        if (!parentValue.professors || !Array.isArray(parentValue.professors)) {
          return [];
        }
        const projectProfessors = await users
          .find({
            _id: { $in: parentValue.professors.map((id) => new ObjectId(id)) },
            role: "PROFESSOR",
          })
          .toArray();
        return projectProfessors || [];
      },
  
      students: async (parentValue) => {
        const users = await userCollection();
        if (!parentValue.students || !Array.isArray(parentValue.students)) {
          return [];
        }
        const projectStudents = await users
          .find({
            _id: { $in: parentValue.students.map((id) => new ObjectId(id)) },
            role: "STUDENT",
          })
          .toArray();
        return projectStudents || [];
      },
    },
  
    Update: {

      posterUser: async (parentValue) => {
        const users = await userCollection();
        const posterUser = await users.findOne({ _id: new ObjectId(parentValue.posterUserId) });
        
        //Provide a fallback object for poster if not found (probably from being deleted)
        if (!posterUser) {
          console.warn(`User not found for posterUserId: ${parentValue.posterUserId}`);
          return {
            _id: "unknown",
            firstName: "Unknown",
            lastName: "User",
            email: "unknown@example.com",
            role: "STUDENT",
            department: "COMPUTER_SCIENCE",
            bio: "User not found.",
          };
        }
        return posterUser;
      },
  
      project: async (parentValue) => {
        const projects = await projectCollection();
        const project = await projects.findOne({ _id: new ObjectId(parentValue.projectId) });
      
        //Provide a fallback object for project if not found (probably from being deleted)
        if (!project) {
          console.warn(`Project not found for projectId: ${parentValue.projectId}`);
          return {
            _id: "unknown",
            title: "Unknown Project",
            description: "Project not found.",
            createdDate: new Date().toISOString(),
            department: "COMPUTER_SCIENCE",
          };
        }
        return project;
      },
  
      comments: async (parentValue) => {
        const comments = await commentCollection();
        const updateComments = await comments
          .find({ destinationId: parentValue._id.toString() })
          .toArray();
        return updateComments || [];
      },
  
      numOfComments: async (parentValue) => {
        const comments = await commentCollection();
        const numOfComments = await comments.countDocuments({
          destinationId: parentValue._id.toString(),
        });
        return numOfComments || 0;
      },
    },
  
    Application: {
      applicant: async (parentValue) => {
        const users = await userCollection();
        const applicant = await users.findOne({ _id: new ObjectId(parentValue.applicantId) });
        
      //Provide a fallback object for applicant if not found (probably from being deleted)
        if (!applicant) {
          console.warn(`Applicant not found for applicantId: ${parentValue.applicantId}`);
          return {
            _id: "unknown",
            firstName: "Unknown",
            lastName: "User",
            email: "unknown@example.com",
            role: "STUDENT",
            department: "COMPUTER_SCIENCE",
            bio: "User not found.",
          };
        }
        return applicant;
      },
  
      project: async (parentValue) => {
        const projects = await projectCollection();
        const project = await projects.findOne({ _id: new ObjectId(parentValue.projectId) });
        
        //Provide a fallback object for project if not found (probably from being deleted)
        if (!project) {
          console.warn(`Project not found for projectId: ${parentValue.projectId}`);
          return {
            _id: "unknown",
            title: "Unknown Project",
            description: "Project not found.",
            createdDate: new Date().toISOString(),
            department: "COMPUTER_SCIENCE",
          };
        }
        return project;
      },
  
      comments: async (parentValue) => {
        const comments = await commentCollection();
        const applicationComments = await comments
          .find({ destinationId: parentValue._id.toString() })
          .toArray();
        return applicationComments || [];
      },
  
      numOfComments: async (parentValue) => {
        const comments = await commentCollection();
        const numOfComments = await comments.countDocuments({
          destinationId: parentValue._id.toString(),
        });
        return numOfComments || 0;
      },
    },
  
    Comment: {
      commenter: async (parentValue) => {
        const users = await userCollection();
        const commenter = await users.findOne({ _id: new ObjectId(parentValue.commenterId) });
        
        //Provide a fallback object for commenter if not found (probably from being deleted)
        if (!commenter) {
          console.warn(`Commenter not found for commenterId: ${parentValue.commenterId}`);
          return {
            _id: "unknown",
            firstName: "Unknown",
            lastName: "User",
            email: "unknown@example.com",
            role: "STUDENT",
            department: "COMPUTER_SCIENCE",
            bio: "User not found.",
          };
        }
        return commenter;
      },
    },

Mutation: {

  addUser: async (_, args) => {
    //Have to go before traditional checks. Why? confirm they exist before you use them.
    //Check if required fields there
    if (
      !args.firstName ||
      !args.lastName ||
      !args.email ||
      !args.password ||
      !args.role ||
      !args.department
    ) {
      throw new GraphQLError(
        "To create a user, their first name, last name, email, password, role and department must be provided.",
        {
          extensions: { code: "BAD_USER_INPUT" },
        }
      );
    }

    //Check that no extra fields provided
    const fieldsAllowed = [
      "firstName",
      "lastName",
      "email",
      "password",
      "role",
      "department",
      "bio",
    ];
    for (let key in args) {
      if (!fieldsAllowed.includes(key)) {
        throw new GraphQLError(`Unexpected field '${key}' provided.`, {
          //Similar status code: 404
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    }

    //Checks
    helpers.checkArg(args.firstName, "string", "name");
    helpers.checkArg(args.lastName, "string", "name");
    helpers.checkArg(args.email, "string", "email");
    helpers.checkArg(args.password, "string", "password");
    helpers.checkArg(args.role, "string", "role");
    helpers.checkArg(args.department, "string", "department");
    if (args.bio) {
      helpers.checkArg(args.bio, "string", "bio");
    }


    //Pull user collection
    const users = await userCollection();

    //Extra email check for duplicates
    const existingUser = await users.findOne({ email: args.email.trim() });

    if (existingUser) {
      throw new GraphQLError("Email already exists.", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    // Creates a new user in Firebase Authentication with email, password, and display name.
    // Managed by Firebase for authentication purposes.
    const userRecord = await admin.auth().createUser({
      email: args.email,
      password: args.password,
      displayName: `${args.firstName} ${args.lastName}`,
    });

    // Create a User object, toAddUser, using the arguments, set objectId
    const toAddUser = {
      _id: new ObjectId(),
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      email: args.email.trim(),
      // //TO DO: Confirm we're happy with this hashing approach
      // password: await bcrypt.hash(args.password.trim(), 10),
      role: args.role.trim().toUpperCase(),
      department: args.department.trim().toUpperCase(),
      bio: args.bio ? args.bio.trim() : null, //If bio exists, trim, else, null
      //applications: [],
      //projects: [],
      //numOfApplications: 0,
      //numOfProjects: 0,
      //channels: [],
    };

    //Use insertOne to add the user to the users' collection
    let addedUser = await users.insertOne(toAddUser);

    //If user not added scuccessfully, throw a GraphQLError
    if (!addedUser.acknowledged || !addedUser.insertedId) {
      throw new GraphQLError(
        `The user could not be added to the collection.`,
        {
          //Similar to status code 500
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        }
      );
    }

    //REDIS operations

    try {
      //Add user to the redis cache
      const cacheKey = `user:${toAddUser._id}`;
      await redisClient.set(cacheKey, JSON.stringify(toAddUser));

      // Clear the 'users' in the cache bc this is no longer accurate
      await redisClient.del("users");
    } catch (error) {
      console.error("Redis operation failed:", error);

      throw new GraphQLError(
        "Failed to update Redis cache after adding the user.",
        {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            cause: error.message,
          },
        }
      );
    }

    //Return user without exposing password
    const { password, ...safeUser } = toAddUser; //Destructure: extract password, gather the rest of properties into safeuser
    return safeUser;
  },

  // editUser
    // Purpose: Edit an existing user by ID
    // Cache: Update the Redis cache accordingly

    editUser: async (_, args) => {
      // Check if required field '_id' is present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    
      // Check that no extra fields are provided
      const fieldsAllowed = [
        "_id",
        "firstName",
        "lastName",
        "email",
        "password",
        "role",
        "department",
        "bio",
      ];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }
    
      // Checks
      helpers.checkArg(args._id, "string", "id");
    
      // Convert _id string to ObjectId
      const userId = new ObjectId(args._id);
    
      // Pull the user collection and find the user to update
      const users = await userCollection();
      let userToUpdate = await users.findOne({ _id: userId });
    
      if (!userToUpdate) {
        throw new GraphQLError("The user ID provided is invalid.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    
      // Object to hold fields to update
      const updateFields = {};
    
      // If pulling the user was successful
      if (userToUpdate) {
        // First Name update
        if (args.firstName) {
          helpers.checkArg(args.firstName, "string", "name");
          updateFields.firstName = args.firstName.trim();
        }
    
        // Last Name update
        if (args.lastName) {
          helpers.checkArg(args.lastName, "string", "name");
          updateFields.lastName = args.lastName.trim();
        }
    
        // Email update
        if (args.email) {
          helpers.checkArg(args.email, "string", "email");
          updateFields.email = args.email.trim();
        }
    
        // Password update
        if (args.password) {
          try {
            const firebaseUser = await admin.auth().getUserByEmail(userToUpdate.email);
            await admin.auth().updateUser(firebaseUser.uid, {
              password: args.password.trim(),
            });
          } catch (error) {
            if (error.code === "auth/user-not-found") {
              throw new GraphQLError(
                "The user does not exist in Firebase Authentication. Password update failed.",
                { extensions: { code: "BAD_USER_INPUT", cause: error.message } }
              );
            }
            throw new GraphQLError("Failed to update the user's password in Firebase Authentication.", {
              extensions: { code: "INTERNAL_SERVER_ERROR", cause: error.message },
            });
          }
        }
    
        // Role update
        if (args.role) {
          helpers.checkArg(args.role, "string", "role");
          updateFields.role = args.role.trim().toUpperCase();
        }
    
        // Department update
        if (args.department) {
          helpers.checkArg(args.department, "string", "department");
          updateFields.department = args.department.trim().toUpperCase();
        }
    
        // Bio update
        if (args.bio) {
          helpers.checkArg(args.bio, "string", "bio");
          updateFields.bio = args.bio.trim();
        }
    
        // Use updateOne, matching the _id to the args._id
        const result = await users.updateOne({ _id: userId }, { $set: updateFields });
    
        if (result.modifiedCount === 0) {
          throw new GraphQLError(
            `The user with ID ${args._id} was not successfully updated.`,
            { extensions: { code: "INTERNAL_SERVER_ERROR" } }
          );
        }
    
        try {
          // Delete the individual user cache
          await redisClient.del(`user:${args._id}`);
          await redisClient.del("users");
        } catch (error) {
          console.error("Redis operation failed:", error);
          throw new GraphQLError("Failed to update Redis cache after editing the user.", {
            extensions: { code: "INTERNAL_SERVER_ERROR", cause: error.message },
          });
        }
      }
    
      // Return updated user without exposing password
      const updatedUser = { ...userToUpdate, ...updateFields };
      const { password, ...safeUser } = updatedUser;
      return safeUser;
    },    

    removeUser: async (_, args) => {
      //Overkill? Already accomplsihed by helpers? TBD at a later date
      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          //Similar status code: 404
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["_id"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            //Similar status code: 404
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Checks
      helpers.checkArg(args._id, "string", "id");

      // Convert _id string to ObjectId
      const userId = new ObjectId(args._id);

      //Pull the user and application collections
      const users = await userCollection();

      //Use findOneAndDelete to remove user from the user collection
      const deletedUser = await users.findOneAndDelete({ _id: userId });

      //If user could not be deleted, throw GraphQLError.
      if (!deletedUser) {
        throw new GraphQLError(
          `Failed to delete user with this ID (${args._id}). Failed to either find or delete.`,
          {
            //Similar to status code 404
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      //Propagate this removal across all objects with user objects
      /*
      await propagators.propagateUserRemovalChanges(args._id);*/

      //Remove related reference ids
      const applications = await applicationCollection();
      const updates = await updateCollection();
      const comments = await commentCollection();

      const deletedApplications = await applications.deleteMany({ applicantId: args._id });
      const deletedUpdates = await updates.deleteMany({ posterUserId: args._id });
      const deletedComments = await comments.deleteMany({ commenterId: args._id });

      // Delete the users and projects cache, as they are no longer accurate; and individual user cache
      try {
        await redisClient.del("users");
        // await redisClient.del("applications");
        await redisClient.del(`user:${args._id}`);
        console.log("Redis cache updated for user deletion.");
      } catch (error) {
        console.error("Failed to update Redis cache:", error);
        throw new GraphQLError(
          "Failed to update Redis cache after removing the user.",
          {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              cause: error.message,
            },
          }
        );
      }

      //Return the value of the deleted user
      return deletedUser;
    },

    // addProject
    // Purpose: Create a new project and add it to MongoDB
    // Cache: Add the project to the Redis cache


    addProject: async (_, args) => {
      // Check if required fields are present
      if (!args.title || !args.department) {
        throw new GraphQLError(
          "The title and department are required to create a project.",
          {
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      // Check for extra fields
      const fieldsAllowed = [
        "title",
        "description",
        "department",
        "professorIds",
        "studentIds",
      ];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      // Validate arguments
      helpers.checkArg(args.title, "string", "title");
      helpers.checkArg(args.department, "string", "department");
      if (args.professorIds) {
        helpers.checkArg(args.professorIds, "array", "professorIds");
        args.professorIds.forEach((id) => helpers.checkArg(id, "string", "id"));
      }
      if (args.studentIds) {
        helpers.checkArg(args.studentIds, "array", "studentIds");
        args.studentIds.forEach((id) => helpers.checkArg(id, "string", "id"));
      }

      // Prepare professor and student IDs
      const toAddProfessorIds = args.professorIds ? args.professorIds.map((id) => id.trim()) : [];
      const toAddStudentIds = args.studentIds ? args.studentIds.map((id) => id.trim()) : [];

      // Pull project collection
      const projects = await projectCollection();

      // Create a new project object
      const newProject = {
        _id: new ObjectId(),
        title: args.title.trim(),
        createdDate: new Date().toISOString(),
        description: args.description ? args.description.trim() : null,
        department: args.department.trim(),
        professors: toAddProfessorIds, //strings of user IDs
        students: toAddStudentIds, //strings of user IDs
      };

      // Insert the new project into the database
      const insertedProject = await projects.insertOne(newProject);

      // Confirm it was added. If it was not, throw an error.
      if (!insertedProject.acknowledged || !insertedProject.insertedId) {
        throw new GraphQLError(`Could not add project.`, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }

      // Update Redis cache
      try {
        // Add the project as an individual project cache
        const cacheKey = `project:${newProject._id}`;
        await redisClient.set(cacheKey, JSON.stringify(newProject));

        // Delete the projects cache, as it's no longer accurate
        await redisClient.del("projects");
      } catch (error) {
        console.error("Failed to update Redis cache:", error);
        throw new GraphQLError(
          "Failed to update Redis cache after adding the project.",
          {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              cause: error.message,
            },
          }
        );
      }

      return newProject;
    },

    // editProject
    // Purpose: Edit an existing project by ID
    // Cache: Update the Redis cache accordingly

    editProject: async (_, args) => {
      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = [
        "_id",
        "title",
        "department",
        "description",
        "professorIds",
        "studentIds",
        "applicationIds",
      ];

      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            // Similar status code: 404
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Checks
      helpers.checkArg(args._id, "string", "id");
      const projectId = new ObjectId(args._id);

      //Pull projects collection
      const projects = await projectCollection();

      //Use findOne to get the project to be edited
      //Use to set values to locally before adding back to the MongoDb
      const projectToUpdate = await projects.findOne({ _id: projectId });

      if (!projectToUpdate) {
        throw new GraphQLError(`Project with ID ${args._id} does not exist.`, {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      //Create object to hold fields that will be updated
      const updateFields = {};


      //Name Update
      if (args.title) {
        helpers.checkArg(args.title, "string", "title");
        updateFields.title = args.title.trim();
      }

      if (args.description) {
        helpers.checkArg(args.description, "string", "description");
        updateFields.description = args.description.trim();
      }

      //Location Update
      if (args.department) {
        helpers.checkArg(args.department, "string", "department");
        updateFields.department = args.department.trim().toUpperCase();
      }

      if (args.professorIds) {
        /*helpers.checkArg(args.professorIds, "array", "professorIds");
        updateFields.professors = [];
        const users = await userCollection();

        for (const id of args.professorIds) {

          helpers.checkArg(id, "string", "id");

          //let newProfessor = await getUserById(id);
          let newProfessor = await users.findOne({ _id: new ObjectId(id)});

          if (newProfessor) {
            updateFields.professors.push(newProfessor);
          }

        }*/

          helpers.checkArg(args.professorIds, "array", "professorIds");
          args.professorIds.forEach((id) => helpers.checkArg(id, "string", "id"));
          updateFields.professors = args.professorIds.map((id) => id.trim());

      }

      if (args.studentIds) {
        
        /*helpers.checkArg(args.studentIds, "array", "studentIds");
        updateFields.students = [];
        const users = await userCollection();

        for (const id of args.studentIds) {
          helpers.checkArg(id, "string", "id");
          //let newStudent = getUserById(id);
          let newStudent = await users.findOne({ _id: new ObjectId(id)});

          if (newStudent) {
            updateFields.students.push(newStudent);
          }
        }*/
          helpers.checkArg(args.studentIds, "array", "studentIds");
          args.studentIds.forEach((id) => helpers.checkArg(id, "string", "id"));
          updateFields.students = args.studentIds.map((id) => id.trim());
      }

      //Applications
      //Now modeled after how professors and students arrays are edited.
      if (args.applicationIds) {
        
        helpers.checkArg(args.applicationIds, "array", "applicationIds");
        args.applicationIds.forEach((id) => helpers.checkArg(id, "string", "id"));
        updateFields.applications = args.applicationIds.map((id) => id.trim());

        /*helpers.checkArg(args.applicationIds, "array", "applicationIds");
        
        updateFields.applications = [];
        
        const applications = await applicationCollection();
      
        for (const id of args.applicationIds) {
          
          helpers.checkArg(id, "string", "id");
      
          const application = await applications.findOne({ _id: new ObjectId(id) });
      
          if (!application) {
            console.warn(`Application with ID ${id} does not exist. Skipping.`);
            continue; // Skip this invalid application ID
          }
      
          // Add the valid application to the updated applications array
          updateFields.applications.push(application);*/
        }

        //Use updateOne, matching the _id to the args._id. Note: the ID cannot be updated
        // $set: updates specific fields of a document without overwriting the entire document
        const result = await projects.updateOne(
          { _id: projectId},
          { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
          throw new GraphQLError(
            `The project with ID ${args._id} was not successfully updated.`,
            {
              extensions: { code: "INTERNAL_SERVER_ERROR" },
            }
          );
        }

        /*
        //Propagate this edit across all objects with project objects
        await propagators.propagateProjectEditChanges(args._id, {
          ...projectToUpdate,
          ...updateFields,
        });*/

        // Fetch the updated project data after successful update
        //const updatedProject = { ...projectToUpdate, ...updateFields };
        const updatedProject = await projects.findOne({ _id: projectToUpdate._id });

        if (!updatedProject) {
          throw new GraphQLError("Failed to fetch updated project data after update.", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }

        //Try/catch for redis
        try {
          // Delete the projects cache as it's now out of date
          await redisClient.del("projects");

          //Update the projects's individual cache;
          await redisClient.set(
            `project:${args._id}`,
            JSON.stringify(updatedProject)
          );
        } catch (error) {
          console.error("Failed to update Redis cache:", error);
          throw new GraphQLError(
            "Failed to update Redis cache after updating the project.",
            {
              extensions: {
                code: "INTERNAL_SERVER_ERROR",
                cause: error.message,
              },
            }
          );
        }

        //Return the updated project object, which shows the new field values
        return updatedProject;
      },

      removeProject: async (_, args) => {
        // Validate input
        if (!args._id) {
          throw new GraphQLError("The _id field is required.", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
        helpers.checkArg(args._id, "string", "id");
      
        // Pull collections
        const projects = await projectCollection();
        const updates = await updateCollection();
        const applications = await applicationCollection();
      
        // Find the project to delete
        const projectToDelete = await projects.findOne({ _id: new ObjectId(args._id) });
      
        if (!projectToDelete) {
          throw new GraphQLError(`Project with ID ${args._id} not found.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      
        // Delete related updates and applications
        try {
          const updates = await updateCollection();
          const applications = await applicationCollection();
          const deletedUpdates = await updates.deleteMany({ projectId: args._id });
          const deletedApplications = await applications.deleteMany({ projectId: args._id });
      
          console.log(
            `Deleted ${deletedUpdates.deletedCount} updates and ${deletedApplications.deletedCount} applications for project ${args._id}`
          );
        } catch (error) {
          console.error("Error cleaning up dependencies:", error);
          throw new GraphQLError("Failed to delete related updates or applications.", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }
      
        // Delete the project itself
        const deletedProject = await projects.findOneAndDelete({
          _id: new ObjectId(args._id),
        });
      
        if (!deletedProject) {
          throw new GraphQLError(
            `The project with ID ${args._id} was not successfully found or deleted.`,
            {
              extensions: { code: "BAD_USER_INPUT" },
            }
          );
        }
      
        return deletedProject;
      },

      // addUpdate
    // Purpose: Create a new update and add it to MongoDB
    // Cache: Add the updaet to the Redis cache

    addUpdate: async (_, args) => {
      // Check if required fields are present
      if (!args.posterId || !args.subject || !args.content || !args.projectId) {
        throw new GraphQLError(
          "The posterId, subject, content, and projectId.",
          {
            //404
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      // Check for extra fields
      const fieldsAllowed = ["posterId", "subject", "content", "projectId"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            //404
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Checks
      helpers.checkArg(args.posterId, "string", "id");
      helpers.checkArg(args.subject, "string", "subject");
      helpers.checkArg(args.content, "string", "content");
      helpers.checkArg(args.projectId, "string", "id");

      //Pull update, project, and user collection
      const updates = await updateCollection();
      const projects = await projectCollection();
      const users = await userCollection();

      // Use findOne to get the user and the project based on the args
      // Need to ensure these exist (adding a update does not add these into their respective mongodbs)
      const user = await users.findOne({ _id: new ObjectId(args.posterId) });
      const project = await projects.findOne({
        _id: new ObjectId(args.projectId),
      });

      //If there isn't an user or a project, then throw a GraphQLError
      if (!user || !project) {
        throw new GraphQLError("The user or project ID was not valid.", {
          //Similar status code: 404
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      //Create a new update object, set the values to be those pulled from the arguments
      //Make sure to create a new ObjectId for the update, but also change the project and user id's to be object ids
      const updateToAdd = {
        _id: new ObjectId(),
        posterUserId: args.posterId.trim(),
        projectId: args.projectId.trim(),
        subject: args.subject.trim(),
        content: args.content.trim(),
        postedDate: new Date().toISOString(), // ISO format: 2024-01-01T00:00:00.000Z
      };

      //Add the update to the updates collection using insertOne
      let addedUpdate = await updates.insertOne(updateToAdd);

      //If the update was not successfully added, then throw a GraphQLError
      if (!addedUpdate.acknowledged || !addedUpdate.insertedId) {
        throw new GraphQLError(`Could not add update.`, {
          //Similar status code: 500
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }

      try {
        //Set update into redis Cache; set to cacheKey
        //No expiration on cache
        const cacheKey = `update:${updateToAdd._id}`;
        await redisClient.set(cacheKey, JSON.stringify(updateToAdd));

        // Delete cache for updates, as these are no longer accurate
        await redisClient.del("updates");
      } catch (error) {
        console.error("Failed to update Redis cache:", error);
        throw new GraphQLError(
          "Failed to update Redis cache after adding the update.",
          {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              cause: error.message,
            },
          }
        );
      }

      //return the added update
      return updateToAdd;
    },


 // editUpdate
    // Purpose: Edit an existing update by ID
    // Cache: Update the Redis cache accordingly

    editUpdate: async (_, args) => {
      // Validate required fields
      helpers.checkArg(args._id, "string", "id");

      // Validate optional fields
      if (args.posterId) helpers.checkArg(args.posterId, "string", "id");
      if (args.subject) helpers.checkArg(args.subject, "string", "subject");
      if (args.content) helpers.checkArg(args.content, "string", "content");
      if (args.projectId) helpers.checkArg(args.projectId, "string", "id");

      // Pull the updates collection
      const updates = await updateCollection();

      // Fetch the update to be edited
      let updateToUpdate = await updates.findOne({ _id: new ObjectId(args._id) });
      if (!updateToUpdate) {
        throw new GraphQLError(`The update with ID ${args._id} could not be found.`, {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Update fields
      if (args.posterId) {
        const users = await userCollection();
        const user = await users.findOne({ _id: new ObjectId(args.posterId) });
        if (!user) {
          throw new GraphQLError("Invalid poster ID.", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
        updateToUpdate.posterUserId = args.posterId.trim();
      }

      if (args.subject) {
        helpers.checkSubject(args.subject);
        updateToUpdate.subject = args.subject.trim();
      }

      if (args.content) {
        updateToUpdate.content = args.content.trim();
      }

      if (args.projectId) {
        const projects = await projectCollection();
        const project = await projects.findOne({ _id: new ObjectId(args.projectId) });
        if (!project) {
          throw new GraphQLError("Invalid project ID.", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
        updateToUpdate.projectId = args.projectId.trim();
      }

      // Update the update in the database
      const result = await updates.updateOne(
        { _id: new ObjectId(args._id) },
        { $set: updateToUpdate }
      );

      if (result.modifiedCount === 0) {
        throw new GraphQLError(
          `Failed to update the update with ID ${args._id}.`,
          {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }

      // Update Redis cache
      try {
        await redisClient.del("updates"); // Clear updates cache
        await redisClient.set(`update:${args._id}`, JSON.stringify(updateToUpdate)); // Set individual cache
      } catch (error) {
        console.error("Failed to update Redis cache:", error);
        throw new GraphQLError(
          "Failed to update Redis cache after editing the update.",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR", cause: error.message },
          }
        );
      }

      // Return the updated update
      return updateToUpdate;
    },

    // removeUpdate
    // Purpose: Remove a update by ID
    // Cache: Remove the update from the Redis cache

    removeUpdate: async (_, args) => {
      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          //404
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["_id"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            //404
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }
      //Checks
      helpers.checkArg(args._id, "string", "id");

      //Pull update collection
      const updates = await updateCollection();

      // Use findOneAndDelete to remove the update from update collection
      const deletedUpdate = await updates.findOneAndDelete({
        _id: new ObjectId(args._id),
      });

      if (!deletedUpdate.value) {
        throw new GraphQLError(
          `Could not find or delete update with ID of ${args._id}`,
          {
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }      

      //Remove related reference ids
      const deletedComments = await comments.deleteMany({ destinationId: args._id });

      // Update Redis cache
      try {
        // Delete the updates as these are outdate
        await redisClient.del("updates");
        // Delete the individual cache for this update
        await redisClient.del(`update:${args._id}`);
      } catch (error) {
        console.error("Failed to update Redis cache:", error);
        throw new GraphQLError(
          "Failed to update Redis cache after deleting the update.",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR", cause: error.message },
          }
        );
      }

      // Return the deleted update object
      //Value because findOneAndDelete also returns metadata
      return deletedUpdate;
    },


    //addApplication

    addApplication: async (_, args) => {
      // Check if required fields are present
      if (!args.applicantId || !args.projectId) {
        throw new GraphQLError(
          "The applicantId and projectId fields are required.",
          {
            //404
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      // Check for extra fields
      const fieldsAllowed = ["applicantId", "projectId"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            //404
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Checks
      helpers.checkArg(args.applicantId, "string", "id");
      helpers.checkArg(args.projectId, "string", "id");

      //Pull users, projects and applications collections
      const users = await userCollection();
      const projects = await projectCollection();
      const applications = await applicationCollection();

      //Use findOne to pull the user in question, using the args.userId as the _id to match
      const matchedUser = await users.findOne({
        _id: new ObjectId(args.applicantId),
      });
      const matchedProject = await projects.findOne({
        _id: new ObjectId(args.projectId),
      });

      //If a user cannot be pulled from the collection, throw an GraphQLError
      if (!matchedUser) {
        throw new GraphQLError(
          "The applicant ID provided by the user was not valid.",
          {
            //Similar status code: 404
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      //If a project cannot be pulled from the collection, throw an GraphQLError
      if (!matchedProject) {
        throw new GraphQLError(
          "The project ID provided by the user was not valid.",
          {
            //Similar status code: 404
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      //Create a local object to hold the args values, and set the id to a new objectID
      const applicationToAdd = {
        _id: new ObjectId(),
        applicantId: args.applicantId.trim(),
        projectId: args.projectId.trim(),
        applicationDate: new Date().toISOString(),
        lastUpdatedDate: new Date().toISOString(),
        status: "PENDING",
      };

      //Use insertOne to add the local application object to the applications collection
      let addedApplication = await applications.insertOne(applicationToAdd);

      //If adding the application was not successful, then throw a GraphQLError
      if (!addedApplication.acknowledged || !addedApplication.insertedId) {
        throw new GraphQLError(
          "The application provided by the user could not be added.",
          {
            //Similar status code: 500
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }

     /* // Propagate changes
      await propagators.propagateApplicationAdditionChanges(
        applicationToAdd._id.toString(),
        applicationToAdd
      );*/

      try {
        //Add the individual application cache
        const cacheKey = `application:${applicationToAdd._id}`;
        await redisClient.set(cacheKey, JSON.stringify(applicationToAdd));

        //Delete the applications cache, as this is now out of date.'
        await redisClient.del("applications");
      } catch (error) {
        console.error("Failed to update Redis cache:", error);
        throw new GraphQLError(
          "Failed to update Redis cache after adding the application.",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR", cause: error.message },
          }
        );
      }

      //Return the local applicationToAdd object, which will be without the meta data
      return applicationToAdd;
    },

    editApplication: async (_, args) => {

      console.log("editApplication called with args:", args);

      // Validate required fields
      helpers.checkArg(args._id, "string", "id");
    
      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    
      // Validate allowed fields
      const fieldsAllowed = ["_id", "applicantId", "projectId", "status"];
      Object.keys(args).forEach((key) => {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      });
    
      // Pull applications collection
      console.log("Fetching application collection...");
      const applications = await applicationCollection();
    
      // Find the application
      console.log(`Looking for application with ID: ${args._id}`);
      let applicationToUpdate = await applications.findOne({
        _id: new ObjectId(args._id),
      });
    
      if (!applicationToUpdate) {
        throw new GraphQLError(
          `Application with ID ${args._id} not found.`,
          { extensions: { code: "BAD_USER_INPUT" } }
        );
      }
    
      // Update applicantId if provided
      if (args.applicantId) {
        helpers.checkArg(args.applicantId, "string", "id");
        const users = await userCollection();
        const applicant = await users.findOne({ _id: new ObjectId(args.applicantId) });
    
        if (!applicant) {
          throw new GraphQLError("The provided applicantId is not valid.", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
    
        applicationToUpdate.applicantId = args.applicantId.trim();
      }
    
      // Update projectId if provided
      if (args.projectId) {
        helpers.checkArg(args.projectId, "string", "id");
        const projects = await projectCollection();
        const project = await projects.findOne({ _id: new ObjectId(args.projectId) });
    
        if (!project) {
          throw new GraphQLError("The provided projectId is not valid.", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
    
        applicationToUpdate.projectId = args.projectId.trim();
      }
    
      // Update status if provided
      if (args.status) {
        helpers.checkArg(args.status, "string", "applicationStatus");
        applicationToUpdate.status = args.status.trim();
      }
    
      // Update the application in MongoDB
      const result = await applications.updateOne(
        { _id: new ObjectId(args._id) },
        { $set: applicationToUpdate }
      );
    
      if (result.modifiedCount === 0) {
        throw new GraphQLError(
          `Failed to update the application with ID ${args._id}.`,
          { extensions: { code: "INTERNAL_SERVER_ERROR" } }
        );
      }
    
      // Update Redis cache
      try {
        // Delete the outdated cache
        await redisClient.del("applications");
    
        // Set the updated application in the cache
        const cacheKey = `application:${args._id}`;
        await redisClient.set(cacheKey, JSON.stringify(applicationToUpdate));
      } catch (error) {
        console.error("Failed to update Redis cache:", error);
        throw new GraphQLError(
          "Failed to update Redis cache after editing the application.",
          { extensions: { code: "INTERNAL_SERVER_ERROR", cause: error.message } }
        );
      }
    
      // Return the updated application
      return applicationToUpdate;
    },

    removeApplication: async (_, args) => {
      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          //404
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["_id"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            //404
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Checks
      helpers.checkArg(args._id, "string", "id");

      //Pull the applicationCollection
      const applications = await applicationCollection();

      //Use findOneAndDelete to remove the applciation from the collection, based on matching the _ids (arg and application)
      const deletedApplication = await applications.findOneAndDelete({
        _id: new ObjectId(args._id),
      });

      //Confirm that the deletedApplication has a value. If not, throw a GraphQLError
      if (!deletedApplication) {
        throw new GraphQLError(
          "Could not find or delete application with the provided ID.",
          {
            //Similar status code: 404
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      //Remove related reference ids
      const comments = await commentCollection();
      const deletedComments = await comments.deleteMany({ destinationId: args._id });

      //Propagate this removal across all objects with application objects
      //await propagators.propagateApplicationRemovalChanges(args._id);

      //Delete the individual application cache, and the applications cache, as this is now out of data
      await redisClient.del(`application:${args._id}`);
      await redisClient.del("applications");

      //Return the value of deletedApplication
      return deletedApplication;
    },

    addComment: async (_, args) => {
      console.log("addComment resolver called with args:", args);
    
      // Check if required fields are present
      if (!args.commenterId || !args.destinationId || !args.content) {
        throw new GraphQLError(
          "All fields (commenterId, destinationId, content) are required.",
          {
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }
    
      // Validate arguments
      helpers.checkArg(args.commenterId, "string", "id");
      helpers.checkArg(args.destinationId, "string", "id");
      helpers.checkArg(args.content, "string", "content");
    
      // Pull commenter details
      const users = await userCollection();
      const commenter = await users.findOne({ _id: new ObjectId(args.commenterId) });
    
      if (!commenter) {
        console.error(`No user found with commenterId: ${args.commenterId}`);
        throw new GraphQLError(
          `The commenter with ID ${args.commenterId} does not exist.`,
          {
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }
    
      // Check destinationId exists in either updates or applications
      const updates = await updateCollection();
      const applications = await applicationCollection();
    
      const isUpdate = await updates.findOne({ _id: new ObjectId(args.destinationId) });
      const isApplication = await applications.findOne({
        _id: new ObjectId(args.destinationId),
      });
    
      if (!isUpdate && !isApplication) {
        console.error(
          `No valid destination found for destinationId: ${args.destinationId}`
        );
        throw new GraphQLError(
          `The destination ID ${args.destinationId} does not exist.`,
          {
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }
    
      // Create the comment object
      const newComment = {
        _id: new ObjectId(),
        commenterId: args.commenterId.trim(),
        content: args.content.trim(),
        postedDate: new Date().toISOString(),
        destinationId: args.destinationId.trim(),
      };
    
      console.log("New comment object created:", newComment);
    
      // Insert the comment into the comments collection
      const comments = await commentCollection();
      const insertedComment = await comments.insertOne(newComment);
    
      if (!insertedComment) {
        throw new GraphQLError("Failed to add the comment.", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    
      console.log("Comment successfully inserted into database:", insertedComment);
  
        
      // Update Redis cache
      try {
        console.log("Updating Redis cache for comment...");
        const cacheKey = `comment:${newComment._id}`;
        await redisClient.set(cacheKey, JSON.stringify(newComment));
        await redisClient.del("comments");
        console.log("Redis cache updated successfully.");
      } catch (redisError) {
        console.error("Failed to update Redis cache:", redisError);
        throw new GraphQLError("Failed to update Redis cache after adding the comment.", {
          extensions: { code: "INTERNAL_SERVER_ERROR", cause: redisError.message },
        });
      }
    
      // Return the added comment
      return newComment;
    },

    editComment: async (_, args) => {
      console.log("editComment resolver called with args:", args);
    
      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    
      // Validate allowed fields
      const fieldsAllowed = ["_id", "content", "commenterId"];
      Object.keys(args).forEach((key) => {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      });
    
      // Validate arguments
      helpers.checkArg(args._id, "string", "id");
      if (args.content) {
        helpers.checkArg(args.content, "string", "content");
      }
      if (args.commenterId) {
        helpers.checkArg(args.commenterId, "string", "id");
      }
    
      // Pull the comments collection
      const comments = await commentCollection();
    
      // Find the comment by ID
      const commentToUpdate = await comments.findOne({ _id: new ObjectId(args._id) });
    
      if (!commentToUpdate) {
        throw new GraphQLError(
          `The comment with ID ${args._id} does not exist.`,
          {
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }
    
      // Object to hold fields to update
      const updateFields = {};
    
      // Update content if provided
      if (args.content) {
        updateFields.content = args.content.trim();
      }
    
      // Update commenterId if provided
      if (args.commenterId) {
        const users = await userCollection();
        const commenter = await users.findOne({ _id: new ObjectId(args.commenterId) });
    
        if (!commenter) {
          throw new GraphQLError(
            `User with ID ${args.commenterId} does not exist.`,
            {
              extensions: { code: "BAD_USER_INPUT" },
            }
          );
        }
    
        updateFields.commenterId = args.commenterId.trim();
      }
    
      // Update the comment in the database
      const result = await comments.updateOne(
        { _id: commentToUpdate._id },
        { $set: updateFields }
      );
    
      if (result.modifiedCount === 0) {
        throw new GraphQLError(
          `Failed to update the comment with ID ${args._id}.`,
          {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }
    
      // Merge updates with the original comment
      const updatedComment = { ...commentToUpdate, ...updateFields };
    
      // Update Redis cache
      try {
        const cacheKey = `comment:${commentToUpdate._id}`;
        await redisClient.set(cacheKey, JSON.stringify(updatedComment));
        await redisClient.del("comments");
  
      } catch (error) {
        console.error("Failed to update Redis cache:", error);
        throw new GraphQLError(
          "Failed to update Redis cache after editing the comment.",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR", cause: error.message },
          }
        );
      }
    
      console.log("Comment successfully updated:", updatedComment);
    
      // Return the updated comment
      return updatedComment;
    },
    removeComment: async (_, args) => {
      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          //404
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["_id"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            //404
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Checks
      helpers.checkArg(args._id, "string", "id");

      //Pull the commentCollection
      const comments = await commentCollection();

      //Use findOneAndDelete to remove the comment from the collection, based on matching the _ids (arg and comment)
      const deletedComment = await comments.findOneAndDelete({
        _id: new ObjectId(args._id),
      });

      //Confirm deletedComment the deletedComment has a value. If not, throw a GraphQLError
      if (!deletedComment) {
        throw new GraphQLError(
          "Could not find or delete comment with the provided ID.",
          {
            //Similar status code: 404
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      //Propagate this removal across all objects with user objects
      //await propagators.propagateCommentRemovalChanges(args._id);

      try {
        await redisClient.del(`comment:${args._id}`);
        await redisClient.del("comments");
      } catch (error) {
        console.error("Failed to update Redis cache:", error);
        throw new GraphQLError(
          "Failed to update Redis cache after removing the comment.",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR", cause: error.message },
          }
        );
      }

      //Return the value of deletedComment
      return deletedComment;
    },

    login: async (_, { token }) => {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const uid = decodedToken.uid;
        const email = decodedToken.email;
        const users = await userCollection();
        const user = await users.findOne({ email: email });
        return {
          message: "Token verified successfully",
          _id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email,
          role: user.role,
        };
      } catch (error) {
        throw new Error("Invalid or expired token");
      }
    },
  
},

};

export default resolvers;