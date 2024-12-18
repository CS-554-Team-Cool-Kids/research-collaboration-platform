import {
  users,
  projects,
  applications,
  updates,
} from "../config/mongoCollections.js";
import admin from "firebase-admin";
import { ObjectId } from "mongodb";
import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import dotenv from "dotenv";
dotenv.config();

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const professors = [
  {
    _id: { $oid: "000000000000000000000001" },
    firstName: "Alice",
    lastName: "Smith",
    email: "asmith@stevens.edu",
    password: "Alice@2023",
    role: "PROFESSOR",
    department: "COMPUTER_SCIENCE",
    bio: null,
  },
  {
    _id: { $oid: "000000000000000000000002" },
    firstName: "Bob",
    lastName: "Johnson",
    email: "bjohnson@stevens.edu",
    password: "Bob#1987",
    role: "PROFESSOR",
    department: "ELECTRICAL_AND_COMPUTER_ENGINEERING",
    bio: null,
  },
  {
    _id: { $oid: "000000000000000000000003" },
    firstName: "Cathy",
    lastName: "Williams",
    email: "cwilliams@stevens.edu",
    password: "Cathy2023!",
    role: "PROFESSOR",
    department: "MATHEMATICAL_SCIENCES",
    bio: null,
  },
  {
    _id: { $oid: "000000000000000000000004" },
    firstName: "David",
    lastName: "Brown",
    email: "dbrown@stevens.edu",
    password: "David2023*",
    role: "PROFESSOR",
    department: "MECHANICAL_ENGINEERING",
    bio: null,
  },
  {
    _id: { $oid: "000000000000000000000005" },
    firstName: "Eve",
    lastName: "Jones",
    email: "ejones@stevens.edu",
    password: "Eve#1234",
    role: "PROFESSOR",
    department: "BIOMEDICAL_ENGINEERING",
    bio: null,
  },
  {
    _id: { $oid: "000000000000000000000006" },
    firstName: "Frank",
    lastName: "Garcia",
    email: "fgarcia@stevens.edu",
    password: "Frank@789",
    role: "PROFESSOR",
    department: "CHEMISTRY_AND_CHEMICAL_BIOLOGY",
    bio: null,
  },
  {
    _id: { $oid: "000000000000000000000007" },
    firstName: "Grace",
    lastName: "Martinez",
    email: "gmartinez@stevens.edu",
    password: "Grace!2023",
    role: "PROFESSOR",
    department: "PHYSICS",
    bio: null,
  },
  {
    _id: { $oid: "000000000000000000000008" },
    firstName: "Henry",
    lastName: "Lee",
    email: "hlee@stevens.edu",
    password: "Henry2023@",
    role: "PROFESSOR",
    department: "SYSTEMS_AND_ENTERPRISES",
    bio: null,
  },
  {
    _id: { $oid: "000000000000000000000009" },
    firstName: "Ivy",
    lastName: "Taylor",
    email: "itaylor@stevens.edu",
    password: "Ivy2023#",
    role: "PROFESSOR",
    department: "CHEMICAL_ENGINEERING_AND_MATERIALS_SCIENCE",
    bio: null,
  },
  {
    _id: { $oid: "000000000000000000000010" },
    firstName: "Jack",
    lastName: "Harris",
    email: "jharris@stevens.edu",
    password: "Jack123!@",
    role: "PROFESSOR",
    department: "CIVIL_ENVIRONMENTAL_AND_OCEAN_ENGINEERING",
    bio: null,
  },
  {
    _id: { $oid: "000000000000000000000011" },
    firstName: "Karen",
    lastName: "White",
    email: "kwhite@stevens.edu",
    password: "Karen!2020",
    role: "PROFESSOR",
    department: "COMPUTER_SCIENCE",
    bio: null,
  },
  {
    _id: { $oid: "000000000000000000000012" },
    firstName: "Leo",
    lastName: "King",
    email: "lking@stevens.edu",
    password: "Leo!1234",
    role: "PROFESSOR",
    department: "ELECTRICAL_AND_COMPUTER_ENGINEERING",
    bio: null,
  },
  {
    _id: { $oid: "000000000000000000000013" },
    firstName: "Mia",
    lastName: "Scott",
    email: "mscott@stevens.edu",
    password: "Mia@5678",
    role: "PROFESSOR",
    department: "MATHEMATICAL_SCIENCES",
    bio: null,
  },
  {
    _id: { $oid: "000000000000000000000014" },
    firstName: "Nina",
    lastName: "Moore",
    email: "nmoore@stevens.edu",
    password: "Nina#4567",
    role: "PROFESSOR",
    department: "MECHANICAL_ENGINEERING",
    bio: null,
  },
  {
    _id: { $oid: "000000000000000000000015" },
    firstName: "Owen",
    lastName: "Clark",
    email: "oclark@stevens.edu",
    password: "Owen2023*",
    role: "PROFESSOR",
    department: "BIOMEDICAL_ENGINEERING",
    bio: null,
  },
  {
    _id: { $oid: "000000000000000000000016" },
    firstName: "Paula",
    lastName: "Hall",
    email: "phall@stevens.edu",
    password: "Paula@890",
    role: "PROFESSOR",
    department: "CHEMISTRY_AND_CHEMICAL_BIOLOGY",
    bio: null,
  },
  {
    _id: { $oid: "000000000000000000000017" },
    firstName: "Quinn",
    lastName: "Adams",
    email: "qadams@stevens.edu",
    password: "Quinn123!",
    role: "PROFESSOR",
    department: "PHYSICS",
    bio: null,
  },
  {
    _id: { $oid: "000000000000000000000018" },
    firstName: "Ryan",
    lastName: "Baker",
    email: "rbaker@stevens.edu",
    password: "Ryan#7890",
    role: "PROFESSOR",
    department: "SYSTEMS_AND_ENTERPRISES",
    bio: null,
  },
  {
    _id: { $oid: "000000000000000000000019" },
    firstName: "Sophia",
    lastName: "Carter",
    email: "scarter@stevens.edu",
    password: "Sophia2023@",
    role: "PROFESSOR",
    department: "CHEMICAL_ENGINEERING_AND_MATERIALS_SCIENCE",
    bio: null,
  },
  {
    _id: { $oid: "000000000000000000000020" },
    firstName: "Tyler",
    lastName: "Evans",
    email: "tevans@stevens.edu",
    password: "Tyler#2345",
    role: "PROFESSOR",
    department: "CIVIL_ENVIRONMENTAL_AND_OCEAN_ENGINEERING",
    bio: null,
  },
];

