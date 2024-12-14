/**
 * IMPORTANT NOTE ON HOW TO FIX THIS: 
 * 
 * As written, these propagation functions are likely causing infinite loops because of the feedback between resolvers.js and propagationHelpers.js.
 * The easiest/fastest way to fix this is to duplicate the resolvers into another file and remove calls to the propagationHelpers.js in these duplicated resolvers.
 * Think of these new resolvers as "bare-bones" resolvers, as they won’t trigger propagation. To be clear: THESE DO NOT REPLACE OUR ORIGINAL RESOLVERS. THEY ARE SUPPLEMENTS.
 * 
 * Once these bare-bones resolvers are introduced, we then need to call them within the propagationHelpers functions below. 
 * We need to order the call of these bare-bones resolvers correctly within these propagationHelpers as to orchestrate the propagation across collections/objects. 
 * 
 * At times, these propagation helpers will need to sort through collections to determine what objects within the collection need to be updated.
 * Then the propagation helper needs to call a barebones resolver on each of these objects to be updated. 
 * 
 * For each of the propagation functions below, we need to (1) remove the backward call to the resolvers.js file and (2) introduce the barebones resolvers in this order:
 * 
 * propagateUserRemovalChanges: editProject; removeApplication; removeComment
 * propagateUserEditChanges: editApplication; editProject; editUpdate; editComment
 * propagateProjectRemovalChanges: removeApplication; editUser; removeUpdate
 * propagateProjectEditChanges: editApplication; editUpdate; editUser
 * propagateApplicationRemovalChanges: editUser; editProject
 * propagateApplicationEditChanges: editUser; editProject
 * propagateCommentRemovalChanges: editApplication; editUpdate
 * propagateCommentEditChanges: editApplication; editUpdate
 * 
 * Following this pattern, the propagation functions will perform all necessary updates across related entities while avoiding recursive loops.
 */


// Import functions from resolvers.js
import * as noPropResolvers from "./noPropResolvers.js";
import { GraphQLError } from "graphql";

// MongoDB: collections for users, projects, updates, and applications
import {
  users as userCollection,
  projects as projectCollection,
  updates as updateCollection,
  applications as applicationCollection,
  comments as commentCollection,
} from "../config/mongoCollections.js";

import { ObjectId } from "mongodb";


//PROPOGATE USER REMOVAL CHANGES
//Propagate user removal changes across related entities: projects, applications, comments (updates remain unchanged)

