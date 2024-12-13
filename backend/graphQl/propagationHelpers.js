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
 * propagateUserRemovalChanges:
 * 1. editProject - To remove the user from projects where they are listed as a professor or student.
 * 2. removeApplication - To delete applications submitted by the user.
 * 3. removeComment - To delete comments authored by the user.
 * 
 * propagateUserEditChanges:
 * 1. editApplication - To update the applicant’s embedded reference in applications.
 * 2. editProject - To update the user’s embedded reference in projects (professors/students).
 * 3. editUpdate - To update the posterUser’s embedded reference in updates.
 * 4. editComment - To update the commenter’s embedded reference in comments.
 * 
 * propagateProjectRemovalChanges:
 * 1. removeApplication - To delete applications linked to the project.
 * 2. editUser - To remove the project from associated users’ projects lists.
 * 3. removeUpdate - To delete updates linked to the project.
 * 
 * propagateProjectEditChanges:
 * 1. editApplication - To update the project reference in applications.
 * 2. editUpdate - To update the project reference in updates.
 * 3. editUser - To update the project reference in users’ projects lists.
 * 
 * propagateApplicationRemovalChanges:
 * 1. editUser - To remove the application from associated users’ applications lists.
 * 2. editProject - To remove the application from the associated project’s applications list.
 * 
 * propagateApplicationEditChanges:
 * 1. editUser - To update the application reference in users’ applications lists.
 * 2. editProject - To update the application reference in the associated project’s applications list.
 * 
 * propagateCommentRemovalChanges:
 * 1. editApplication - To remove the comment from applications’ comments lists.
 * 2. editUpdate - To remove the comment from updates’ comments lists.
 * 
 * propagateCommentEditChanges:
 * 1. editApplication - To update the comment reference in applications.
 * 2. editUpdate - To update the comment reference in updates.
 * 
 * Following this pattern, the propagation functions will perform all necessary updates across related entities while avoiding recursive loops.
 */


// Import functions from resolvers.js
import * as resolvers from "./resolvers.js";
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

//HELPER FUNCTION: propagateUserRemovalChanges
//Propagate user removal changes across related entities: projects, applications, comments (updates remain unchanged)