const projectsSeed = [
  {
    _id: { $oid: "6760a5a56a057dfdb2ff7dab" },
    title: "AI-Powered Drug Discovery",
    createdDate: "2024-12-16T22:11:49.301Z",
    description:
      "This project focuses on utilizing artificial intelligence and machine learning to accelerate the drug discovery process. By analyzing massive datasets of chemical compounds, biological interactions, and clinical trials, the system identifies potential drug candidates and predicts their efficacy. The project incorporates predictive analytics, natural language processing for analyzing research papers, and computer vision for studying molecular structures. The outcomes aim to reduce the time and cost of bringing new drugs to market while ensuring precision and safety in treatments.",
    department: "BIOMEDICAL_ENGINEERING",
    professors: ["000000000000000000000001"],
    students: [],
  },
  {
    _id: { $oid: "6760a5a56a057dfdb2ff7dac" },
    title: "Renewable Energy Optimization",
    createdDate: "2024-12-16T22:15:49.301Z",
    description:
      "This project explores the optimization of renewable energy systems, focusing on wind and solar power. It includes designing algorithms for dynamic energy management and predictive maintenance of renewable energy farms. The team integrates IoT-enabled devices for real-time data collection and develops machine learning models to forecast energy output based on weather patterns. The ultimate goal is to maximize energy efficiency and support sustainable power generation.",
    department: "CHEMICAL_ENGINEERING_AND_MATERIALS_SCIENCE",
    professors: ["000000000000000000000002"],
    students: [],
  },
  {
    _id: { $oid: "6760a5a56a057dfdb2ff7dad" },
    title: "Quantum Computing for Cryptography",
    createdDate: "2024-12-16T22:20:49.301Z",
    description:
      "This project aims to harness quantum computing capabilities for creating unbreakable encryption methods. By leveraging quantum algorithms like Shor's and Grover's, the project focuses on developing next-generation cryptographic protocols that can withstand attacks from classical and quantum computers. The research also explores post-quantum cryptography solutions, ensuring data security in a quantum future.",
    department: "CHEMISTRY_AND_CHEMICAL_BIOLOGY",
    professors: ["000000000000000000000003"],
    students: [],
  },
  {
    _id: { $oid: "6760a5a56a057dfdb2ff7dae" },
    title: "Smart City Infrastructure",
    createdDate: "2024-12-16T22:25:49.301Z",
    description:
      "This project focuses on creating a comprehensive framework for smart city infrastructure. It includes developing IoT-based systems for real-time monitoring of utilities, traffic, and waste management. The project aims to design predictive analytics to optimize resource allocation and enhance urban sustainability. It also incorporates citizen engagement through mobile apps and dashboards to provide real-time insights and feedback mechanisms.",
    department: "MATHEMATICAL_SCIENCES",
    professors: ["000000000000000000000004"],
    students: [],
  },
  {
    _id: { $oid: "6760a5a56a057dfdb2ff7daf" },
    title: "Advanced Robotics for Healthcare",
    createdDate: "2024-12-16T22:30:49.301Z",
    description:
      "This project investigates the application of advanced robotics in healthcare settings, focusing on surgical assistance, patient care, and rehabilitation. The team develops autonomous robotic systems that can perform precise and minimally invasive surgeries. Additionally, the project explores assistive robots for patient mobility and recovery. The research incorporates AI for real-time decision-making and feedback.",
    department: "MECHANICAL_ENGINEERING",
    professors: ["000000000000000000000005"],
    students: [],
  },
  {
    _id: { $oid: "6760a5a56a057dfdb2ff7db0" },
    title: "Blockchain for Supply Chain Management",
    createdDate: "2024-12-16T22:35:49.301Z",
    description:
      "This project delves into using blockchain technology to enhance supply chain transparency and security. The team develops decentralized applications (dApps) to track goods from origin to destination, ensuring authenticity and quality. The project also explores smart contracts for automating transactions and reducing administrative overheads. By integrating IoT devices for real-time data collection, the system ensures seamless traceability and efficiency.",
    department: "SYSTEMS_AND_ENTERPRISES",
    professors: ["000000000000000000000006"],
    students: [],
  },
  {
    _id: { $oid: "6760a5a56a057dfdb2ff7db1" },
    title: "Augmented Reality for Education",
    createdDate: "2024-12-16T22:40:49.301Z",
    description:
      "This project investigates the application of augmented reality (AR) in educational environments. The team develops immersive AR tools for interactive learning, focusing on STEM subjects. By leveraging AR, the project aims to create engaging and personalized learning experiences for students. The system incorporates real-time feedback and adaptive learning paths to enhance educational outcomes.",
    department: "BIOMEDICAL_ENGINEERING",
    professors: ["000000000000000000000007"],
    students: [],
  },
  {
    _id: { $oid: "6760a5a56a057dfdb2ff7db2" },
    title: "AI-Driven Wildlife Conservation",
    createdDate: "2024-12-16T22:45:49.301Z",
    description:
      "This project focuses on using AI and machine learning to support wildlife conservation efforts. The team develops computer vision algorithms to monitor animal populations and detect poaching activities using drone-captured images and videos. The project also explores predictive models to understand migration patterns and habitat changes due to climate change. The ultimate goal is to provide actionable insights for conservation planning.",
    department: "BIOMEDICAL_ENGINEERING",
    professors: ["000000000000000000000008"],
    students: [],
  },
  {
    _id: { $oid: "6760a5a56a057dfdb2ff7db3" },
    title: "Cybersecurity in IoT Networks",
    createdDate: "2024-12-16T22:50:49.301Z",
    description:
      "This project addresses the growing concerns of cybersecurity in IoT networks. The team focuses on developing robust encryption techniques and intrusion detection systems tailored for IoT devices. The research also explores vulnerability assessment tools to identify and mitigate potential risks. By ensuring secure communication and data integrity, the project aims to establish trust in IoT-based applications.",
    department: "ELECTRICAL_AND_COMPUTER_ENGINEERING",
    professors: ["000000000000000000000009"],
    students: [],
  },
  {
    _id: { $oid: "6760a5a56a057dfdb2ff7db4" },
    title: "Next-Generation Bioinformatics Tools",
    createdDate: "2024-12-16T22:55:49.301Z",
    description:
      "This project aims to develop next-generation bioinformatics tools for analyzing genomic and proteomic data. The team integrates AI-driven analytics to identify biomarkers and genetic patterns. The research also focuses on creating visualization tools to make complex biological data accessible and interpretable for researchers and clinicians. By advancing bioinformatics technology, the project supports personalized medicine and precision healthcare.",
    department: "ELECTRICAL_AND_COMPUTER_ENGINEERING",
    professors: ["000000000000000000000010"],
    students: [],
  },
];

