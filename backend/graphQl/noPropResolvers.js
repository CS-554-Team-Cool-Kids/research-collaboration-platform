/* NOTES

WHAT IS THIS FILE: 

This file contains resolvers that are simplified versions of those in the main `resolvers.js` file. 
These do not call the propagation helpers and therefore they avoid infinite loops caused by mutual calls between resolvers and propagation helpers. 

To resolve this issue, propagation helpers no longer call back to the resolvers. 
Instead, they utilize these noPropResolvers. 
This setup prevents infinite loops but requires the propagation helpers to take full responsibility for orchestrating the removal or editing of objects across the database.

THE NO PROP RESOLVERS ARE:

- editUser
- editProject
- editApplication
- removeApplication
- removeComment
- editUpdate
- removeUpdate

FUTURE DEVELOPMENT: 

This approach works to resolve the problem, but it introduces repetitive code. 
Future iterations could improve this by implementing flags within the resolver and propagation helper relationship to streamline the process.

Additionally, future development could simplify the code further by removing unnecessary checks, such as handling cases like "projectRemovalId" being passed into the resolvers.

Maintaining these separate resolvers is currently the fastest way to produce working code, but there is room for refinement in the future.
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


// EDIT USER
    export const editUser = async (_, args) => {
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
            const newProjectArray = (userToUpdate.projects || []).filter(
            (project) => !project._id.equals(new ObjectId(args.projectEditId))
            );
            const projectToAdd = getProjectById(args.projectEditId);
            if (projectToAdd) {
            newProjectArray.push(projectToAdd);
            }
            updateFields.projects = newProjectArray;
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
        if (args.applicationEditId) {
            helpers.checkArg(args.applicationEditId, "string", "id");
            const newApplicationArray = (userToUpdate.applications || []).filter(
            (application) =>
                !application._id.equals(new ObjectId(args.applicationEditId))
            );
            const applicationToAdd = getApplicationById(args.applicationEditId);
            if (applicationToAdd) {
            newApplicationArray.push(applicationToAdd);
            }
            updateFields.applications = newApplicationArray;
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
    };

// EDIT PROJECT
    export const editProject = async (_, args) => {
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
                const newApplicationArray = (
                projectToUpdate.applications || []
                ).filter(
                (application) =>
                    !application._id.equals(new ObjectId(args.applicationEditId))
                );
                const applicationToAdd = getApplicationById(args.applicationEditId);
                if (applicationToAdd) {
                newApplicationArray.push(applicationToAdd);
                }
                updateFields.applications = newApplicationArray;
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
        };

// EDIT APPLICATION
    export const editApplication = async (_, args) => {
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
        const newCommentArray = (applicationToUpdate.comments || []).filter(
            (comment) => !comment._id.equals(new ObjectId(args.commentEditId))
        );
        const commentToAdd = getCommentById(args.commentEditId);
        if (commentToAdd) {
            newCommentArray.push(commentToAdd);
        }
        applicationToUpdate.comments = newCommentArray;
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
    };

// REMOVE APPLICATION
    export const removeApplication = async (_, args) => {
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

        //Delete the individual application cache, and the applications cache, as this is now out of data
        await redisClient.del(`application:${args._id}`);
        await redisClient.del("applications");

        //Return the value of deletedApplication
        return deletedApplication;
    };

// REMOVE COMMENT
    export const removeComment = async (_, args) => {
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
        return deletedComment.value;
    };

// EDIT UPDATE
    export const editUpdate = async (_, args) => {
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
            const newCommentArray = (updateToUpdate.comments || []).filter(
                (comment) => !comment._id.equals(new ObjectId(args.commentEditId))
            );
            const commentToAdd = getCommentById(args.commentEditId);
            if (commentToAdd) {
                newCommentArray.push(commentToAdd);
            }
            updateToUpdate.comments = newCommentArray;
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
        };

// REMOVE UPDATE
    export const removeUpdate = async (_, args) => {
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
    };