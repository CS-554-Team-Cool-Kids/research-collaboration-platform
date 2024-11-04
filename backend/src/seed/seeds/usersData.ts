import { ObjectId } from "mongodb";

interface UserPreferences {
  darkmode: number;
}

interface User {
  _id: ObjectId;
  firstname: string;
  lastname: string;
  email: string;
  type: string;
  status: string;
  password: string;
  preferences: UserPreferences;
}

const users: User[] = [
  {
    _id: new ObjectId("657f72f3efbdd2479230fa8c"),
    firstname: "Admin",
    lastname: "One",
    email: "admin@stevens.edu",
    type: "Admin",
    status: "Active",
    password:
      "$argon2id$v=19$m=65536,t=3,p=1$DxCgb1jWlWfAb6Cag0IXJA$7dutmGHJwQjrBBVkDV65h3Wt7zBX4pWVhQxVk5jJIbo",
    preferences: {
      darkmode: 0,
    },
  },
  {
    _id: new ObjectId("657f86ee49985ad997d14d0a"),
    firstname: "Prof",
    lastname: "One",
    email: "prof1@stevens.edu",
    type: "Professor",
    status: "Active",
    password:
      "$argon2id$v=19$m=65536,t=3,p=1$DxCgb1jWlWfAb6Cag0IXJA$7dutmGHJwQjrBBVkDV65h3Wt7zBX4pWVhQxVk5jJIbo",
    preferences: {
      darkmode: 1,
    },
  },
  {
    _id: new ObjectId("657f909849985ad997d14d0b"),
    firstname: "Professor",
    lastname: "Professorson",
    email: "prof2@stevens.edu",
    type: "Professor",
    status: "Active",
    password:
      "$argon2id$v=19$m=65536,t=3,p=1$DxCgb1jWlWfAb6Cag0IXJA$7dutmGHJwQjrBBVkDV65h3Wt7zBX4pWVhQxVk5jJIbo",
    preferences: {
      darkmode: 1,
    },
  },
  {
    _id: new ObjectId("657f90c649985ad997d14d0e"),
    firstname: "Stud",
    lastname: "One",
    email: "student1@stevens.edu",
    type: "Student",
    status: "Active",
    password:
      "$argon2id$v=19$m=65536,t=3,p=1$DxCgb1jWlWfAb6Cag0IXJA$7dutmGHJwQjrBBVkDV65h3Wt7zBX4pWVhQxVk5jJIbo",
    preferences: {
      darkmode: 1,
    },
  },
  {
    _id: new ObjectId("657f90d349985ad997d14d0f"),
    firstname: "Stud",
    lastname: "Two",
    email: "student2@stevens.edu",
    type: "Student",
    status: "Active",
    password:
      "$argon2id$v=19$m=65536,t=3,p=1$DxCgb1jWlWfAb6Cag0IXJA$7dutmGHJwQjrBBVkDV65h3Wt7zBX4pWVhQxVk5jJIbo",
    preferences: {
      darkmode: 1,
    },
  },
  {
    _id: new ObjectId("657f90f249985ad997d14d10"),
    firstname: "Stud",
    lastname: "Three",
    email: "student3@stevens.edu",
    type: "Student",
    status: "Active",
    password:
      "$argon2id$v=19$m=65536,t=3,p=1$DxCgb1jWlWfAb6Cag0IXJA$7dutmGHJwQjrBBVkDV65h3Wt7zBX4pWVhQxVk5jJIbo",
    preferences: {
      darkmode: 1,
    },
  },
];

export default users;
