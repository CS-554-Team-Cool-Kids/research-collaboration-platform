import admin from "firebase-admin";
import { users } from "../config/mongoCollections.js";

import { GraphQLError } from "graphql";

import {
  checkIsProperFirstName,
  checkIsProperString,
  checkLastName,
  validateEmail,
} from "../helpers.js";

export const userResolvers = {
  Mutation: {
    signUp: async (
      _,
      { email, password, firstName, lastName, role, department, bio }
    ) => {
      email = validateEmail(email);
      firstName = checkIsProperFirstName(firstName, "First Name");
      lastName = checkLastName(lastName, "Last Name");
      role = checkIsProperString(role, "Role");
      department = checkIsProperString(department, "Department");
      if (bio) bio = checkIsProperString(bio, "Bio");
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      });
      const usersCollection = await users();
      const newUser = {
        _id: userRecord.uid,
        email,
        firstName,
        lastName,
        role,
        department,
        bio,
      };

      const insertInfo = await usersCollection.insertOne(newUser);
      if (!insertInfo.acknowledged)
        throw new GraphQLError("Could not add user", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      return `User ${userRecord.uid} created successfully`;
    },
    login: async (_, { token }) => {
      try {
        token = checkIsProperString(token, "Token");
        const decodedToken = await admin.auth().verifyIdToken(token);
        const uid = decodedToken.uid;
        const email = decodedToken.email;
        const usersCollection = await users();
        const user = await usersCollection.findOne({ _id: uid });
        return {
          message: "Token verified successfully",
          uid,
          email,
          role: user.role,
        };
      } catch (error) {
        throw new Error("Invalid or expired token");
      }
    },
    // logout: async (_, __, { req }) => {
    //   const authHeader = req.headers.authorization || "";
    //   const token = authHeader.split(" ")[1];
    //   if (!token) throw new Error("Not authenticated");

    //   await firebase.auth().signOut();
    //   return true;
    // },
  },
};