export async function propagateUserRemovalChanges(userId) {
  
  // Convert string userId to ObjectId
  const userObjectId = new ObjectId(userId);

  //HANDLE PROJECTS 
  try {
    
    //Pull project collection, place any projects where the user's id is in a professor or student object
    const projects = await projectCollection();

    if (!projects || typeof projects.find !== "function") {
      throw new Error("Invalid project collection. Check your database connection.");
    }

    //TO DO: Check if it should be "professors._id": userId OR "professors._id": userObjectId
    const relatedProjects = await projects
      .find({
        $or: [{ "professors._id": userObjectId }, { "students._id": userObjectId }],
      })
      .toArray();


    //If there are related projects, proceed in updating embedded user objects
    if (relatedProjects.length > 0) {
      
      for (const project of relatedProjects) {
        
        const updatedProjectFields = {};

        //Checks if the user is listed as a professor in the pulled project.
        //`some`: method that determines if there is any professor that has an `_id` that matches the given `userId`
        if (project.professors.some((prof) => prof._id.equals(userObjectId))) {
          
          //If the removed professor is in this project, use filter to remove the reference, and then map a new array of professor ids
          //The array of ID strings if what is needed by the edit project resolver
          updatedProjectFields.professorIds = project.professors
            .filter((prof) => !prof._id.equals(userObjectId))
            .map((prof) => prof._id.toString());
        }

        //Repeat the above process for students
        if (project.students.some((stud) => stud._id.equals(userObjectId))) {
          updatedProjectFields.studentIds = project.students
            .filter((stud) => !stud._id.equals(userObjectId))
            .map((stud) => stud._id.toString());
        }

        //If for this project the code has collected fields to update, call the edit project resolver.
        if (Object.keys(updatedProjectFields).length > 0) {
          await noPropResolvers.editProject({
            _id: project._id.toString(),
            ...updatedProjectFields,
          });
        }

      }
    }

    console.log(`Removed user from related projects ${userId}`);
  } catch (error) {
    //Adding this will help pinpoint where the issue arrised.
    console.error(
      `Failed to remove user from projects for ${userId}: ${error.message}`
    );
    //Rethrow the graphQL error (it remains its originaly type)
    throw error;
  }

  //HANDLE APPLICATIONS
  try {
    
    //Pull applications collection, place any application where the user's id matches the id of the embeddeded user object (applicant)

    const applications = await applicationCollection();

    if (!applications || typeof applications.find !== "function") {
      throw new Error("Invalid application collection. Check your database connection.");
    }

    const userApplications = await applications
      .find({
        "applicant._id": userObjectId,
      })
      .toArray();

    //If the user has submitted applications, delete them
    if (userApplications.length > 0) {
      //Remove applcation needs the application _id as a string
      for (const application of userApplications) {
        await noPropResolvers.removeApplication({ _id: application._id.toString() });
      }

      console.log(`Removed applications associated with user ${userId}`);
    }
  } catch (error) {
    console.error(
      `Failed to remove applications for user ${userId}: ${error.message}`
    );
    //Rethrow the graphQL error (it remains its originaly type)
    throw error;
  }

  //HANDLE COMMENTS
  try {

    //Pull comments collection, place any comment where the comments's id matches removed user's id

    const comments = commentCollection();

    if (!comments || typeof comments.find !== "function") {
      throw new Error("Invalid comment collection. Check your database connection.");
    }

    const relatedComments = await comments
      .find({
        "commenter._id": userObjectId,
      })
      .toArray();

    //If there are comments related to the user, remove them.
    if (relatedComments.length > 0) {
      for (const comment of relatedComments) {
        // Use removeComment from resolvers; tthis needs the comment id to be made a string
        await noPropResolvers.removeComment({ _id: comment._id.toString() });
      }

      console.log(`Removed comments associated with user ${userId}`);
    }
  } catch (error) {
    console.error(
      `Failed to remove comments for user ${userId}: ${error.message}`
    );
    throw error;
  }

  //NOT REMOVING UPDATES
  //For simpicity: I am not removing updates created by the user. We can consider a way to reassign updates,
  //but I don't think a user's removal should remove updates about a whole project.
}