const seedUsers = async () => {
  const db = await dbConnection();
  const userCollection = await users();

  for (let professor of professors) {
    professor._id = new ObjectId(professor._id.$oid);

    try {
      // Try deleting the user if they exist
      const user = await admin.auth().getUserByEmail(professor.email);
      await admin.auth().deleteUser(user.uid);
      console.log(`Deleted existing user: ${professor.email}`);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        console.log(`No existing user found for email: ${professor.email}`);
      } else {
        console.error(`Error checking/deleting user: ${err.message}`);
        throw err; // Stop further execution if there's an unexpected error
      }
    }

    try {
      // Create a new user in Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email: professor.email,
        password: professor.password,
        displayName: `${professor.firstName} ${professor.lastName}`,
      });
      console.log(`Created new user: ${userRecord.email}`);

      // Save user details to the database
      await userCollection.insertOne({
        professor,
      });
    } catch (err) {
      console.error(`Error creating user for email: ${professor.email}`);
      throw err; // Stop further execution if there's an error creating the user
    }
  }
};

const students = [
  {
    _id: { $oid: "100000000000000000000001" },
    firstName: "John",
    lastName: "Doe",
    email: "jdoe@stevens.edu",
    password: "John@2023",
    role: "STUDENT",
    department: "COMPUTER_SCIENCE",
    bio: null,
  },
  {
    _id: { $oid: "100000000000000000000002" },
    firstName: "Emma",
    lastName: "Watson",
    email: "ewatson@stevens.edu",
    password: "Emma@1234",
    role: "STUDENT",
    department: "ELECTRICAL_AND_COMPUTER_ENGINEERING",
    bio: null,
  },
  {
    _id: { $oid: "100000000000000000000003" },
    firstName: "Liam",
    lastName: "Johnson",
    email: "ljohnson@stevens.edu",
    password: "Liam2023@",
    role: "STUDENT",
    department: "MECHANICAL_ENGINEERING",
    bio: null,
  },
  {
    _id: { $oid: "100000000000000000000004" },
    firstName: "Sophia",
    lastName: "Brown",
    email: "sbrown@stevens.edu",
    password: "Sophia#2024",
    role: "STUDENT",
    department: "BIOMEDICAL_ENGINEERING",
    bio: null,
  },
  {
    _id: { $oid: "100000000000000000000005" },
    firstName: "Noah",
    lastName: "Williams",
    email: "nwilliams@stevens.edu",
    password: "Noah!5678",
    role: "STUDENT",
    department: "CHEMISTRY_AND_CHEMICAL_BIOLOGY",
    bio: null,
  },
  {
    _id: { $oid: "100000000000000000000006" },
    firstName: "Ava",
    lastName: "Davis",
    email: "adavis@stevens.edu",
    password: "Ava2023*",
    role: "STUDENT",
    department: "PHYSICS",
    bio: null,
  },
  {
    _id: { $oid: "100000000000000000000007" },
    firstName: "Ethan",
    lastName: "Miller",
    email: "emiller@stevens.edu",
    password: "Ethan@123",
    role: "STUDENT",
    department: "SYSTEMS_AND_ENTERPRISES",
    bio: null,
  },
  {
    _id: { $oid: "100000000000000000000008" },
    firstName: "Isabella",
    lastName: "Garcia",
    email: "igarcia@stevens.edu",
    password: "Isabella@2023",
    role: "STUDENT",
    department: "MATHEMATICAL_SCIENCES",
    bio: null,
  },
  {
    _id: { $oid: "100000000000000000000009" },
    firstName: "Mason",
    lastName: "Martinez",
    email: "mmartinez@stevens.edu",
    password: "Mason#7890",
    role: "STUDENT",
    department: "CIVIL_ENVIRONMENTAL_AND_OCEAN_ENGINEERING",
    bio: null,
  },
  {
    _id: { $oid: "100000000000000000000010" },
    firstName: "Olivia",
    lastName: "Hernandez",
    email: "ohernandez@stevens.edu",
    password: "Olivia2024*",
    role: "STUDENT",
    department: "CHEMICAL_ENGINEERING_AND_MATERIALS_SCIENCE",
    bio: null,
  },
  {
    _id: { $oid: "100000000000000000000011" },
    firstName: "Lucas",
    lastName: "Moore",
    email: "lmoore@stevens.edu",
    password: "Lucas@3456",
    role: "STUDENT",
    department: "MECHANICAL_ENGINEERING",
    bio: null,
  },
  {
    _id: { $oid: "100000000000000000000012" },
    firstName: "Charlotte",
    lastName: "Taylor",
    email: "ctaylor@stevens.edu",
    password: "Charlotte@123",
    role: "STUDENT",
    department: "COMPUTER_SCIENCE",
    bio: null,
  },
  {
    _id: { $oid: "100000000000000000000013" },
    firstName: "Benjamin",
    lastName: "Anderson",
    email: "banderson@stevens.edu",
    password: "Benjamin2023!",
    role: "STUDENT",
    department: "ELECTRICAL_AND_COMPUTER_ENGINEERING",
    bio: null,
  },
  {
    _id: { $oid: "100000000000000000000014" },
    firstName: "Mia",
    lastName: "Thomas",
    email: "mthomas@stevens.edu",
    password: "Mia@7890",
    role: "STUDENT",
    department: "PHYSICS",
    bio: null,
  },
  {
    _id: { $oid: "100000000000000000000015" },
    firstName: "Alexander",
    lastName: "Jackson",
    email: "ajackson@stevens.edu",
    password: "Alexander!2024",
    role: "STUDENT",
    department: "CHEMISTRY_AND_CHEMICAL_BIOLOGY",
    bio: null,
  },
  {
    _id: { $oid: "100000000000000000000016" },
    firstName: "Ella",
    lastName: "White",
    email: "ewhite@stevens.edu",
    password: "Ella@5678",
    role: "STUDENT",
    department: "MATHEMATICAL_SCIENCES",
    bio: null,
  },
  {
    _id: { $oid: "100000000000000000000017" },
    firstName: "Daniel",
    lastName: "Harris",
    email: "dharris@stevens.edu",
    password: "Daniel#2345",
    role: "STUDENT",
    department: "BIOMEDICAL_ENGINEERING",
    bio: null,
  },
  {
    _id: { $oid: "100000000000000000000018" },
    firstName: "Scarlett",
    lastName: "Clark",
    email: "sclark@stevens.edu",
    password: "Scarlett@2023",
    role: "STUDENT",
    department: "SYSTEMS_AND_ENTERPRISES",
    bio: null,
  },
  {
    _id: { $oid: "100000000000000000000019" },
    firstName: "James",
    lastName: "Lopez",
    email: "jlopez@stevens.edu",
    password: "James2024@",
    role: "STUDENT",
    department: "CIVIL_ENVIRONMENTAL_AND_OCEAN_ENGINEERING",
    bio: null,
  },
  {
    _id: { $oid: "100000000000000000000020" },
    firstName: "Harper",
    lastName: "Hill",
    email: "hhill@stevens.edu",
    password: "Harper!3456",
    role: "STUDENT",
    department: "CHEMICAL_ENGINEERING_AND_MATERIALS_SCIENCE",
    bio: null,
  },
];

