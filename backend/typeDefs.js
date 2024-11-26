export const typeDefs = `#graphql
    type Query{
        welcome_professor: String,
        welcome_student: String,
    }
    type Mutation {
        signUp(email: String!, password: String!, firstName: String!, lastName: String!, role: Role!, department: Department!, bio: String): String
        login(token: String!): LoginResponse!
        logout: Boolean
    }

    type User {
        _id: String!                    
        firstName: String!              
        lastName: String!               
        role: Role!                     
        department: Department!         
        bio: String                         
    }

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

        enum Role {
            STUDENT
            PROFESSOR
            ADMIN
        }

        type LoginResponse {
            message: String!
            uid: String
            email: String
            role: String
        }
`;