//HELPER FUNCTION: propagateUserEditChanges
//Propagate user edits across related entities: projects, updates, applications, comments
export async function propagateUserEditChanges(userId, updatedUserData) {
  
  // Ensure userId is a valid ObjectId
  const userObjectId = new ObjectId(userId);

  // HANDLE APPLICATIONS
  try {
    
    //Pull the application collection and find any applications where the applicant's id matches the edited user
    const applications = await applicationCollection();
    
    // Ensure userCollection returns a valid collection
    if (!applications || typeof applications.find !== "function") {
      throw new Error("Invalid application collection. Check your database connection.");
    }

    const userApplications = await applications
      .find({
        "applicant._id": userObjectId
      })
      .toArray();

    //If associated applications found, the update the embedded user (here: applicant) object
    if (userApplications.length > 0) {
      //For each of the applications, call editApplication to have the user object updated
      for (const application of userApplications) {
        
        await noPropResolvers.editApplication({
          _id: application._id.toString(),
          applicantId: userId,
        });

      }

      console.log(`Updated applications associated with user ${userId}`);
    }
  } catch (error) {
    console.error(
      `Failed to update applications for user ${userId}: ${error.message}`
    );
    throw error;
  }

  // HANDLE PROJECTS
  try {

    const projects = await projectCollection();

    // Ensure projectCollection returns a valid collection
    if (!projects || typeof projects.find !== "function") {
      throw new Error("Invalid project collection. Check your database connection.");
    }
  
    const relatedProjects = await projects
      .find({
        $or: [{ "professors._id": userObjectId }, { "students._id": userObjectId }],
      })
      .toArray();

    if (relatedProjects.length > 0) {
      for (const project of relatedProjects) {
        const updatedProjectFields = {};

        //If the professor array needs to be updated, convert the entire array (including the edited professor) to a string array
        if (project.professors.some((prof) => prof._id.equals(userObjectId))) {
          const professorArray = project.professors.map((prof) =>
            prof._id.toString()
          );
          updatedProjectFields.professors = professorArray;
        }

        //If the student array needs to be updated, convert the entire array (including the edited professor) to a string array
        if (project.students.some((stud) => stud._id.equals(userObjectId))) {
          const studentArray = project.students.map((stud) =>
            stud._id.toString()
          );
          updatedProjectFields.students = studentArray;
        }

        //If for this project the code has collected fields to update, call the edit project resolver.
        if (Object.keys(updatedProjectFields).length > 0) {
          await noPropResolvers.editProject({
            _id: project._id.toString(),
            ...updatedProjectFields,
          });
        }
      }

      console.log(`Updated projects associated with user ${userId}`);
    }
  } catch (error) {
    console.error(
      `Failed to update projects for user ${userId}: ${error.message}`
    );
    throw error;
  }

  // HANDLE UPDATES
  try {

    //Pull update collection, place any updates where the user's id matches the poster's id
    const updates = await updateCollection();

    if (!updates || typeof updates.find !== "function") {
      throw new Error("Invalid update collection. Check your database connection.");
    }

    const relatedUpdates = await updates
      .find({
        "posterUser._id": userObjectId,
      })
      .toArray();

    if (relatedUpdates.length > 0) {
      for (const update of relatedUpdates) {
        await noPropResolvers.editUpdate({
          _id: update._id.toString(),
          posterId: userId,
        });
      }
      console.log(`Updated updates associated with user ${userId}`);
    }
  } catch (error) {
    console.error(
      `Failed to update updates for user ${userId}: ${error.message}`
    );
    throw error;
  }

  // HANDLE COMMENTS
  try {

    //Pull comment collection, place any comments where the user's id is in a professor or student object
    const comments = await commentCollection();

    if (!comments || typeof comments.find !== "function") {
      throw new Error("Invalid comment collection. Check your database connection.");
    }
    
    const relatedComments = await comments
      .find({
        "commenter._id": userObjectId,
      })
      .toArray();

    if (relatedComments.length > 0) {
      for (const comment of relatedComments) {
        await noPropResolvers.editComment({
          _id: comment._id.toString(),
          commenterId: userId,
        });
      }

      console.log(`Updated comments associated with user ${userId}`);
    }
  } catch (error) {
    console.error(
      `Failed to update comments for user ${userId}: ${error.message}`
    );
    throw error;
  }
}



