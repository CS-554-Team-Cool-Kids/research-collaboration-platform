import { professorResolvers } from "./professors.js";
import { studentResolvers } from "./students.js";

// Merge all resolvers
export const resolvers = [professorResolvers, studentResolvers];
