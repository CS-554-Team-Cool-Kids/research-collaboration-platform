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
import * as propagators from "./propagationHelpers.js";

//RESOLVERS
export const resolvers = {
  //QUERIES
  Query: {
    // //WELCOME MESSAGES
    //     welcome_student: async () => {
    //         return "Welcome! Enjoy our research collaboration platform from student";
    //     },

    //     welcome_professor: async () => {
    //         return "Welcome! Enjoy our research collaboration platform from professor";
    //       },

    //FETCH ALL

    //Query: users: [User]
    //Purpose: Fetch all users from MongoDB
    //Cache: Cached by list of users in Redis for one hour

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
        throw new GraphQLError("Users not able to be pulled from database.", {
          //INTERNAL_SERVER_ERROR = status code 500
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
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
        throw new GraphQLError("Internal Server Error", {
          //INTERNAL_SERVER_ERROR = status code 500
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
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

    updates: async () => {
      //Cache key constructor and check
      const cacheKey = "updates";
      const cachedUpdates = await redisClient.get(cacheKey);

      //If projects are updates, return the parsed JSON (JSON string to object)
      if (cachedUpdates) {
        console.log("Returning updates from cache.");
        return JSON.parse(cachedUpdates);
      }

      const updates = await updateCollection();
      const allUpdates = await updates.find({}).toArray();

      //If no updates, throw GraphQLError
      if (allUpdates.length === 0) {
        throw new GraphQLError("Internal Server Error", {
          //INTERNAL_SERVER_ERROR = status code 500
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }

      //Cache pulled updates, set to cachekey
      //Expiration: 1 hour (60 x 60 = 3600 seconds)
      await redisClient.set(cacheKey, JSON.stringify(allUpdates), { EX: 3600 });
      console.log(
        "Updates have been fetched from database and are now cached."
      );

      //Return updates
      return allUpdates;
    },

    //applications: [Application]
    //Purpose: Fetch all applications from MongoDB
    //Cache: Cached by list of applications in Redis for one hour

    applications: async () => {
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
    },

    //Query: comments: [Comment]
    //Purpose: Fetch all comments from MongoDB
    //Cache: Cached by list of comments in Redis for one hour

    comments: async () => {
      //Cache key constructor and check
      const cacheKey = "comments";
      const cachedComments = await redisClient.get(cacheKey);

      //If comments are cached, return the parsed JSON (JSON string to object)
      if (cachedComments) {
        console.log("Returning comments from cache.");
        return JSON.parse(cachedComments);
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

      //Cache pulled comments, set to cachekey
      //Expiration: 1 hour (60 x 60 = 3600 seconds)
      await redisClient.set(cacheKey, JSON.stringify(allComments), {
        EX: 3600,
      });
      console.log(
        "Comments have been fetched from database and are now cached."
      );

      //Return allComments
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

    getUpdateById: async (_, args) => {
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
        console.log("Returning update from cache.");
        return JSON.parse(cachedUpdate);
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

      //Cache update indefinitely
      await redisClient.set(cacheKey, JSON.stringify(update));
      console.log("Update has been fetched from database and is now cached.");

      //Return update
      return update;
    },

    //getApplicationById(_id: String!): Application
    //Purpose: Fetch an application by ID from MongoDB; check Redis cache first
    //Cache: Cached by application ID in Redis indefinitely

    getApplicationById: async (_, args) => {
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
        console.log("Returning application from cache.");
        return JSON.parse(cachedApplication);
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

      //Cache application indefinitely
      await redisClient.set(cacheKey, JSON.stringify(application));
      console.log(
        "Application has been fetched from database and is now cached."
      );

      //Return application
      return application;
    },

    //getCommentById(_id: String!): Comment
    //Purpose: Fetch a comment by ID from MongoDB; check Redis cache first
    //Cache: Cached by comment ID in Redis indefinitely

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

      //Helpers: check objectId
      helpers.checkArg(args._id, "string", "id");

      //Cache key constructor and check
      //Why use 'comment:': ensures seperation between types with ids (users, projects, etc); clarity
      const cacheKey = `comment:${args._id}`;
      const cachedComment = await redisClient.get(cacheKey);

      //If the cachedUser is cached, return the parsed JSON (JSON string to object)
      if (cachedComment) {
        console.log("Returning comment from cache.");
        return JSON.parse(cachedComment);
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

      //Set comment into redis Cache; set to cacheKey
      //No expiration on cache
      await redisClient.set(cacheKey, JSON.stringify(comment));
      console.log("Comment has been fetched from database and is now cached.");

      //Return comment
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

      // Extract professors field
      const professors = project.professors || [];

      // Cache the result
      await redisClient.set(cacheKey, JSON.stringify(professors), { EX: 3600 });

      // Return the list of professors
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

      // Extract students field
      const students = project.students || [];

      // Cache the result
      await redisClient.set(cacheKey, JSON.stringify(students), { EX: 3600 });

      // Return the list of students
      return students;
    },

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
      const userId = new ObjectId(args._id);


      //If not cached, pull entire project collction
      const projects = await projectCollection();

      //Pull all projects associated with the provided userId using find.
      //Change the string userId argument into an objectId
      //$elemMatch: MongoDB query operator; match documents that contain an array with at least one element satisfying criteria
      const userProjects = await projects
        .find({ professors: { $elemMatch: { _id: userId } } })
        .toArray();

      // Return the list of projects
      return userProjects;
    },

    // getCommentsByUpdateId(updateId: String!): [Comment]
    // Purpose: Fetch all comments of an update by the update ID

    getCommentsByUpdateId: async (_, args) => {
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

      //If comments are cached, then return
      if (cachedComments) {
        return JSON.parse(cachedComments);
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

      // Extract comments field
      const comments = update.comments || [];

      // Cache the result
      await redisClient.set(cacheKey, JSON.stringify(comments), { EX: 3600 });

      // Return the list of comments
      return comments;
    },

    // getCommentsByApplicationId(updateId: String!): [Comment]
    // Purpose: Fetch all comments of an application by the application ID

    getCommentsByApplicationId: async (_, args) => {
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

      //If comments are cached, then return
      if (cachedComments) {
        return JSON.parse(cachedComments);
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
      const comments = application.comments || [];

      // Cache the result
      await redisClient.set(cacheKey, JSON.stringify(comments), { EX: 3600 });

      // Return the list of comments
      return comments;
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
        return JSON.parse(cachedSubject);
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

      // Use the '.find' function to query projects within the specified year range.
      // MongoDB's '$expr' allows for dynamic queries using expressions, which is needed to extract the year from the 'createdDate' field.
      // '$year' extracts the year from the 'createdDate' ISO date field stored in the database.
      // '$gte' (greater than or equal to) and '$lte' (less than or equal to) are MongoDB operators used to ensure the year falls inclusively within the 'min' and 'max' range.
      // '$and' to combine conditions
      const projectsByCreatedRange = await projects
        .find({
          $expr: {
            $and: [
              { $gte: [{ $year: "$createdDate" }, min] },
              { $lte: [{ $year: "$createdDate" }, max] },
            ],
          },
        })
        .toArray();

      //If no projects in stated range found, return an empty array
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
    // numOfApplications
    // Purpose: Compute the number of applications a user has submitted by counting the applications with the matching userId
    // parentValue = User object; numOfApplications appears in the User object
    // How this works: queries applicationCollections and counts collections with that userId

    numOfApplications: async (parentValue) => {
      //Pull application collection
      const applications = await applicationCollection();

      //Use countDocuments to count applications where the applicant's id is the parent value (user's) id
      const numOfApplications = await applications.countDocuments({
        "applicant._id": new ObjectId(parentValue._id),
      });

      //Return the count of the number of applications, to then be used as numOfApplications in user object
      return numOfApplications || 0;
    },

    // numOfProjects
    // Purpose: Compute the number of projects a user is involved in by counting the projects with the matching user in professor or student fields
    // parentValue = User object; a.k.a. numOfProjects appears in the User object
    // How this works: queries projectCollection and counts projects with that user in the students or professors array

    numOfProjects: async (parentValue) => {
      //Pull application collection
      const projects = await projectCollection();

      //Use countDocuments to count projects where the user is a professor or a student
      const numOfProjects = await projects.countDocuments({
        // $or: Matches documents where at least one of the specified conditions is true
        $or: [
          {
            "professors._id":
              typeof parentValue._id === "string"
                ? new ObjectId(parentValue._id)
                : parentValue._id,
          },
          {
            "students._id":
              typeof parentValue._id === "string"
                ? new ObjectId(parentValue._id)
                : parentValue._id,
          },
        ],
      });

      //Return the count of the number of projects, to then be used as numOfProjects in user object
      return numOfProjects || 0;
    },

    // projects
    // Purpose: Retrieve all the projects the user is involved in
    // parentValue = user object; projects appears in the user object
    projects: async (parentValue) => {
      //Pull project collection
      const projects = await projectCollection();

      //Use find to pull matches when the projects's user's id matches the parent value's id
      const userProjects = await projects
        .find({
          // $or: Matches documents where at least one of the specified conditions is true
          $or: [
            {
              "professors._id":
                typeof parentValue._id === "string"
                  ? new ObjectId(parentValue._id)
                  : parentValue._id,
            },
            {
              "students._id":
                typeof parentValue._id === "string"
                  ? new ObjectId(parentValue._id)
                  : parentValue._id,
            },
          ],
        })
        //Notes: MongoDb returns a cursor (pointer to the answer), toArray provides this as an array
        .toArray();

      //Return the array of projects, to then be used as projects in user object
      return userProjects || [];
    },
    // applications
    // Purpose: Retrieve all the applications the user has submitted
    // parentValue = user object; applications appears in the user object

    applications: async (parentValue) => {
      //Pull project collection
      const applications = await applicationCollection();

      //Use find to pull matches when the projects's user's id matches the parent value's id
      const userApplications = await applications
        .find({
          "applicant._id": new ObjectId(parentValue._id),
        })
        //Notes: MongoDb returns a cursor (pointer to the answer), toArray provides this as an array
        .toArray();

      //Return the array of applications, to then be used as applications in user object
      return userApplications || [];
    },
  },

  Project: {

    applications: async (parentValue) => {
      // Pull the applications collection
      const applications = await applicationCollection();
      // Query all applications where project._id matches this project’s _id
      const projectApplications = await applications
        .find({ "project._id": new ObjectId(parentValue._id) })
        .toArray();
        
      return projectApplications;
    },

    // numOfApplications
    // Purpose: Compute the number of applications there are for a specific project
    // parentValue = Project object; numOfApplicants will appear in the Project object
    // How this works: queries applicantCollection and counts applications that have the project listed

    numOfApplications: async (parentValue) => {
      //Pull application collection
      const applications = await applicationCollection();

      //Use countDocuments to count applications where the project's id matches the parent's id
      const numOfApplications = await applications.countDocuments({
        "project._id": new ObjectId(parentValue._id),
      });

      //Return the count of the number of applications, to then be used as numOfApplications in project object
      return numOfApplications || 0;
    },

    // numOfUpdates
    // Purpose: Compute the number of updates there are for a specific project
    // parentValue = Project object; numOfUpdates will appear in the Project object
    // How this works: queries updatesCollection and counts updates where the project's id matches the parent's id

    numOfUpdates: async (parentValue) => {
      //Pull update collection
      const updates = await updateCollection();

      //Use countDocuments to count updates where the update's id is the parent value (project's) id
      const numOfUpdates = await updates.countDocuments({
        "project._id": new ObjectId(parentValue._id),
      });

      //Return the count of the number of applications, to then be used as numOfUpdates in project object
      return numOfUpdates || 0;
    },
  },

  Application: {
    // numOfComments
    // Purpose: Compute the number of comments under each application
    // parentValue = application object, numOfComments appears in the application object

    numOfComments: async (parentValue) => {
      //If there are comments, return the length or zero.
      return parentValue.comments ? parentValue.comments.length : 0;
    },
  },

  Update: {
    // numOfComments
    // Purpose: Compute the number of comments under each update
    // parentValue = update object, numOfComments appears in the update object

    numOfComments: async (parentValue) => {
      //If there are comments, return the length or zero.
      return parentValue.comments ? parentValue.comments.length : 0;
    },
  },

  Mutation: {
    // addUser
    // Purpose: Create a new user and add it to MongoDB
    // Cache: Add the user to the Redis cache; also clears users cache as it's now  innacurate

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
        applications: [],
        projects: [],
        numOfApplications: 0,
        numOfProjects: 0,
        channels: [],
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
      //Have to go before traditional checks. Why? confirm they exist before you use them.
      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          //Similar status code: 404
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
        "projectRemovalId",
        "projectEditId",
        "applicationRemovalId",
        "applicationEditId",
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
      helpers.checkArg(args._id, "string", "id");

      // Convert _id string to ObjectId
      const userId = new ObjectId(args._id);

      //Pull the user colleciton, and use findOne to match the _id to the args._id (converted to objected ID)
      const users = await userCollection();

      //Use find one to have a local object to add updates to.
      let userToUpdate = await users.findOne({ _id: userId });

      if (!userToUpdate) {
        throw new GraphQLError("The user ID provided is invalid.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      //Object to hold fields to update
      const updateFields = {};

      //If pulling the user was successful
      if (userToUpdate) {
        //Update according to what values are provided in the argument. Check every if, don't return. Ensures multiple values can be updated at once.

        //First Name update
        if (args.firstName) {
          helpers.checkArg(args.firstName, "string", "name");
          updateFields.firstName = args.firstName.trim();
        }

        //Last Name update
        if (args.lastName) {
          helpers.checkArg(args.lastName, "string", "name");
          updateFields.lastName = args.lastName.trim();
        }

        //Email update
        if (args.email) {
          helpers.checkArg(args.email, "string", "email");
          updateFields.email = args.email.trim();
        }

        //TO DO: Update how passwords are reset
        //password update
        if (args.password) {
          helpers.checkArg(args.password, "string", "password");
          updateFields.password = await bcrypt.hash(args.password.trim(), 10);
        }

        //role update
        if (args.role) {
          helpers.checkArg(args.role, "string", "role");
          updateFields.role = args.role.trim().toUpperCase();
        }

        //department update
        if (args.department) {
          helpers.checkArg(args.department, "string", "department");
          updateFields.department = args.department.trim().toUpperCase();
        }

        //Bio update
        if (args.bio) {
          helpers.checkArg(args.bio, "string", "bio");
          updateFields.bio = args.bio.trim();
        }

        //Project Removal Id
        if (args.projectRemovalId) {
         
          helpers.checkArg(args.projectRemovalId, "string", "id");
          
          const newProjectArray = (userToUpdate.projects || []).filter(
            (project) =>
              !project._id.equals(new ObjectId(args.projectRemovalId))
          );

          updateFields.projects = newProjectArray;
        }

        //Project Edit Id
        if (args.projectEditId) {
          
          helpers.checkArg(args.projectEditId, "string", "id");

          const updatedProjectId = new ObjectId(args.projectEditId);
          
          //Pull the updated project
          const updatedProject = await getProjectById(args.projectEditId);

          if (!updatedProject) {
            throw new GraphQLError("Project with the given ID does not exist.", {
              extensions: { code: "BAD_USER_INPUT" },
            });
          }
          
          // Replace the old project with the updated version
          const updatedProjectArray = (userToUpdate.projects || []).map((project) => {
            // Check if the current project matches the projectEditId
            if (project._id.equals(updatedProjectId)) {
              // Replace with the updated project if the project id matches
              return updatedProject; 
            }
            // Retrun the project as-is if its id doesn't match
            return project; 
          });

          updateFields.projects = updatedProjectArray;

        }

        //Application Removal Id
        if (args.applicationRemovalId) {
          helpers.checkArg(args.applicationRemovalId, "string", "id");
          const newApplicationArray = (userToUpdate.applications || []).filter(
            (application) =>
              !application._id.equals(new ObjectId(args.applicationRemovalId))
          );
          updateFields.applications = newApplicationArray;
        }

        //Applications Edit Id
        //Line by line comments available in projects edit id. This mirrors that code.
        if (args.applicationEditId) {
          helpers.checkArg(args.applicationEditId, "string", "id");
        
          const updatedApplicationId = new ObjectId(args.applicationEditId);
        
          const updatedApplication = await getApplicationById(args.applicationEditId);
        
          if (!updatedApplication) {
            throw new GraphQLError("Application with the given ID does not exist.", {
              extensions: { code: "BAD_USER_INPUT" },
            });
          }
        
          const updatedApplicationArray = (userToUpdate.applications || []).map((application) => {
            if (application._id.equals(updatedApplicationId)) {
              return updatedApplication;
            }
            return application;
          });
        
          updateFields.applications = updatedApplicationArray;
        }

        //Use updateOne, matching the _id to the args._id. Note: the ID cannot be updated
        // $set: updates specific fields of a document without overwriting the entire document
        const result = await users.updateOne(
          { _id: userId },
          { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
          throw new GraphQLError(
            `The user with ID ${args._id} was not successfully updated.`,
            {
              extensions: { code: "INTERNAL_SERVER_ERROR" },
            }
          );
        }

        //Propagate this removal across all objects with user objects
        await propagators.propagateUserEditChanges(userId, {
          ...userToUpdate,
          ...updateFields,
        });

        try {
          // Delete the individual user cache (data no longer accurate)
          await redisClient.del(`user:${args._id}`);

          // Delete the cache of users, as it's now out of date
          await redisClient.del("users");
        } catch (error) {
          console.error("Redis operation failed:", error);

          throw new GraphQLError(
            "Failed to update Redis cache after editing the user.",
            {
              extensions: {
                code: "INTERNAL_SERVER_ERROR",
                cause: error.message,
              },
            }
          );
        }
      } else {
        //Throw GraphQLError if something went wrong when pulling and updating the user Id
        throw new GraphQLError(
          `The user was not successfully updated. Either the user wasn't found or the update for user with ID of ${args._id} was unsucessful.`,
          //Similar status code: 404
          { extensions: { code: "BAD_USER_INPUT" } }
        );
      }

      //Return updated fields of the user without exposing password
      const updatedUser = { ...userToUpdate, ...updateFields }; //Use spread to place updated fields inot the userToUpdate object
      const { password, ...safeUser } = updatedUser; //Destructure: extract password, gather the rest of properties into safeuser
      return safeUser;
    },

    // removeUser
    // Purpose: Remove user by ID, Remove any applications associated with the user
    // NOTE: Updates and projects associated with the user will be maintained.
    // Cache: Remove the user

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
      const applications = await applicationCollection();

      //Use findOneAndDelete to remove user from the user collection
      const deletedUser = await users.findOneAndDelete({ _id: userId });

      //If user could not be deleted, throw GraphQLError.
      if (!deletedUser.value) {
        throw new GraphQLError(
          `Failed to delete user with this ID (${args._id}). Failed to either find or delete.`,
          {
            //Similar to status code 404
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      //Propagate this removal across all objects with user objects
      await propagators.propagateUserRemovalChanges(args._id);

      // Delete the users and projects cache, as they are no longer accurate; and individual user cache
      try {
        await redisClient.del("users");
        await redisClient.del("applications");
        await redisClient.del(`user:${args._id}`);
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
      if (!args.title || !args.department || !args.professorIds) {
        throw new GraphQLError(
          "The title, department, and profossor Ids are required to create a project.",
          {
            //Similar status code: 404
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
            // Similar status code: 404
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Checks
      helpers.checkArg(args.title, "string", "title");
      helpers.checkArg(args.department, "string", "department");
      helpers.checkArg(args.professorIds, "array", "professorIds");
      if (args.studentIds) {
        helpers.checkArg(args.studentIds, "array", "studentIds");
      }

      let toAddProfessorIds = [];
      let toAddStudentIds = [];

      for (const id of args.professorIds) {
        helpers.checkArg(id, "string", "id");
        toAddProfessorIds.push(id.trim());
      }

      if (args.studentIds) {
        for (const id of args.studentIds) {
          helpers.checkArg(id, "string", "id");
          toAddStudentIds.push(id.trim());
        }
      }

      //Pull project collection
      const projects = await projectCollection();
      const users = await userCollection();

      //Create a new object that will hold values based on those provided from the arguments
      //Set to a new ObjectId()
      //To Do: Add checks on all newly provided values
      const newProject = {
        _id: new ObjectId(),
        title: args.title.trim(),
        createdDate: new Date().toISOString(),
        description: args.description ? args.description.trim() : null,
        department: args.department,
        professors: [],
        students: [],
        applications: [],
        numOfApplications: 0,
        numOfUpdates: 0,
        channel: new ObjectId(),
      };

      // Fetch professors individually and place in the newProject
      for (const professorId of toAddProfessorIds) {
        // const professor = await getUserById({ _id: professorId });
        const professor = await users.findOne({
          _id:
            typeof professorId === "string"
              ? new ObjectId(professorId)
              : professorId,
        });
        newProject.professors.push(professor);
        await users.updateOne(
          {
            _id: professor._id,
          },
          {
            $set: { projects: { $push: newProject._id } },
          }
        );
      }

      // Fetch students individually if there are any
      if (args.studentIds) {
        for (const studentId of args.studentIds) {
          // const student = await getUserById({ _id: studentId });
          const student = await users.findOne({
            _id:
              typeof studentId === "string"
                ? new ObjectId(studentId)
                : studentId,
          });
          newProject.students.push(student);
        }
      }

      //Use insertOne to place the new object into the MongoDB for applications
      let insertedProject = await projects.insertOne(newProject);

      //Confirm it was added. If it was not, throw an error.
      if (!insertedProject.acknowledged || !insertedProject.insertedId) {
        throw new GraphQLError(`Could not Add Project`, {
          //Similar status code: 500
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }

      //Try/catch for redis
      try {
        //Add the project as an individual project cache
        //Create cache key and set in redisClient
        const cacheKey = `project:${newProject._id}`;
        await redisClient.set(cacheKey, JSON.stringify(newProject));

        // Delete the projects cache, as it's no longer accurate.
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
        "createdYear",
        "applicationRemovalId",
        "applicationEditId",
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

      //Pull projects collection
      const projects = await projectCollection();

      //Use findOne to get the project to be edited
      //Use to set values to locally before adding back to the MongoDb
      let projectToUpdate = await projects.findOne({
        _id: new ObjectId(args._id),
      });

      //Create object to hold fields that will be updated
      const updateFields = {};

      //Confirm that a application was able to be pulled
      if (projectToUpdate) {
        //Check for all values that can be udpated in the application. Do not return/jump ahead, as to ensure more than one calue can be updated

        //Name Update
        if (args.title) {
          helpers.checkArg(args.title, "string", "title");
          updateFields.title = args.title.trim();
        }

        if (args.description) {
          helpers.checkArg(args.description, "string", "description");
          updateFields.description = args.description.trim();
        }

        //Established Year Update
        if (args.createdYear) {
          helpers.checkArg(args.createdYear, "number", "createdYear");
          updateFields.createdYear = args.createdYear;
        }

        //Location Update
        if (args.department) {
          helpers.checkArg(args.department, "string", "department");
          updateFields.department = args.department.trim();
        }

        if (args.professorIds) {
          helpers.checkArg(args.professorIds, "array", "professorIds");
          updateFields.professors = [];
          for (const id of args.professorIds) {
            helpers.checkArg(id, "string", "id");
            let newProfessor = getUserById(id);
            if (newProfessor) {
              updateFields.professors.push(newProfessor);
            }
          }
        }

        if (args.studentIds) {
          helpers.checkArg(args.studentIds, "array", "studentIds");
          updateFields.students = [];
          for (const id of args.studentIds) {
            helpers.checkArg(id, "string", "id");
            let newStudent = getUserById(id);
            if (newStudent) {
              updateFields.students.push(newStudent);
            }
          }
        }

        //Application Removal Id
        if (args.applicationRemovalId) {
          helpers.checkArg(args.applicationRemovalId, "string", "id");
          const newApplicationArray = (
            projectToUpdate.applications || []
          ).filter(
            (application) =>
              !application._id.equals(new ObjectId(args.applicationRemovalId))
          );
          updateFields.applications = newApplicationArray;
        }

        //Applications Edit Id
        if (args.applicationEditId) {

          helpers.checkArg(args.applicationEditId, "string", "id");

          const updatedApplicationId = new ObjectId(args.applicationEditId);

          const updatedApplication = await getApplicationById(args.applicationEditId);

          if (!updatedApplication) {
            throw new GraphQLError("Application with the given ID does not exist.", {
              extensions: { code: "BAD_USER_INPUT" },
            });
          }

          const updatedApplicationArray = (projectToUpdate.applications || []).map(
            (application) => {
              if (application._id.equals(updatedApplicationId)) {
                return updatedApplication;
              }
              return application;
            }
          );

          updateFields.applications = updatedApplicationArray;
          
        }

        //Use updateOne, matching the _id to the args._id. Note: the ID cannot be updated
        // $set: updates specific fields of a document without overwriting the entire document
        const result = await projects.updateOne(
          { _id: projectToUpdate._id },
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

        //Propagate this edit across all objects with project objects
        await propagators.propagateProjectEditChanges(args._id, {
          ...projectToUpdate,
          ...updateFields,
        });

        // Fetch the updated project data after successful update
        const updatedProject = { ...projectToUpdate, ...updateFields };

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
      } else {
        //If something goes wrong, throw a GraphQLError
        throw new GraphQLError(
          `The project with the ID of ${args._id} could not be found or updated.`,
          {
            //Similar status code: 404
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }
    },

    // removeProject
    // Purpose: Remove a project by ID, including its updates
    // Cache: Remove the project and its updates from the Redis cache

    removeProject: async (_, args) => {
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
            // Similar status code: 404
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Checks
      helpers.checkArg(args._id, "string", "id");

      //Pull the projects, updates, and application collecitons
      const projects = await projectCollection();
      const updates = await updateCollection();
      const applications = await applicationCollection();

      //Use findOneandDelete to delete the project. Match based on the args._id (made to an object id)
      const deletedProject = await projects.findOneAndDelete({
        _id: new ObjectId(args._id),
      });

      //If the project wasn't deleted, throw a GraphQLError
      if (!deletedProject) {
        throw new GraphQLError(
          `The project with ID of ${args._id} was not successfully found or deleted.`,
          {
            //Similar status code 404
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      // Remove all updates and applications associated with the project
      await updates.deleteMany({ project: new ObjectId(args._id) });
      await applications.deleteMany({ project: new ObjectId(args._id) });

      //Propagate this removal across all objects with project objects
      await propagators.propagateProjectRemovalChanges(args._id);

      //Try/catch for redis
      try {
        // Delete projects, updates and applications cache, as these are no longer accurate
        await redisClient.del("projects");
        await redisClient.del("updates");
        await redisClient.del("applications");

        // Delete the individual project cache
        await redisClient.del(`project:${args._id}`);
      } catch (error) {
        console.error("Failed to update Redis cache:", error);
        throw new GraphQLError(
          "Failed to update Redis cache after deleting the project.",
          {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              cause: error.message,
            },
          }
        );
      }

      //Return value of deletedProject
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
        posterUser: user,
        subject: args.subject.trim(),
        content: args.content.trim(),
        project: project,
        postedDate: new Date().toISOString(), // ISO format: 2024-01-01T00:00:00.000Z
        comments: [],
        numOfComments: 0,
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
      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          //404
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = [
        "_id",
        "posterId",
        "subject",
        "content",
        "projectId",
        "commentRemovalId",
        "commentEditId",
      ];
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

      //Pull the update collection
      const updates = await updateCollection();

      //Use findOne to get the update that is to be updated, and save to local object
      let updateToUpdate = await updates.findOne({
        _id: new ObjectId(args._id),
      });

      //Confirm that a update was located
      if (updateToUpdate) {
        //Go through each value that can be updated. Do not skip ahead or return early, as multiple values can be updated at once

        //Poster Id edit
        if (args.posterId) {
          helpers.checkArg(args.posterId, "string", "id");

          //Pull users collection; Use findOne to confirm the user exists
          const users = await userCollection();
          const user = await users.findOne({
            _id: new ObjectId(args.posterId),
          });

          //If there isn't an user, throw an error
          if (!user) {
            throw new GraphQLError("Invalid user ID", {
              //Similar status code: 404
              extensions: { code: "BAD_USER_INPUT" },
            });
          }

          //If the user exists, safe to save the provided posterId in the updateToUpdate
          updateToUpdate.posterUser = user;
        }

        //Subject  edit
        if (args.subject) {
          helpers.checkArg(args.subject, "string", "subject");
          updateToUpdate.subject = args.subject.trim();
        }

        //Content edit
        if (args.content) {
          helpers.checkArg(args.content, "string", "content");
          updateToUpdate.content = args.content.trim();
        }

        //Project Id edit
        if (args.projectId) {
          helpers.checkArg(args.projectId, "string", "id");

          //Pull project collection; Use findOne to confirm the project exists
          const projects = await projectCollection();
          const project = await projects.findOne({
            _id: new ObjectId(args.projectId),
          });

          //If there isn't an user, throw an error
          if (!project) {
            throw new GraphQLError("Invalid project ID", {
              //Similar status code: 404
              extensions: { code: "BAD_USER_INPUT" },
            });
          }

          //If the project exists, safe to save the provided projectId in the updateToUpdate
          updateToUpdate.project = project;
        }

        //Comment Removal Id
        if (args.commentRemovalId) {
          helpers.checkArg(args.commentRemovalId, "string", "id");
          const newCommentArray = (updateToUpdate.comments || []).filter(
            (comment) =>
              !comment._id.equals(new ObjectId(args.commentRemovalId))
          );
          updateToUpdate.comments = newCommentArray;
        }

        //Comments Edit Id
        if (args.commentEditId) {
          helpers.checkArg(args.commentEditId, "string", "id");
        
          const updatedCommentId = new ObjectId(args.commentEditId);
        
          const updatedComment = await getCommentById(args.commentEditId);
        
          if (!updatedComment) {
            throw new GraphQLError("Comment with the given ID does not exist.", {
              extensions: { code: "BAD_USER_INPUT" },
            });
          }
        
          const updatedCommentArray = (updateToUpdate.comments || []).map(
            (comment) => {
              if (comment._id.equals(updatedCommentId)) {
                return updatedComment;
              }
              return comment;
            }
          );
        
          updateToUpdate.comments = updatedCommentArray;
        }

        //NOW, update the update in the mongodb. Use $set, which will not affect unupdated values
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
          // Delete updates cache, as it's now out of date
          await redisClient.del("updates");

          //Add/update the update's individual cache
          await redisClient.set(
            `update:${args._id}`,
            JSON.stringify(updateToUpdate)
          );
        } catch (error) {
          console.error("Failed to update Redis cache:", error);
          throw new GraphQLError(
            "Failed to update Redis cache after editing the update.",
            {
              extensions: {
                code: "INTERNAL_SERVER_ERROR",
                cause: error.message,
              },
            }
          );
        }
      } else {
        throw new GraphQLError(
          `The update with ID of ${args._id} could not be updated or found.`,
          {
            //Similar status code: 404
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      //Return the updated update's local object
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

      // If the bupdateook couldn't be found or deleted, throw an error
      if (!deletedUpdate) {
        throw new GraphQLError(
          `Could not find or delete update with ID of ${args._id}`,
          {
            //Similar status code: 404
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

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
        applicant: matchedUser,
        project: matchedProject,
        applicationDate: new Date().toISOString(),
        lastUpdatedDate: new Date().toISOString(),
        status: "PENDING",
        comments: [],
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
      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          //404
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = [
        "_id",
        "applicantId",
        "projectId",
        "lastUpdatedDate",
        "status",
        "commentRemovalId",
        "commentEditId",
      ];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            //404
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Pull applications collection
      const applications = await applicationCollection();

      //Use findOne to pull the application in question, using the args._id as the _id to match
      //Use applicationToUpdate as the local object to place the edited values to
      let applicationToUpdate = await applications.findOne({
        _id: new ObjectId(args._id),
      });

      //If an applicaiton cannot be pulled from the collection, throw an GraphQLError
      if (!applicationToUpdate) {
        throw new GraphQLError(
          "The application ID provided by the user was not valid.",
          {
            //Similar status code: 404
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      //Checks and updates to appliciationToUpdate

      helpers.checkArg(args._id, "string", "id");

      if (args.applicantId) {
        helpers.checkArg(args.applicantId, "string", "id");

        //Pull users collection
        const users = await userCollection();

        //Use findOne to get the user with the id provided by the user
        const pulledUser = await users.findOne({
          _id: new ObjectId(args.applicantId),
        });

        //If user not found, throw a GraphQLError
        if (!pulledUser) {
          throw new GraphQLError(
            "A user could not be found with the applicantId provided.",
            {
              //Similar status code: 404
              extensions: { code: "BAD_USER_INPUT" },
            }
          );
        }

        //If the user exists, set the applicantId to the args.applicantId
        applicationToUpdate.applicant = pulledUser;
      }

      if (args.projectId) {
        helpers.checkArg(args.projectId, "string", "id");

        //Pull projects collection
        const projects = await projectCollection();

        //Use findOne to get the project with the id provided by the user
        const pulledProject = await projects.findOne({
          _id: new ObjectId(args.projectId),
        });

        //If not project found, throw a GraphQLError
        if (!pulledProject) {
          throw new GraphQLError(
            "A project could not be found with the projectId provided.",
            {
              //Similar status code: 404
              extensions: { code: "BAD_USER_INPUT" },
            }
          );
        }

        //If the project exists, set the projectId to the args.projectId
        applicationToUpdate.project = pulledProject;
      }

      if (args.status) {
        helpers.checkArg(args.status, "string", "status");
        applicationToUpdate.status = args.status;
      }

      //Comment Removal Id
      if (args.commentRemovalId) {
        helpers.checkArg(args.commentRemovalId, "string", "id");
        const newCommentArray = (applicationToUpdate.comments || []).filter(
          (comment) => !comment._id.equals(new ObjectId(args.commentRemovalId))
        );
        applicationToUpdate.comments = newCommentArray;
      }

      //Comments Edit Id
      if (args.commentEditId) {
        helpers.checkArg(args.commentEditId, "string", "id");
      
        const updatedCommentId = new ObjectId(args.commentEditId);
      
        const updatedComment = await getCommentById(args.commentEditId);
      
        if (!updatedComment) {
          throw new GraphQLError("Comment with the given ID does not exist.", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      
        const updatedCommentArray = (applicationToUpdate.comments || []).map(
          (comment) => {
            if (comment._id.equals(updatedCommentId)) {
              return updatedComment;
            }
            return comment;
          }
        );
      
        applicationToUpdate.comments = updatedCommentArray;
      }

      //Automatically update lastUpdatedDate
      applicationToUpdate.lastUpdatedDate = new Date().toISOString();

      //NOW, update the applications in the mongodb. Use $set, which will not affect unupdated values
      const result = await applications.updateOne(
        { _id: new ObjectId(args._id) },
        { $set: applicationToUpdate }
      );

      if (result.modifiedCount === 0) {
        throw new GraphQLError(
          `Failed to update the update with ID ${args._id}.`,
          {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }

      //Propagate this removal across all objects with application objects
      await propagators.propagateApplicationEditChanges(
        applicationToUpdate._id,
        { ...applicationToUpdate }
      );

      // Update Redis cache
      try {
        //Delete the applications cache as this is now out of date
        await redisClient.del("applications");
        if (args.applicantId) {
          await redisClient.del(`user:${args.applicantId}`);
        }

        //Set the individual application cache.
        const cacheKey = `application:${args._id}`;
        await redisClient.set(cacheKey, JSON.stringify(applicationToUpdate));
      } catch (error) {
        console.error("Failed to update Redis cache:", error);
        throw new GraphQLError(
          "Failed to update Redis cache after editing the applications.",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR", cause: error.message },
          }
        );
      }

      //Return applicationToUpdate, which doesn't have metadata
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

      //Propagate this removal across all objects with application objects
      await propagators.propagateApplicationRemovalChanges(args._id);

      //Delete the individual application cache, and the applications cache, as this is now out of data
      await redisClient.del(`application:${args._id}`);
      await redisClient.del("applications");

      //Return the value of deletedApplication
      return deletedApplication;
    },

    //addComment

    addComment: async (_, args) => {
      // Check if required fields are present
      if (
        !args.commenterId ||
        !args.commentDestination ||
        !args.destinationId ||
        !args.content
      ) {
        throw new GraphQLError(
          "The commenterId, commentDestination, destinationId, and content fields are required.",
          {
            //404
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      // Check for extra fields
      const fieldsAllowed = [
        "commenterId",
        "commentDestination",
        "destinationId",
        "content",
      ];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            //404
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Checks
      helpers.checkArg(args.commenterId, "string", "id");
      helpers.checkArg(args.commentDestination, "string", "commentDestination");
      helpers.checkArg(args.destinationId, "string", "id");
      helpers.checkArg(args.content, "string", "content");

      // Determine the correct collection based on the destination
      //Use the name 'collection' so that the code that follows can be used on either
      let collection;
      if (args.commentDestination.trim().toUpperCase() === "UPDATE") {
        collection = await updateCollection();
      } else if (
        args.commentDestination.trim().toUpperCase() === "APPLICATION"
      ) {
        collection = await applicationCollection();
      } else {
        throw new GraphQLError("Invalid commentDestination provided.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      //Use findOne to pull the destination (the update or application) in question, using the args.destinationId as the _id to match
      const matchedDestination = await collection.findOne({
        _id: new ObjectId(args.destinationId),
      });

      //If a destination cannot be pulled from the collection, throw an GraphQLError
      if (!matchedDestination) {
        throw new GraphQLError(
          `The ${args.commentDestination.toLowerCase()} ID provided was not valid.`,
          {
            //Similar status code: 404
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      //Fetch commenter object (user)
      const users = await userCollection();
      const commenter = await users.findOne({
        _id: new ObjectId(args.commenterId),
      });

      //Create a local object to hold the args values, and set the id to a new objectID
      const commentToAdd = {
        _id: new ObjectId(),
        commenter: commenter,
        content: args.content.trim(),
        postedDate: new Date().toISOString(),
        commentDestination: args.commentDestination.trim().toUpperCase(),
        destinationId: new ObjectId(args.destinationId.trim()),
      };

      //Pull comments collection
      const comments = await commentCollection();

      //Use insertOne to add the local comment object to the comments collection
      let addedComment = await comments.insertOne(commentToAdd);

      //If adding the comment was not successful, then throw a GraphQLError
      if (!addedComment.acknowledged || !addedComment.insertedId) {
        throw new GraphQLError(
          "The comment provided by the user could not be added.",
          {
            //Similar status code: 500
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }

      //If adding the comment was succesful, then add it's id to the destination
      const updateResult = await collection.updateOne(
        { _id: new ObjectId(args.destinationId) },
        { $push: { comments: commentToAdd._id } }
      );

      if (updateResult.modifiedCount === 0) {
        throw new GraphQLError(
          "The comment ID could not be added to the destination's comment array.",
          {
            //Similar status code: 500
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }

      try {
        //Add the individual comment cache
        const cacheKey = `comment:${commentToAdd._id}`;
        await redisClient.set(cacheKey, JSON.stringify(commentToAdd));

        //Delete the applications cache, as this is now out of date.'
        await redisClient.del("comments");

        //Delete associated caches for the destinations
        let destinationCacheKey;
        if (args.commentDestination === "UPDATE") {
          destinationCacheKey = `update:${args.destinationId}`;
          await redisClient.del(destinationCacheKey);
          await redisClient.del("updates");
        } else {
          destinationCacheKey = `application:${args.destinationId}`;
          await redisClient.del(destinationCacheKey);
          await redisClient.del("applications");
        }
      } catch (error) {
        console.error("Failed to update Redis cache:", error);
        throw new GraphQLError(
          "Failed to update Redis cache after adding the application.",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR", cause: error.message },
          }
        );
      }

      //Return the local commentToAdd object, which will be without the meta data
      return commentToAdd;
    },

    editComment: async (_, args) => {
      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          //404
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check for extra fields
      const fieldsAllowed = ["_id", "content", "commenterId"];
      for (let key in args) {
        if (!fieldsAllowed.includes(key)) {
          throw new GraphQLError(`Unexpected field '${key}' provided.`, {
            //404
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      //Checks to input arguments
      helpers.checkArg(args._id, "string", "id");
      if (args.content) {
        helpers.checkArg(args.content, "string", "content");
      }
      if (args.commenterId) {
        helpers.checkArg(args.commenterId, "string", "id");
      }

      //Pull comments collection
      const comments = await commentCollection();

      //Use findOne to pull the comment in question, using the args._id as the _id to match
      //Use applicationToUpdate as the local object to place the edited values to
      let commentToUpdate = await comments.findOne({
        _id: new ObjectId(args._id),
      });

      //If an comment cannot be pulled from the collection, throw an GraphQLError
      if (!commentToUpdate) {
        throw new GraphQLError(
          "The commment ID provided by the user was not valid.",
          {
            //Similar status code: 404
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      //Object to hold fields to update
      const updateFields = {};

      if (args.content) {
        updateFields.content = args.content.trim();
      }
      if (args.commenterId) {
        let commenter = await getUserById(args.commenterId);
        updateFields.commenter = commenter;
      }

      //Update the comments in the mongodb. Use $set, which will not affect unupdated values
      const result = await comments.updateOne(
        { _id: commentToUpdate._id },
        { $set: updateFields }
      );

      if (result.modifiedCount === 0) {
        throw new GraphQLError(
          `Failed to update the update with ID ${args._id}.`,
          {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }

      //Propagate this removal across all objects with comment objects
      await propagators.propagateCommentEditChanges(args._id, {
        ...commentToUpdate,
        ...updateFields,
      });

      try {
        //Update the individual comment cache
        const cacheKey = `comment:${commentToUpdate._id}`;
        const updatedComment = { ...commentToUpdate, ...updateFields };
        await redisClient.set(cacheKey, JSON.stringify(updatedComment));

        //Delete the comments cache, as this is now out of date.'
        await redisClient.del("comments");

        //Delete associated caches for the destinations
        let destinationCacheKey;
        if (commentToUpdate.commentDestination === "UPDATE") {
          destinationCacheKey = `update:${commentToUpdate.destinationId}`;
          await redisClient.del(destinationCacheKey);
          await redisClient.del("updates");
        } else {
          destinationCacheKey = `application:${commentToUpdate.destinationId}`;
          await redisClient.del(destinationCacheKey);
          await redisClient.del("applications");
        }
      } catch (error) {
        console.error("Failed to update Redis cache:", error);
        throw new GraphQLError(
          "Failed to update Redis cache after editing the comment.",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR", cause: error.message },
          }
        );
      }

      //Return commentToUpdate, which doesn't have metadata
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
      if (!deletedComment.value) {
        throw new GraphQLError(
          "Could not find or delete comment with the provided ID.",
          {
            //Similar status code: 404
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      //Propagate this removal across all objects with user objects
      await propagators.propagateCommentRemovalChanges(args._id);

      try {
        //Update the individual comment cache
        const cacheKey = `comment:${deletedComment.value._id}`;
        await redisClient.del(cacheKey);

        //Delete the comments cache, as this is now out of date.'
        await redisClient.del("comments");

        //Delete associated caches for the destinations
        let destinationCacheKey;
        if (deletedComment.value.commentDestination === "UPDATE") {
          destinationCacheKey = `update:${deletedComment.value.destinationId}`;
          await redisClient.del(destinationCacheKey);
          await redisClient.del("updates");
        } else {
          destinationCacheKey = `application:${deletedComment.value.destinationId}`;
          await redisClient.del(destinationCacheKey);
          await redisClient.del("applications");
        }
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