//HELPER FUNCTION: propagateProjectRemovalChanges
//Propagate project removal updates across related entities: updates, applications, users
export async function propagateProjectRemovalChanges(projectId) {
   
  // Convert string projectId to ObjectId
  const projectObjectId = new ObjectId(projectId);

  // HANDLE APPLICATIONS
  try {
   
    const applications = await applicationCollection();

    if (!applications || typeof applications.find !== "function") {
      throw new Error("Invalid application collection. Check your database connection.");
    }
    
    const relatedApplications = await applications
      .find({
        "project._id": projectObjectId,
      })
      .toArray();

    // Use removeApplication to remove any applications associated with this removed projects
    if (relatedApplications.length > 0) {
      for (const application of relatedApplications) {
        await noPropResolvers.removeApplication(
          { _id: application._id.toString() }
        );
      }
      console.log(`Removed applications associated with project ${projectId}`);
    }
  } catch (error) {
    console.error(
      `Failed to remove applications for project ${projectId}: ${error.message}`
    );
    throw error;
  }

  // HANDLE USERS - remove project from users' project lists (professors and students)
  try {

    const users = await userCollection();
   
    if (!users || typeof users.find !== "function") {
      throw new Error("Invalid user collection. Check your database connection.");
    }

    const relatedUsers = await users
      .find({
        "projects._id": projectObjectId,
      })
      .toArray();

    if (relatedUsers.length > 0) {
      for (const user of relatedUsers) {
        noPropResolvers.editUser({
          _id: user._id.toString(),
          projectRemovalId: projectId,
        });
      }

      console.log(
        `Updated users' project associations for project ${projectId}`
      );
    }
  } catch (error) {
    console.error(
      `Failed to remove project from users for project ${projectId}: ${error.message}`
    );
    throw error;
  }

  // HANDLE UPDATES - remove any updates associated with the project
  // Unlike when a user is removed, it makes sense to remove updates about a removed project
  try {
    
    const updates = await updateCollection();

    if (!updates || typeof updates.find !== "function") {
      throw new Error("Invalid update collection. Check your database connection.");
    }

    const relatedUpdates = await updates
      .find({
        "project._id": projectObjectId,
      })
      .toArray();

    if (relatedUpdates.length > 0) {

      for (const update of relatedUpdates) {
        await noPropResolvers.removeUpdate(
          { _id: update._id.toString() }
        );
      }

      console.log(`Removed updates associated with project ${projectId}`);

    }
  } catch (error) {
    console.error(
      `Failed to remove updates for project ${projectId}: ${error.message}`
    );
    throw error;
  }
}



//HELPER FUNCTION: propagateProjectEditChanges
//Propagate project edit updates across related entities: updates, applications, user
export async function propagateProjectEditChanges(
  projectId,
  updatedProjectData
) {

  // Convert string projectId to ObjectId
  const projectObjectId = new ObjectId(projectId);

  // HANDLE APPLICATIONS
  try {

    const applications = await applicationCollection();

    if (!applications || typeof applications.find !== "function") {
      throw new Error("Invalid application collection. Check your database connection.");
    }

    const relatedApplications = await applications
      .find({
        "project._id": projectObjectId,
      })
      .toArray();

    if (relatedApplications.length > 0) {
      for (const application of relatedApplications) {
        // If the project data changes, update the application
        await noPropResolvers.editApplication({
          _id: application._id.toString(),
          projectId: projectId,
        });
      }

      console.log(`Updated applications associated with project ${projectId}`);

    }
  } catch (error) {
    console.error(
      `Failed to update applications for project ${projectId}: ${error.message}`
    );
    throw error;
  }

  // Handle updates
  try {

    const updates = await updateCollection();

    if (!updates || typeof updates.find !== "function") {
      throw new Error("Invalid update collection. Check your database connection.");
    }

    const relatedUpdates = await updates
      .find({
        "project._id": projectObjectId,
      })
      .toArray();

    if (relatedUpdates.length > 0) {
      for (const update of relatedUpdates) {
        // If the project data changes (e.g., title or project reference), update the update
        await noPropResolvers.editUpdate({
          _id: update._id.toString(),
          projectId: projectId,
        });
      }

      console.log(`Updated updates associated with project ${projectId}`);

    }
  } catch (error) {
    console.error(
      `Failed to update updates for project ${projectId}: ${error.message}`
    );
    throw error;
  }

  // Handle users - update any users associated with this project (professors/students)
  try {

    const users = await userCollection();

    if (!users || typeof users.find !== "function") {
      throw new Error("Invalid user collection. Check your database connection.");
    }

    const relatedUsers = await users
      .find({
        "projects._id": projectObjectId,
      })
      .toArray();

    if (relatedUsers.length > 0) {
      for (const user of relatedUsers) {
        noPropResolvers.editUser({
          _id: user._id.toString(),
          projectEditId: projectId,
        });
      }

      console.log(
        `Updated users' project associations for project ${projectId}`
      );
    }
  } catch (error) {
    console.error(
      `Failed to update users for project ${projectId}: ${error.message}`
    );
    throw error;
  }
}