const seedStudents = async () => {
  const db = await dbConnection();
  const userCollection = await users();

  for (let student of students) {
    // Ensure _id is properly formatted as an ObjectId
    student._id = new ObjectId(student._id.$oid);

    try {
      // Check if the user already exists in Firebase Authentication
      const user = await admin.auth().getUserByEmail(student.email);
      await admin.auth().deleteUser(user.uid); // Delete the user if they exist
      console.log(`Deleted existing user: ${student.email}`);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        console.log(`No existing user found for email: ${student.email}`);
      } else {
        console.error(`Error checking/deleting user: ${err.message}`);
        throw err; // Stop further execution if there's an unexpected error
      }
    }

    try {
      // Create a new user in Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email: student.email,
        password: student.password,
        displayName: `${student.firstName} ${student.lastName}`,
      });
      console.log(`Created new user: ${userRecord.email}`);
    } catch (err) {
      console.error(`Error creating user for email: ${student.email}`);
      throw err; // Stop further execution if there's an error creating the user
    }

    try {
      // Insert the student directly into the database
      await userCollection.updateOne(
        { _id: student._id }, // Ensure upsert is based on _id
        { $set: student },
        { upsert: true } // Insert if not already present
      );
      console.log(`Inserted/updated student: ${student.email}`);
    } catch (err) {
      console.error(
        `Error inserting/updating student in database: ${err.message}`
      );
      throw err; // Stop further execution if there's an error inserting the student
    }
  }

  console.log("All students seeded successfully");
};

