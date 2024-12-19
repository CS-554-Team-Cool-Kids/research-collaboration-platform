# Research Collaboration Platform

A web-based platform designed to facilitate collaboration among professors, students, and researchers. This platform allows users to create and manage research projects, post updates, apply to projects, and communicate through comments.

## Features

- **User Management**: Sign up and authentication for professors and students.
- **Project Creation**: Professors can create and manage research projects.
- **Updates Posting**: Project members can post updates related to their projects.
- **Application System**: Students can apply to join projects.
- **Comments**: Users can comment on updates and applications to facilitate communication.
- **Search Functionality**: Search projects by title, department, creation year, and more.
- **Caching**: Implements Redis caching for improved performance.
- **GraphQL API**: Utilizes GraphQL for efficient data querying and manipulation.

## Technologies Used

- **Backend**: Node.js, Express.js, GraphQL
- **Frontend**: React.js
- **Database**: MongoDB
- **Caching**: Redis
- **Authentication**: Firebase Authentication
- **Version Control**: Git and GitHub

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (v14 or later)
- npm (v6 or later)
- MongoDB
- Redis
- Firebase account for authentication

---

### Installation

To run the project locally on your device:

#### 1. **Clone the Repository**

```bash
git clone https://github.com/CS-554-Team-Cool-Kids/research-collaboration-platform.git
cd research-collaboration-platform
```

#### 2. **Set Up the Frontend**

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:8080**

#### 3. **Set Up the Backend**

#### Make sure redis is running properly

```bash
redis-stack-server
```

Redis runs on port **6379**.

```bash
cd backend
npm install
npm run seed
npm start
```

- **Apollo Server**: `http://localhost:4000`
- **Socket.io**: `http://localhost:4001`

#### 4. **Start Redis Server**

In a new terminal window, start the Redis server:

```bash
redis-stack-server
```

Redis runs on port **6379**.

---

### Usage

1. Start both **frontend** and **backend** as described above.
2. Ensure Redis and MongoDB servers are running for smooth functionality.
3. Access the React App by navigating to **http://localhost:5173** in your browser.

---

### Ports

| Service              | Port   |
| -------------------- | ------ |
| **React App**        | `8080` |
| **Apollo Server**    | `4000` |
| **Socket.io Server** | `4001` |
| **Redis Server**     | `6379` |

---

---
Registered Users to use for direct login:

1. email: amsith@stevens.edu, password: Alice@2023, role: "PROFESSOR"
2. email: jode@stevens.edu, password: John@2023, role: "STUDENT"
3. email: bjohnson@stevens.edu, password: Bob#1987, role: "PROFESSOR"
4. email: ljohnson@stevens.edu, password: Liam2023@, role: "STUDENT"


---

### Deployed Project

View the deployed project here: **http://react.ahh7angxctcngae0.eastus2.azurecontainer.io:8080/**

---

### Contribution

Feel free to fork the repository, open issues, or submit pull requests. Contributions are welcome!

---

### License

This project is licensed under the MIT License.

---

### Acknowledgments

Special thanks to the team for their hard work and collaboration!
---
