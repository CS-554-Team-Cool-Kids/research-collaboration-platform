
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

    /*editUser: async (_, args) => {
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
        //"projectRemovalId",
        //"projectEditId",
        //"applicationRemovalId",
        //"applicationEditId",
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
        /*if (args.password) {
          helpers.checkArg(args.password, "string", "password");
          updateFields.password = await bcrypt.hash(args.password.trim(), 10);
        }

       // Password update
        if (args.password) {
          
          try {
            
            // First: make sure the user is defined in the firebase
            const firebaseUser = await admin.auth().getUserByEmail(userToUpdate.email);

            // Update the password in Firebase if the user exists
            await admin.auth().updateUser(firebaseUser.uid, {
              password: args.password.trim(),
            });
          
          } catch (error) {
            
            // First, specify if the firebase is not showing the user. This is happening more often, so I'm seperating it from the other errors that are possible.
            if (error.code === 'auth/user-not-found') {
              throw new GraphQLError(
                "The user does not exist in Firebase Authentication. Password update failed.",
                {
                  extensions: { code: "BAD_USER_INPUT", cause: error.message },
                }
              );
            }

            // Second, throw for other errors.
            throw new GraphQLError(
              "Failed to update the user's password in Firebase Authentication.",
              {
                extensions: {
                  code: "INTERNAL_SERVER_ERROR",
                  cause: error.message,
                },
              }
            );
          }
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

        /*
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

        const projects = await projectCollection();
        const updatedProject = await projects.findOne({ _id: updatedProjectId });
        
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
      
        const applications = await applicationCollection();
        const updatedApplication = await applications.findOne({ _id: updatedApplicationId });

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

      /*
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

    //Return updated fields of the user without exposing password
    const updatedUser = { ...userToUpdate, ...updateFields }; //Use spread to place updated fields inot the userToUpdate object
    const { password, ...safeUser } = updatedUser; //Destructure: extract password, gather the rest of properties into safeuser
    return safeUser;
  },*/

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

    /*addProject: async (_, args) => {
      // Check if required fields are present
      if (!args.title || !args.department) {
        throw new GraphQLError(
          "The title and department are required to create a project.",
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
      if (args.professorIds) {
        helpers.checkArg(args.professorIds, "array", "professorIds");
      }
      if (args.studentIds) {
        helpers.checkArg(args.studentIds, "array", "studentIds");
      }

      let toAddProfessorIds = [];
      let toAddStudentIds = [];
      
      if (args.professorIds) {
        for (const id of args.professorIds) {
          helpers.checkArg(id, "string", "id");
          toAddProfessorIds.push(id.trim());
        }
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

      if (toAddProfessorIds.length > 0) {
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
    */

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
      } 
    

    // removeProject
    // Purpose: Remove a project by ID, including its updates
    // Cache: Remove the project and its updates from the Redis cache

    /*removeProject: async (_, args) => {
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

      //DEBUG ADDITION
      const project = await projects.findOne({ _id: new ObjectId(args._id) });
      console.log("Project to delete:", project);
      if (!project) {
          throw new GraphQLError(`The project with ID of ${args._id} does not exist.`, {
              extensions: { code: "BAD_USER_INPUT" },
          });
      }

      //Use findOneandDelete to delete the project. Match based on the args._id (made to an object id)
      console.log("Attempting to delete project:", args._id);
      const deletedProject = await projects.findOneAndDelete({
        _id: new ObjectId(args._id),
      });
      console.log("Deleted project:", deletedProject);

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

      /*
      //Propagate this removal across all objects with project objects
      console.log("Propogating project removal");
      await propagators.propagateProjectRemovalChanges(args._id);
      console.log("completed propogating project removal");

      //Try/catch for redis
      try {
        // Delete projects, updates and applications cache, as these are no longer accurate
        await redisClient.del("projects");
        //await redisClient.del("updates");
       // await redisClient.del("applications");

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
    },*/

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

    // editUpdate
    // Purpose: Edit an existing update by ID
    // Cache: Update the Redis cache accordingly

    editUpdate: async (_, args) => {
      // Validate required fields
      checkArg(args._id, "string", "id");

      // Validate optional fields
      if (args.posterId) checkArg(args.posterId, "string", "id");
      if (args.subject) checkArg(args.subject, "string", "subject");
      if (args.content) checkArg(args.content, "string", "content");
      if (args.projectId) checkArg(args.projectId, "string", "id");

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
        checkSubject(args.subject);
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

    /*editUpdate: async (_, args) => {
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
        
         //const updatedComment = await getCommentById(args.commentEditId);

          // Replace the call to getCommentById with a direct MongoDB query
          const comments = await commentCollection();
          const updatedComment = await comments.findOne({ _id: updatedCommentId });
                
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
    },*/

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

      /*console.log("editApplication called with args:", args); 

      helpers.checkArg(args._id, "string", "id");

      // Check if required fields are present
      if (!args._id) {
        throw new GraphQLError("The _id field is required.", {
          //404
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      console.log("Validating allowed fields..."); // Log before field validation

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
      console.log("Fetching application collection...");
      const applications = await applicationCollection();

      //Use findOne to pull the application in question, using the args._id as the _id to match
      //Use applicationToUpdate as the local object to place the edited values to
      console.log(`Looking for application with ID: ${args._id}`);
      let applicationToUpdate = await applications.findOne({
        _id: new ObjectId(args._id),
      });

      //If an applicaiton cannot be pulled from the collection, throw an GraphQLError
      if (!applicationToUpdate) {
        console.error("Application not found:", args._id);
        throw new GraphQLError(
          "The application ID provided by the user was not valid.",
          {
            //Similar status code: 404
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }

      //Checks and updates to appliciationToUpdate

      if (args.applicantId) {
        console.log(`Updating applicant with ID: ${args.applicantId}`);
        
        helpers.checkArg(args.applicantId, "string", "id");

        //Pull users collection
        const users = await userCollection();

        //Use findOne to get the user with the id provided by the user
        const pulledUser = await users.findOne({
          _id: new ObjectId(args.applicantId),
        });

        //If user not found, throw a GraphQLError
        if (!pulledUser) {
          console.error("Applicant not found:", args.applicantId);
          throw new GraphQLError(
            "A user could not be found with the applicantId provided.",
            {
              //Similar status code: 404
              extensions: { code: "BAD_USER_INPUT" },
            }
          );
        }

        console.log("Applicant found:", pulledUser);

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
        helpers.checkArg(args.status, "string", "applicationStatus");
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
      
        //const updatedComment = await getCommentById(args.commentEditId);
         // Replace the call to getCommentById with a direct MongoDB query
        const comments = await commentCollection();
        const updatedComment = await comments.findOne({ _id: updatedCommentId });
            
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
      return applicationToUpdate;*/
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
      //await propagators.propagateApplicationRemovalChanges(args._id);

      //Delete the individual application cache, and the applications cache, as this is now out of data
      await redisClient.del(`application:${args._id}`);
      await redisClient.del("applications");

      //Return the value of deletedApplication
      return deletedApplication;
    },

    //addComment
    /*
    addComment: async (_, args) => {
      
      console.log("addComment resolver called with args:", args);
    
      // Check if required fields are present
      if (!args.commenterId || !args.commentDestination || !args.destinationId || !args.content) {
        throw new GraphQLError(
          "All fields (commenterId, commentDestination, destinationId, content) are required.",
          {
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }
    
      // Validate arguments
      try {
        helpers.checkArg(args.commenterId, "string", "id");
        helpers.checkArg(args.commentDestination, "string", "commentDestination");
        helpers.checkArg(args.destinationId, "string", "id");
        helpers.checkArg(args.content, "string", "content");
      } catch (validationError) {
        throw validationError;
      }
        
      // Pull commenter details
      let commenter;
      try {
        const users = await userCollection();
        commenter = await users.findOne({
          _id: new ObjectId(args.commenterId),
        });
      } catch (dbError) {
        console.error("Error querying user collection:", dbError);
        throw dbError;
      }
    
      if (!commenter) {
        console.error(`No user found with commenterId: ${args.commenterId}`);
        throw new GraphQLError(
          `The commenter with ID ${args.commenterId} does not exist.`,
          {
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }
        
      // Create the comment object
      const newComment = {
        _id: new ObjectId(),
        commenter: commenter,
        content: args.content.trim(),
        postedDate: new Date().toISOString(),
        commentDestination: args.commentDestination.trim().toUpperCase(),
        destinationId: args.destinationId.trim(),
      };
    
      console.log("New comment object created:", newComment);
    
      // Insert the comment into the comments collection
      let insertedComment;
      try {
        const comments = await commentCollection();
        insertedComment = await comments.insertOne(newComment);

        if (!insertedComment) {
          throw new GraphQLError("Failed to add the comment.", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }
      } catch (error) {
        console.error("Error inserting comment into the comments collection:", error);
        throw new GraphQLError("Failed to add the comment.", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
      console.log("Comment successfully inserted into database:", insertedComment);
    
      // Propagate the comment addition to related entities
      try {
        await propagators.propagateCommentAdditionChanges(
          newComment._id.toString(),
          newComment
        );
        console.log("Propagation of comment addition successful.");
      } catch (propagationError) {
        console.error("Error during propagation of comment addition:", propagationError);
        throw propagationError;
      }
    
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
    },*/
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
    
  

    /*editComment: async (_, args) => {
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
      
        updateFields.commenter = commenter;

      }

      if (Object.keys(updateFields).length === 0) {
        console.log(`No changes detected for the comment with ID ${args._id}. Skipping update.`);
        return commentToUpdate; // Return the original comment if nothing changes
      }

      //Update the comments in the mongodb. Use $set, which will not affect unupdated values
      const result = await comments.updateOne(
        { _id: commentToUpdate._id },
        { $set: updateFields }
      );

      //Propagate this removal across all objects with comment objects
      await propagators.propagateCommentEditChanges(args._id, {
        ...commentToUpdate,
        ...updateFields,
      });

      const updatedComment = { ...commentToUpdate, ...updateFields };


      try {
        
        //Update the individual comment cache
        const cacheKey = `comment:${commentToUpdate._id}`;
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
    },*/
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
    
    //Remove Comment
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
  };

export default resolvers;