//   console.log(professors);
//   await userCollection.insertMany(professors);
//   console.log("Professors added successfully");
//   closeConnection();
// };

// seedUsers();
// console.log(professors.length);

// const seedProjects = async () => {
//   for (let project of projectsSeed) {
//     project._id = new ObjectId();
//   }
//   const db = await dbConnection();
//   await db.dropCollection("projects");
//   const projectCollection = await projects();
//   await projectCollection.insertMany(projectsSeed);
//   console.log("Projects added successfully");
//   closeConnection();
// };

// seedProjects();

// const applicationsList = JSON.parse(`[
//     {
//       "_id": "6761d5f3b77a090274003324",
//       "applicantId": "6761d1dab77a0902740032f1",
//       "projectId": "6761d45bb77a09027400330b",
//       "applicationDate": "2024-12-17T19:50:11.968Z",
//       "lastUpdatedDate": "2024-12-17T19:50:11.968Z",
//       "status": "PENDING"
//     },
//     {
//       "_id": "6761d5f4b77a090274003325",
//       "applicantId": "6761d265b77a0902740032f2",
//       "projectId": "6761d4cab77a09027400331c",
//       "applicationDate": "2024-12-17T19:50:12.004Z",
//       "lastUpdatedDate": "2024-12-17T19:50:12.004Z",
//       "status": "PENDING"
//     },
//     {
//       "_id": "6761d5f4b77a090274003326",
//       "applicantId": "6761d19e16b463e457017144",
//       "projectId": "6761d45bb77a09027400330c",
//       "applicationDate": "2024-12-17T19:50:12.011Z",
//       "lastUpdatedDate": "2024-12-17T19:50:12.011Z",
//       "status": "PENDING"
//     },
//     {
//       "_id": "6761d5f4b77a090274003327",
//       "applicantId": "6761d38fb77a0902740032fd",
//       "projectId": "6761d4cab77a09027400331a",
//       "applicationDate": "2024-12-17T19:50:12.018Z",
//       "lastUpdatedDate": "2024-12-17T19:50:12.018Z",
//       "status": "PENDING"
//     },
//     {
//       "_id": "6761d5f4b77a090274003328",
//       "applicantId": "6761d19f16b463e457017145",
//       "projectId": "6761d4cab77a090274003316",
//       "applicationDate": "2024-12-17T19:50:12.022Z",
//       "lastUpdatedDate": "2024-12-17T19:50:12.023Z",
//       "status": "PENDING"
//     },
//     {
//       "_id": "6761d5f4b77a090274003329",
//       "applicantId": "6761d266b77a0902740032f4",
//       "projectId": "6761d563b77a090274003321",
//       "applicationDate": "2024-12-17T19:50:12.029Z",
//       "lastUpdatedDate": "2024-12-17T19:50:12.029Z",
//       "status": "PENDING"
//     },
//     {
//       "_id": "6761d5f4b77a09027400332a",
//       "applicantId": "6761d19f16b463e457017146",
//       "projectId": "6761d45bb77a09027400330f",
//       "applicationDate": "2024-12-17T19:50:12.034Z",
//       "lastUpdatedDate": "2024-12-17T19:50:12.034Z",
//       "status": "PENDING"
//     },
//     {
//       "_id": "6761d5f4b77a09027400332b",
//       "applicantId": "6761d267b77a0902740032f5",
//       "projectId": "6761d4cab77a090274003318",
//       "applicationDate": "2024-12-17T19:50:12.038Z",
//       "lastUpdatedDate": "2024-12-17T19:50:12.038Z",
//       "status": "PENDING"
//     },
//     {
//       "_id": "6761d5f4b77a09027400332c",
//       "applicantId": "6761d1a016b463e457017147",
//       "projectId": "6761d45bb77a09027400330e",
//       "applicationDate": "2024-12-17T19:50:12.044Z",
//       "lastUpdatedDate": "2024-12-17T19:50:12.044Z",
//       "status": "PENDING"
//     },
//     {
//       "_id": "6761d5f4b77a09027400332d",
//       "applicantId": "6761d267b77a0902740032f6",
//       "projectId": "6761d4cab77a09027400331d",
//       "applicationDate": "2024-12-17T19:50:12.050Z",
//       "lastUpdatedDate": "2024-12-17T19:50:12.050Z",
//       "status": "PENDING"
//     },
//     {
//       "_id": "6761d65fb77a09027400332e",
//       "applicantId": "6761d38eb77a0902740032fc",
//       "projectId": "6761d45bb77a09027400330b",
//       "applicationDate": "2024-12-17T19:51:59.318Z",
//       "lastUpdatedDate": "2024-12-17T19:51:59.318Z",
//       "status": "PENDING"
//     },
//     {
//       "_id": "6761d65fb77a09027400332f",
//       "applicantId": "6761d38fb77a0902740032fd",
//       "projectId": "6761d45bb77a09027400330c",
//       "applicationDate": "2024-12-17T19:51:59.323Z",
//       "lastUpdatedDate": "2024-12-17T19:51:59.323Z",
//       "status": "PENDING"
//     },
//     {
//       "_id":"6761d65fb77a090274003330",
//       "applicantId": "6761d19f16b463e457017145",
//       "projectId": "6761d563b77a090274003321",
//       "applicationDate": "2024-12-17T19:51:59.330Z",
//       "lastUpdatedDate": "2024-12-17T19:51:59.330Z",
//       "status": "PENDING"
//     },
//     {
//       "_id": "6761d65fb77a090274003331"
//       ,
//       "applicantId": "6761d266b77a0902740032f4",
//       "projectId": "6761d4cab77a090274003316",
//       "applicationDate": "2024-12-17T19:51:59.334Z",
//       "lastUpdatedDate": "2024-12-17T19:51:59.334Z",
//       "status": "PENDING"
//     },
//     {
//       "_id": "6761d65fb77a090274003332"
//       ,
//       "applicantId": "6761d1a016b463e457017147",
//       "projectId": "6761d4cab77a09027400331d",
//       "applicationDate": "2024-12-17T19:51:59.337Z",
//       "lastUpdatedDate": "2024-12-17T19:51:59.337Z",
//       "status": "PENDING"
//     }
//   ]`);