export async function propagateUserRemovalChanges(userId) {
  //Handle projects
  try {
    const projects = await projectCollection();
    //Pull project collection, place any projects where the user's id is in a professor or student object
    const relatedProjects = await projects
      .find({
        $or: [{ "professors._id": userId }, { "students._id": userId }],
      })
      .toArray();

    //If there are related projects, proceed in updating embedded user objects
    if (relatedProjects.length > 0) {
      for (const project of relatedProjects) {
        const updatedProjectFields = {};

        //Checks if the user is listed as a professor in the pulled project.
        //`some`: method that determines if there is any professor that has an `_id` that matches the given `userId`
        if (project.professors.some((prof) => prof._id.equals(userId))) {
          //If the removed professor is in this project, use filter to remove the reference, and then map a new array of professor ids
          //The array of IDs if what is needed by the edit project resolver
          updatedProjectFields.professorIds = project.professors
            .filter((prof) => !prof._id.equals(userId))
            .map((prof) => prof._id.toString());
        }

        //Repate the above process for students
        if (project.students.some((stud) => stud._id.equals(userId))) {
          updatedProjectFields.studentIds = project.students
            .filter((stud) => !stud._id.equals(userId))
            .map((stud) => stud._id.toString());
        }

        //If for this project the code as collected fields to update, call the edit project resolver.
        if (Object.keys(updatedProjectFields).length > 0) {
          await resolvers.editProject({
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

  // Handle applications
  try {
    //Pull applications collection, place any application where the user's id matches the id of the embeddeded user object (applicant)
    const userApplications = await applicationCollection()
      .find({
        "applicant._id": userId,
      })
      .toArray();

    //If the user has submitted applications, delete them
    if (userApplications.length > 0) {
      //Remove applcation needs the application _id as a string
      for (const application of userApplications) {
        await resolvers.removeApplication({ _id: application._id.toString() });
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

  // Handle comments
  try {
    //Pull comments collection, place any comment where the comments's id matches removed user's id
    const relatedComments = await commentCollection()
      .find({
        "commenter._id": userId,
      })
      .toArray();

    //If there are comments related to the user, remove them.
    if (relatedComments.length > 0) {
      for (const comment of relatedComments) {
        // Use removeComment from resolvers; tthis needs the comment id to be made a string
        await resolvers.removeComment({ _id: comment._id.toString() });
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
  // Handle applications

  try {
    const applications = await applicationCollection();
    //Pull the application collection and find any applications where the applicant's id matches the edited user
    const userApplications = await applications
      .find({
        "applicant._id":
          typeof userId === "string" ? new ObjectId(userId) : userId,
      })
      .toArray();

    //If associated applications found, the update the embedded user (here: applicant) object
    if (userApplications.length > 0) {
      //For each of the applications, call editApplication to have the user object updated
      for (const application of userApplications) {
        await resolvers.editApplication({
          _id: application._id.toString(),
          applicantId: updatedUserData._id,
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

  // Handle projects
  try {
    const relatedProjects = await projectCollection()
      .find({
        $or: [{ "professors._id": userId }, { "students._id": userId }],
      })
      .toArray();

    if (relatedProjects.length > 0) {
      for (const project of relatedProjects) {
        const updatedProjectFields = {};

        if (project.professors.some((prof) => prof._id.equals(userId))) {
          const professorArray = project.professors.map((prof) =>
            prof._id.toString()
          );
          updatedProjectFields.professors = professorArray;
        }

        if (project.students.some((stud) => stud._id.equals(userId))) {
          const studentArray = project.students.map((stud) =>
            stud._id.toString()
          );
          updatedProjectFields.students = studentArray;
        }

        if (Object.keys(updatedProjectFields).length > 0) {
          await resolvers.editProject({
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

  // Handle updates
  try {
    const relatedUpdates = await updateCollection()
      .find({
        "posterUser._id": userId,
      })
      .toArray();

    if (relatedUpdates.length > 0) {
      for (const update of relatedUpdates) {
        await resolvers.editUpdate({
          _id: update._id.toString(),
          posterId: updatedUserData._id,
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

  // Handle comments
  try {
    const relatedComments = await commentCollection()
      .find({
        "commenter._id": userId,
      })
      .toArray();

    if (relatedComments.length > 0) {
      for (const comment of relatedComments) {
        await resolvers.editComment({
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
  // Handle applications
  try {
    const applications = await applicationCollection();
    const userApplications = await applications
      .find({
        "project._id": projectId,
      })
      .toArray();

    if (userApplications.length > 0) {
      // Use removeApplication to remove any applications associated with this removed projects
      for (const application of userApplications) {
        await resolvers.removeApplication({ _id: application._id.toString() });
      }
      console.log(`Removed applications associated with project ${projectId}`);
    }
  } catch (error) {
    console.error(
      `Failed to remove applications for project ${projectId}: ${error.message}`
    );
    throw error;
  }

  // Handle users - remove project from users' project lists (professors and students)
  try {
    const users = await userCollection();
    const relatedUsers = await users
      .find({
        "projects._id": projectId,
      })
      .toArray();

    if (relatedUsers.length > 0) {
      for (const user of relatedUsers) {
        resolvers.editUser({
          _id: user._id,
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

  // Handle updates - remove any updates associated with the project
  // Unlike when a user is removed, it makes sense to remove updates about a removed project
  try {
    const updates = await updateCollection();
    const relatedUpdates = await updates
      .find({
        "project._id": projectId,
      })
      .toArray();

    if (relatedUpdates.length > 0) {
      for (const update of relatedUpdates) {
        await resolvers.removeUpdate({ _id: update._id.toString() });
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
  // Handle applications
  try {
    const applications = await applicationCollection();
    const relatedApplications = await applications
      .find({
        "project._id": projectId,
      })
      .toArray();

    if (relatedApplications.length > 0) {
      for (const application of relatedApplications) {
        // If the project data changes, update the application
        await resolvers.editApplication({
          _id: application._id.toString(),
          projectId: updatedProjectData._id.toString(),
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
    const relatedUpdates = await updates
      .find({
        "project._id": projectId,
      })
      .toArray();

    if (relatedUpdates.length > 0) {
      for (const update of relatedUpdates) {
        // If the project data changes (e.g., title or project reference), update the update
        await resolvers.editUpdate({
          _id: update._id.toString(),
          projectId: updatedProjectData._id.toString(),
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
    const relatedUsers = await users
      .find({
        "projects._id": projectId,
      })
      .toArray();

    if (relatedUsers.length > 0) {
      for (const user of relatedUsers) {
        resolvers.editUser({
          _id: user._id,
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
  // Handle users - remove application from users' application lists
  try {
    const relatedUsers = await userCollection()
      .find({
        "applications._id": applicationId,
      })
      .toArray();

    if (relatedUsers.length > 0) {
      for (const user of relatedUsers) {
        resolvers.editUser({
          _id: user._id,
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

  // Handle projects - remove application from projects' application lists
  try {
    const relatedProjects = await projectCollection()
      .find({
        "applications._id": applicationId,
      })
      .toArray();

    if (relatedProjects.length > 0) {
      for (const project of relatedProjects) {
        resolvers.editProject({
          _id: project._id,
          applicationRemovalId: applicationId,
        });
      }

      console.log(
        `Updated users' application associations for application ${applicationId}`
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
  // Handle users - edited application from users' application lists
  try {
    const relatedUsers = await userCollection()
      .find({
        "applications._id": applicationId,
      })
      .toArray();

    if (relatedUsers.length > 0) {
      for (const user of relatedUsers) {
        resolvers.editUser({
          _id: user._id,
          applicationEditId: applicationId,
        });
      }

      console.log(
        `Updated users' application associations for application ${applicationId}`
      );
    }
  } catch (error) {
    console.error(
      `Failed to edit application association in users for application ${applicationId}: ${error.message}`
    );
    throw error;
  }

  // Handle projects - remove application from projects' application lists
  try {
    const relatedProjects = await projectCollection()
      .find({
        "applications._id": applicationId,
      })
      .toArray();

    if (relatedProjects.length > 0) {
      for (const project of relatedProjects) {
        resolvers.editProject({
          _id: project._id,
          applicationEditId: applicationId,
        });
      }

      console.log(
        `Updated projects' application associations for application ${applicationId}`
      );
    }
  } catch (error) {
    console.error(
      `Failed to edit applicatios for projects for application ${applicationId}: ${error.message}`
    );
    throw error;
  }
}

//HELPER FUNCTION: propagateCommentRemovalChanges
//Propagate project removal updates across related entities: applications, updates
export async function propagateCommentRemovalChanges(commentId) {
  // Handle applications - remove comment from applications comment lists
  try {
    const relatedApplications = await applicationCollection()
      .find({
        "comments._id": commentId,
      })
      .toArray();

    if (relatedApplications.length > 0) {
      for (const application of relatedApplications) {
        resolvers.editApplication({
          _id: application._id,
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

  // Handle updates - remove comment from updates' comment lists
  try {
    const relatedUpdates = await updateCollection()
      .find({
        "comments._id": commentId,
      })
      .toArray();

    if (relatedUpdates.length > 0) {
      for (const update of relatedUpdates) {
        resolvers.editUpdate({
          _id: update._id,
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
  // Handle applications - remove comment from applications comment lists
  try {
    const relatedApplications = await applicationCollection()
      .find({
        "comments._id": commentId,
      })
      .toArray();

    if (relatedApplications.length > 0) {
      for (const application of relatedApplications) {
        resolvers.editApplication({
          _id: application._id,
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
    const relatedUpdates = await updateCollection()
      .find({
        "comments._id": commentId,
      })
      .toArray();

    if (relatedUpdates.length > 0) {
      for (const update of relatedUpdates) {
        resolvers.editUpdate({
          _id: update._id,
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
