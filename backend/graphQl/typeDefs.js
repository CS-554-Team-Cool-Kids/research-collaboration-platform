//TYPEDEFS.JS
//Purpose: Create the type definitions for the query and our data
//Why: Specifies the structure of the data that can be queried or mutated

//EXPORT typeDefs CONSTANT
//TYPE: string
//#graphql: Helps indicate string represents GraphQL schema language (useful for editor appearance preferences)
export const typeDefs = `#graphql

#TYPE: Query
#Purpose: Defines the types of queries users can use to retrieve data

    type Query {
    
        #FETCH ALL
        
            # users: [User]
            # Purpose: Returns an array of all users.
            # Caching: one-hour expiration; completed in resolvers.js.
                
                users: [User]
            
            # projects: [Project]
            # Purpose: Returns an array of all projects.
            # Caching: one-hour expiration; completed in resolvers.js.
            
                projects: [Project]

            # updates: [Update]
            # Purpose: Returns an array of all updates.
            # Caching: one-hour expiration; completed in resolvers.js.
            
                updates: [Update] 
                
            # applications: [Application]
            # Purpose: Returns an array of all applications.
            # Caching: one-hour expiration; completed in resolvers.js.
            
                applications: [Application]

            # comments: [Comment]
            # Purpose: Returns an array of all comments.
            # Caching: one-hour expiration; completed in resolvers.js.
            
                comments: [Comment] 


        #GETBYID
        
            # getUserById(_id: String!): User
            # Purpose: Retrieves a single user by ID.
            # Caching: No expiration time; completed in resolvers.js.
            
                getUserById(_id: String!): User
            
            # getProjectById(_id: String!): Project
            # Purpose: Retrieves a single project by ID.
            # Caching: No expiration time; completed in resolvers.js.
            
                getProjectById(_id: String!): Project

            # getUpdateById(_id: String!): Update
            # Purpose: Retrieves a single update by ID.
            # Caching: No expiration time; completed in resolvers.js.
            
                getUpdateById(_id: String!): Update
            
            # getApplicationById(_id: String!): Application
            # Purpose: Retrieves a single application by ID.
            # Caching: No expiration time; completed in resolvers.js.
            
                getApplicationById(_id: String!): Application

            # getCommentById(_id: String!): Comment
            # Purpose: Retrieves a single comment by ID.
            # Caching: No expiration time; completed in resolvers.js.
            
                getCommentById(_id: String!): Comment

        #ADDITIONAL SEARCH FUNCTIONALITY
        
            # getProfessorsByProjectId(projectId: String!): [User]
            # Purpose: Retrieves a list of professors names for a given project by ID.
            # Caching: One-hour expiration; completed in resolvers.js.
            
                getProfessorsByProjectId(projectId: String!): [User]

            # getStudentsByProjectId(projectId: String!): [User]
            # Purpose: Retrieves a list of students names for a given project by ID.
            # Caching: One-hour expiration; completed in resolvers.js.
            
                getStudentsByProjectId(projectId: String!): [User]

            # getCommentsByUpdateId(updateId: String!): [Comment]
            # Purpose: Retrieves a list of comments for a given update by ID.
            # Caching: One-hour expiration; completed in resolvers.js.
            
                getCommentsByUpdateId(updateId: String!): [Comment]

            # getCommentsByApplicationId(applicationId: String!): [Comment]
            # Purpose: Retrieves a list of comments for a given update by ID.
            # Caching: One-hour expiration; completed in resolvers.js.
            
                getCommentsByApplicationId(applicationId: String!): [Comment]
        
            # projectsByDepartment(department: Department!): [Project]
            # Purpose: Returns an array of projects that match the specified department.
            # Caching: One-hour expiration; completed in resolvers.js.
            
                projectsByDepartment(department: Department!): [Project]
            
            # updatesBySubject(subject: UpdateSubject!): [Update]
            # Purpose: Returns an array of updates that match the specified subject.
            # Caching: One-hour expiration; completed in resolvers.js.
            
                updatesBySubject(subject: UpdateSubject!): [Update]

            # projectsByCreatedYear(min: Int!, max: Int!): [Project]
            # Purpose: Returns an array of projects established within the specified year range (inclusive).
            # Caching: One-hour expiration; completed in resolvers.js.
            # Constraints: min > 0, max >= min, max cannot be more than the current year.
            
                projectsByCreatedYear(min: Int!, max: Int!): [Project]
            
            #searchProjectByTitle(searchTerm: String!): [Project]
            # Purpose: Returns an array of projects whose titles contain the specified search term (case-insensitive).
            # Caching: One-hour expiration; completed in resolvers.js.
            
                searchProjectByTitle(searchTerm: String!): [Project]
            
            
            # Purpose: Returns an array of users whose names contain the specified search term (case-insensitive).
            # Caching: One-hour expiration; completed in resolvers.js.
            
                searchUserByName(searchTerm: String!): [User]

            # Purpose: Returns an array of projects that had the usersIds stored in the professor or student arrays
            # Caching: One-hour expiration; completed in resolvers.js.
                getProjectsByUserId (_id: String!): [Project]

    }

#TYPE DEFINITIONS

    # User Type: Definition
        
        type User {
            _id: String!                    # ObjectId, required
            firstName: String!              # required
            lastName: String!               # required
            email: String!                  # Required and should be unique
            password: String!               # Required (stored as a hash)
            role: Role!                     # required (enum)
            department: Department!         # required (enum)
            bio: String                     # not required
            applications: [Application]     # Computed Value, Array of application objects
            projects: [Project]             # Computed value, arraay of project objects
            numOfApplications: Int!         # Computed value, number of applications completed
            numOfProjects: Int!             # Computed value, number of projects involved in
        }

    # Project Type: Definition
    
        type Project {
            _id: String!                    # ObjectId, required
            title: String!                  # required
            description: String             # not required
            createdDate: String!            # ISO format, required
            department: Department!         # required (enum)
            professors: [User]             # array of user objects where Role = professor, required
            students: [User]                # array of user objects where Role = student, not required
            applications: [Application]     # array of Applicaiton objects
            numOfApplications: Int!         # Computed value, number of applications for this project
            updates: [Update]               # Computed value,
            numOfUpdates: Int!              # Computed value, the number of updates delivered about this project
        }

    # Update Type: Definition (A conglomeration of updates builds newsfeeds)
   
        type Update {
            _id: String!                    # ObjectId, required
            posterUser: User!               # Computed value, shows user object who created update
            subject: UpdateSubject!         # Enum defining the type of update, required
            content: String!                # Additional details related to project update
            project: Project!               # Computed value, shows the associated project object, required
            postedDate: String!             # ISO format, required
            comments: [Comment]             # Computed Value, shows the Array of commment objects added to update, not required
            numOfComments: Int!             # Computed value, shows the number of comments under this update
        }

    # Application Type: Definition

        type Application {
            _id: String!                    # ObjectId, required
            applicant: User!                # Computed Value, shows user object who applied to project, required
            project: Project!               # Computed Value, shows associated project object, required
            applicationDate: String!        # ISO format required
            lastUpdatedDate: String!        # ISO format required, shows when last modified
            status: ApplicationStatus!      # Enum defining where the application stands, required
            comments: [Comment]             # Computed Value, shows array of commments added to application, not required
            numOfComments: Int!             # Computed value, the number of comments under this application
        }

    # Comment Type: Definition

        type Comment {
            _id: String!                    # ObjectId, required
            commenter: User!                # Computed Value, shows the ser object who made the comment, required
            content: String!                # text content of the comment, required
            postedDate: String!             # ISO format, required
            destinationId: String!          # Reference ID for the update or application where the comment is stored
        }

    # LoginResponse Type: Definition

        type LoginResponse {
            message: String!
            _id: String
            name: String
            email: String
            role: String
        }


#ENUM DEFINITIONS

    # Role

        enum Role {
            STUDENT
            PROFESSOR
            ADMIN
        }  
            
    # Department (Only for the engineering school; possible to build out for later iterations of project)

        enum Department {
            BIOMEDICAL_ENGINEERING
            CHEMICAL_ENGINEERING_AND_MATERIALS_SCIENCE
            CHEMISTRY_AND_CHEMICAL_BIOLOGY
            CIVIL_ENVIRONMENTAL_AND_OCEAN_ENGINEERING
            COMPUTER_SCIENCE
            ELECTRICAL_AND_COMPUTER_ENGINEERING
            MATHEMATICAL_SCIENCES
            MECHANICAL_ENGINEERING
            PHYSICS
            SYSTEMS_AND_ENTERPRISES
        }

    # UpdateSubject

        enum UpdateSubject {
            CALL_FOR_APPLICANTS     # Recruiting collaborators or team members
            TEAM_UPDATE             # Changes in team members or roles
            PROJECT_LAUNCH          # Announcing project initiation
            MILESTONE_REACHED       # Achievements or significant progress
            PROGRESS_REPORT         # Regular updates on project status
            DEADLINE_UPDATE         # Upcoming or changed deadlines
            REQUEST_FOR_FEEDBACK    # Seeking input or suggestions
            FUNDING_UPDATE          # Updates on grants or budget status
            EVENT_ANNOUNCEMENT      # Workshops, seminars, or related events
            ISSUE_REPORTED          # Challenges, delays, or technical issues
            PUBLISHED_ANNOUNCEMENT  # Published papers or deliverables
            FINAL_RESULTS           # Sharing project outcomes or conclusions
            PROJECT_COMPLETION      # Declaring project completion
        }     

    # ApplicationStatus

        enum ApplicationStatus {
            PENDING        # Submitted and in review
            APPROVED       # Accepted application
            REJECTED       # Declined application
            WITHDRAWN      # Applicant withdrew application
            WAITLISTED     # Application is placed on a waiting list
        }    


    # CommentDestination

        enum CommentDestination {
                UPDATE        
                APPLICATION       
            } 

#MUTATIONS

  type Mutation {
    
    # addUser
    # Purpose: Create an user and save them to MongoDB.
    # Cache: Add the user to the Redis cache.
        
        addUser(
            firstName: String!              
            lastName: String!
            email: String!                   
            password: String!               
            role: Role!                     
            department: Department!         
            bio: String                     
        ): User
    
    # removeUser
    # Purpose: Remove a user from MongoDB.
    # Cache: Ensure both the user is removed from the Redis cache.
    
        removeUser(
            _id: String!
        ): User
    
    # editUser
    # Purpose: Update an author's details based on the provided fields.
    # Cache: Ensure the Redis cache is updated accordingly.
    
        editUser(
            _id: String!                     
            firstName: String                
            lastName: String                 
            email: String                    
            password: String                 
            role: Role                       
            department: Department           
            bio: String        
        ): User
    
    # addProject
    # Purpose: Add a new project to MongoDB
    # Cache: Add the project to Redis and ensure proper caching for related entities.
    
        addProject(
            title: String!
            department: Department!
            description: String
            professorIds: [String]      # Array of IDs for professors to associate with the project, not required, will be resolved to user objects
            studentIds: [String]        # Array of IDs for students to associate with the project, not required, will be resolved to user objects
        ): Project
    
    # removeProject
    # Purpose: Remove a project from MongoDB and clear its related data 
    # Cache: Clear the Redis cache for the project and related caches
   
        removeProject(
            _id: String!
        ): Project
    
    # editProject
    # Purpose: Update a project's detail
    # Cache: Ensure Redis cache is updated for both the project and its related entities
    
        editProject(
            _id: String!
            title: String
            description: String
            department: Department
            professorIds: [String]
            studentIds: [String]
            applicationIds: [String]
        ): Project
  
    # addUpdate
    # Purpose: Create a new update and add it to MongoDB.
    # Cache: Add the update to the Redis cache.

        addUpdate(
            posterId: String!             # ID of the User who created the update, will resolve to a user object
            subject: UpdateSubject!       # Enum defining the type of update
            content: String!              # Details about the update
            projectId: String!            # ID of the associated Project, will resolve to a project object
        ): Update
          
    # removeUpdate
    # Purpose: Remove an update
    # Cache: Ensure the update is removed from Redis cache.
   
        removeUpdate(
            _id: String!
        ): Update

    # editUpdate
    # Purpose: Update a updates's details based on the provided fields.
    # Cache: Ensure the Redis cache is updated accordingly.
       
        editUpdate(
            _id: String!                    
            posterId: String              # ID of the User who created the update, will resolve to a user object   
            subject: UpdateSubject        
            content: String                
            projectId: String             # ID of the Project associated with the update, will resolve to a project object
        ): Update

    # addApplication
    # Purpose: Add an application based on the provided fields
    # Cache: add the individaul application cache, delete applications cache
        
        addApplication(                  
            applicantId: String!          # ID of the User who applied, will resolve to a user object    
            projectId: String!            # ID of the Project, will resolve to a project object                                 
        ): Application

    # editApplication
    # Purpose: Edit an application based on the provided fields
    # Cache: add the individaul application cache, delete applications cache
        
        editApplication(
            _id: String!                    
            applicantId: String          # ID of the User who applied, will resolve to a user object    
            projectId: String            # ID of the Project, will resolve to a project object 
            status: ApplicationStatus
        ): Application

    # removeApplication
    # Purpose: Remove a application based on the provided fields
    # Cache: delete the individaul application cache, delete applications cache
        
        removeApplication(
            _id: String!
        ): Application

    # addComment
    # Purpose: Create a new comment and add it to an existing update or application.
    # Cache: add the individual comment cache, delete the comments cache; handle caches or applications/updates

        addComment(
            commenterId: String!                        # ID of the User who commented, will resolve to a user object 
            destinationId: String!                      # ID of where comment will appear
            content: String!               
        ): Comment

    # editComment
    # Purpose: Edit a comment's content; handle udpates/applications as needed
    # Cache: add the individual comment cache, delete the comments cache; handle 

        editComment(
            _id: String!
            content: String
            commenterId: String      
        ): Comment

    # removeComment
    # Purpose: Remove a comment and update the appropriate caches.
    # Cache: delete the individual comment cache, delete the comments cache; handle application/updates caches as needed

        removeComment(
            _id: String!
        ): Comment

    #login

        login(token: String!): LoginResponse!
        }
`;