//HELPER FUNCTION: propagateApplicationRemovalChanges
//Propagate application removal updates across related entities: projects, users
export async function propagateApplicationRemovalChanges(applicationId) {
  
  // Convert string applicationId to ObjectId
  const appObjectId = new ObjectId(applicationId);

  // HANDLE USERS - remove application from users' application lists
  try {
    const users = await userCollection();
   
    if (!users || typeof users.find !== "function") {
      throw new Error("Invalid user collection. Check your database connection.");
    }
    const relatedUsers = await users
      .find({ "applications._id": appObjectId })
      .toArray();

    if (relatedUsers.length > 0) {
      for (const user of relatedUsers) {
        // Update the user's applications array by removing the application
        noPropResolvers.editUser({
          _id: user._id.toString(),
          applicationRemovalId: applicationId,
        });
      }

      console.log(
        `Updated users' application associations for application ${applicationId}`
      );
    }
  } catch (error) {
    console.error(
      `Failed to remove application from users for application ${applicationId}: ${error.message}`
    );
    throw error;
  }

  // HANDLE PROJECTS - remove application from projects' application lists
  try {
    const projects = await projectCollection();
    if (!projects || typeof projects.find !== "function") {
      throw new Error("Invalid project collection. Check your database connection.");
    }

    const relatedProjects = await projects
      .find({ "applications._id": appObjectId })
      .toArray();

    if (relatedProjects.length > 0) {
      for (const project of relatedProjects) {
        // Update the project's applications array by removing the application
        noPropResolvers.editProject({
          _id: project._id.toString(),
          applicationRemovalId: applicationId,
        });
      }

      console.log(
        `Updated projects' application associations for application ${applicationId}`
      );
    }
  } catch (error) {
    console.error(
      `Failed to remove application from projects for application ${applicationId}: ${error.message}`
    );
    throw error;
  }
}



//HELPER FUNCTION: propagateApplicationEditChanges
//Propagate application removal updates across related entities: projects, users
export async function propagateApplicationEditChanges(
  applicationId,
  updatedApplicationData
) {
  // Ensure applicationId is a valid ObjectId
  const appObjectId = new ObjectId(applicationId);

  // Handle users - update application in users' application lists
  try {
    const users = await userCollection();

    // Ensure userCollection returns a valid collection
    if (!users || typeof users.find !== "function") {
      throw new Error("Invalid user collection. Check your database connection.");
    }

    const relatedUsers = await users
      .find({ "applications._id": appObjectId })
      .toArray();

    if (relatedUsers.length > 0) {
      for (const user of relatedUsers) {
        // Update the specific application in the user's applications array
        noPropResolvers.editUser({
          _id: user._id.toString(),
          applicationEditId: applicationId,
        });

        /* WHY DOES THE BELOW NOT WORK? 
        Because it's not handling the redis for the user. We need to call the noPropResolver, which will handle redis caching.
        
        await users.updateOne(
          { _id: user._id, "applications._id": appObjectId },
          { $set: { "applications.$": updatedApplicationData } }
        );*/

        console.log(
          `Updated application ${applicationId} in user ${user._id}'s application list.`
        );
      }
    }
  } catch (error) {
    console.error(
      `Failed to edit application association in users for application ${applicationId}: ${error.message}`
    );
    throw error;
  }

  // Handle projects - update application in projects' application lists
  try {
    const projects = await projectCollection();

    // Ensure projectCollection returns a valid collection
    if (!projects || typeof projects.find !== "function") {
      throw new Error("Invalid project collection. Check your database connection.");
    }

    const relatedProjects = await projects
      .find({ "applications._id": appObjectId })
      .toArray();

    if (relatedProjects.length > 0) {
      for (const project of relatedProjects) {
        // Update the specific application in the project's applications array
        noPropResolvers.editProject({
          _id: project._id.toString(),
          applicationEditId: applicationId,
        });
        
        /*await projects.updateOne(
          { _id: project._id, "applications._id": appObjectId },
          { $set: { "applications.$": updatedApplicationData } }
        );*/

        console.log(
          `Updated application ${applicationId} in project ${project._id}'s application list.`
        );
      }
    }
  } catch (error) {
    console.error(
      `Failed to edit application associations in projects for application ${applicationId}: ${error.message}`
    );
    throw error;
  }
}