// // console.log(applications);

// const seedApplications = async () => {
//   const db = await dbConnection();
//   await db.dropCollection("applications");
//   const applicationCollection = await applications();
//   const usersCollection = await users();
//   const projectsCollection = await projects();
//   const students = await usersCollection
//     .find({
//       role: "STUDENT",
//     })
//     .toArray();
//   const projectList = await projectsCollection.find().toArray();

//   for (let application of applicationsList) {
//     application._id = new ObjectId(application._id);
//     const randomStudent = students[Math.floor(Math.random() * students.length)];
//     const randomProject =
//       projectList[Math.floor(Math.random() * projectList.length)];
//     application.applicantId = randomStudent._id.toString();
//     application.projectId = randomProject._id.toString();
//     application.applicationDate = new Date();
//     application.lastUpdatedDate = new Date();
//     application.satus = "PENDING";
//   }
//   await applicationCollection.insertMany(applicationsList);
//   console.log(applicationsList);
//   console.log("Applications added successfully");
//   closeConnection();
// };

// seedApplications();

// # region Updates
// const updatesList = [
//   {
//     _id: "6761d82cb77a09027400333a",
//     posterUserId: "6761d1dab77a0902740032f1",
//     projectId: "6761d45bb77a09027400330b",
//     subject: "CALL_FOR_APPLICANTS",
//     content:
//       "We are looking for team members to join our AI-powered code review project.",
//     postedDate: "2024-12-17T19:59:40.601Z",
//   },
//   {
//     _id: "6761d82cb77a09027400333b",
//     posterUserId: "6761d2aab77a0902740032f7",
//     projectId: "6761d45bb77a09027400330b",
//     subject: "TEAM_UPDATE",
//     content: "We have added two new team members to the project team.",
//     postedDate: "2024-12-17T19:59:40.624Z",
//   },
//   {
//     _id: "6761d82cb77a09027400333c",
//     posterUserId: "6761d38fb77a0902740032fd",
//     projectId: "6761d45bb77a09027400330c",
//     subject: "PROJECT_LAUNCH",
//     content: "Our robotics design project has officially kicked off!",
//     postedDate: "2024-12-17T19:59:40.627Z",
//   },
//   {
//     _id: "6761d82cb77a09027400333d",
//     posterUserId: "6761d393b77a090274003302",
//     projectId: "6761d45bb77a09027400330c",
//     subject: "MILESTONE_REACHED",
//     content: "We successfully tested the first robotic prototype.",
//     postedDate: "2024-12-17T19:59:40.630Z",
//   },
//   {
//     _id: "6761d82cb77a09027400333e",
//     posterUserId: "6761d266b77a0902740032f4",
//     projectId: "6761d45bb77a09027400330d",
//     subject: "PROGRESS_REPORT",
//     content:
//       "Our team has completed the circuit design for the energy grid project.",
//     postedDate: "2024-12-17T19:59:40.634Z",
//   },
//   {
//     _id: "6761d82cb77a09027400333f",
//     posterUserId: "6761d393b77a090274003303",
//     projectId: "6761d45bb77a09027400330d",
//     subject: "DEADLINE_UPDATE",
//     content:
//       "The final presentation deadline has been pushed back by one week.",
//     postedDate: "2024-12-17T19:59:40.639Z",
//   },
//   {
//     _id: "6761d82cb77a090274003340",
//     posterUserId: "6761d19f16b463e457017146",
//     projectId: "6761d45bb77a09027400330f",
//     subject: "REQUEST_FOR_FEEDBACK",
//     content: "We need input on our latest design for the prosthetics project.",
//     postedDate: "2024-12-17T19:59:40.644Z",
//   },
//   {
//     _id: "6761d82cb77a090274003341",
//     posterUserId: "6761d394b77a090274003304",
//     projectId: "6761d45bb77a09027400330f",
//     subject: "FUNDING_UPDATE",
//     content:
//       "We received new grant funding to advance the prosthetics project.",
//     postedDate: "2024-12-17T19:59:40.648Z",
//   },
//   {
//     _id: "6761d82cb77a090274003342",
//     posterUserId: "6761d267b77a0902740032f6",
//     projectId: "6761d4cab77a09027400331d",
//     subject: "EVENT_ANNOUNCEMENT",
//     content: "Join us for a seminar on sustainable water management.",
//     postedDate: "2024-12-17T19:59:40.651Z",
//   },
//   {
//     _id: "6761d82cb77a090274003343",
//     posterUserId: "6761d395b77a090274003305",
//     projectId: "6761d4cab77a09027400331d",
//     subject: "ISSUE_REPORTED",
//     content: "We've encountered delays due to water flow simulation issues.",
//     postedDate: "2024-12-17T19:59:40.656Z",
//   },
//   {
//     _id: "6761d82cb77a090274003344",
//     posterUserId: "6761d38eb77a0902740032fc",
//     projectId: "6761d45bb77a09027400330b",
//     subject: "PUBLISHED_ANNOUNCEMENT",
//     content: "Our paper on AI code review was published in a leading journal.",
//     postedDate: "2024-12-17T19:59:40.660Z",
//   },
//   {
//     _id: "6761d82cb77a090274003345",
//     posterUserId: "6761d392b77a090274003301",
//     projectId: "6761d45bb77a09027400330b",
//     subject: "FINAL_RESULTS",
//     content: "We successfully demonstrated the AI-powered code review tool.",
//     postedDate: "2024-12-17T19:59:40.663Z",
//   },
//   {
//     _id: "6761d82cb77a090274003346",
//     posterUserId: "6761d1a016b463e457017147",
//     projectId: "6761d4cab77a09027400331d",
//     subject: "PROJECT_COMPLETION",
//     content: "The sustainable water management project has been completed.",
//     postedDate: "2024-12-17T19:59:40.666Z",
//   },
//   {
//     _id: "6761d82cb77a090274003347",
//     posterUserId: "6761d395b77a090274003305",
//     projectId: "6761d45bb77a09027400330f",
//     subject: "TEAM_UPDATE",
//     content: "We have expanded the team with two new researchers.",
//     postedDate: "2024-12-17T19:59:40.670Z",
//   },
//   {
//     _id: "6761d82cb77a090274003348",
//     posterUserId: "6761d19f16b463e457017145",
//     projectId: "6761d563b77a090274003321",
//     subject: "PROGRESS_REPORT",
//     content: "We've completed phase 1 of the smart grid integration project.",
//     postedDate: "2024-12-17T19:59:40.674Z",
//   },
//   {
//     _id: "6761d867b77a090274003349",
//     posterUserId: "6761d2aab77a0902740032f7",
//     projectId: "6761d45bb77a09027400330b",
//     subject: "FUNDING_UPDATE",
//     content:
//       "We secured additional funding to enhance the AI-powered code review system.",
//     postedDate: "2024-12-17T20:00:39.577Z",
//   },
//   {
//     _id: "6761d867b77a09027400334a",
//     posterUserId: "6761d393b77a090274003302",
//     projectId: "6761d45bb77a09027400330c",
//     subject: "CALL_FOR_APPLICANTS",
//     content:
//       "We are looking for skilled contributors to join the robotics design team.",
//     postedDate: "2024-12-17T20:00:39.661Z",
//   },
//   {
//     _id: "6761d867b77a09027400334b",
//     posterUserId: "6761d267b77a0902740032f6",
//     projectId: "6761d4cab77a09027400331d",
//     subject: "DEADLINE_UPDATE",
//     content:
//       "The team has extended the submission deadline for the water management project.",
//     postedDate: "2024-12-17T20:00:39.667Z",
//   },
//   {
//     _id: "6761d867b77a09027400334c",
//     posterUserId: "6761d2acb77a0902740032fa",
//     projectId: "6761d45bb77a09027400330f",
//     subject: "MILESTONE_REACHED",
//     content:
//       "The team successfully completed the first prototype for the prosthetic limb.",
//     postedDate: "2024-12-17T20:00:39.671Z",
//   },
//   {
//     _id: "6761d867b77a09027400334d",
//     posterUserId: "6761d1dab77a0902740032f1",
//     projectId: "6761d45bb77a09027400330b",
//     subject: "EVENT_ANNOUNCEMENT",
//     content:
//       "Join us for a webinar showcasing the AI-powered code review system.",
//     postedDate: "2024-12-17T20:00:39.676Z",
//   },
// ];

// const seedUpdates = async () => {
//   const db = await dbConnection();
//   await db.dropCollection("updates");
//   const userCollection = await users();
//   const projectCollection = await projects();
//   const allUsers = await userCollection.find().toArray();
//   const allProjects = await projectCollection.find().toArray();
//   for (let update of updatesList) {
//     update._id = new ObjectId(update._id);
//     const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
//     const randomProject =
//       allProjects[Math.floor(Math.random() * allProjects.length)];
//     update.posterUserId = randomUser._id.toString();
//     update.projectId = randomProject._id.toString();
//     update.postedDate = new Date();
//   }
//   const updateCollection = await updates();
//   // await updateCollection.insertMany(updates);
//   console.log(updatesList);
//   console.log("Updates added successfully");
//   closeConnection();
// };

// seedUpdates();
//#endregion
