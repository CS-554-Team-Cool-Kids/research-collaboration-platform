import { professorResolvers } from "./professors.js";
import { studentResolvers } from "./students.js";
import { userResolvers } from "./userResolvers.js";

// Merge all resolvers
export const resolvers = [professorResolvers, studentResolvers, userResolvers];