//HELPER FUNCTION: propagateCommentRemovalChanges
//Propagate project removal updates across related entities: applications, updates
export async function propagateCommentRemovalChanges(commentId) {
  
  // Convert string commentId to ObjectId
  const commentObjectId = new ObjectId(commentId);
  
  // HANDLE APPLICATIONS - remove comment from applications comment lists
  try {

    const applications = await applicationCollection();

    if (!applications || typeof applications.find !== "function") {
      throw new Error("Invalid application collection. Check your database connection.");
    }

    const relatedApplications = await applications
      .find({
        "comments._id": commentObjectId,
      })
      .toArray();

    if (relatedApplications.length > 0) {
      for (const application of relatedApplications) {
        noPropResolvers.editApplication({
          _id: application._id.toString(),
          commentRemovalId: commentId,
        });
      }

      console.log(
        `Updated application's comments to reflect that a comment with the id ${commentId} was removed.`
      );
    }
  } catch (error) {
    console.error(
      `Failed to remove comment from application for comment with id of ${commentId}: ${error.message}`
    );
    throw error;
  }

  // HANDLE UPDATES - remove comment from updates' comment lists
  try {

    const updates = await updateCollection();

    if (!updates || typeof updates.find !== "function") {
      throw new Error("Invalid update collection. Check your database connection.");
    }

    const relatedUpdates = await updates
      .find({
        "comments._id": commentObjectId,
      })
      .toArray();

    if (relatedUpdates.length > 0) {
      for (const update of relatedUpdates) {
        noPropResolvers.editUpdate({
          _id: update._id.toString(),
          commentRemovalId: commentId,
        });
      }

      console.log(
        `Updated the update to reflect the removed comment with id ${commentId}`
      );
    }
  } catch (error) {
    console.error(
      `Failed to remove comment from update for comment with id ${commentId}: ${error.message}`
    );
    throw error;
  }
}



//HELPER FUNCTION: propagateCommentEditChanges
//Propagate project removal updates across related entities: applications, updates
export async function propagateCommentEditChanges(commentId) {
  
  // Ensure commentId is a valid ObjectId
  const commentObjectId = new ObjectId(commentId);

  // HANDLE APPLICATIONS - remove comment from applications comment lists
  try {
    
    const applications = await applicationCollection();

    if (!applications || typeof applications.find !== "function") {
      throw new Error("Invalid application collection. Check your database connection.");
    }

    const relatedApplications = await applications
      .find({
        "comments._id": commentObjectId,
      })
      .toArray();

    if (relatedApplications.length > 0) {
      for (const application of relatedApplications) {
        noPropResolvers.editApplication({
          _id: application._id.toString(),
          commentEditId: commentId,
        });
      }

      console.log(
        `Updated application's comments to reflect that a comment with the id ${commentId} was edited.`
      );
    }
  } catch (error) {
    console.error(
      `Failed to edit comment from application for comment with id of ${commentId}: ${error.message}`
    );
    throw error;
  }

  // Handle updates - remove comment from updates' comment lists
  try {

    const updates = await updateCollection();

    if (!updates || typeof updates.find !== "function") {
      throw new Error("Invalid update collection. Check your database connection.");
    }

    const relatedUpdates = await updates
      .find({
        "comments._id": commentObjectId,
      })
      .toArray();

    if (relatedUpdates.length > 0) {
      for (const update of relatedUpdates) {
        noPropResolvers.editUpdate({
          _id: update._id.toString(),
          commentEditId: commentId,
        });
      }

      console.log(
        `Updated the update to reflect the edited comment with id ${commentId}`
      );
    }
  } catch (error) {
    console.error(
      `Failed to edit comment from update for comment with id ${commentId}: ${error.message}`
    );
    throw error;
  }
}
