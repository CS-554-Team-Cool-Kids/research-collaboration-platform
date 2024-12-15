import React, { useState } from "react";

const Newsfeed = () => {
  const mockUpdates = [
    {
      _id: "1",
      posterUser: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        role: "PROFESSOR",
        department: "COMPUTER_SCIENCE",
      },
      subject: "Project Launch",
      content:
        "Our new AI research project is now live! Looking for collaborators.",
      project: {
        title: "AI Research Project",
      },
      postedDate: "2024-12-10",
      numOfComments: 3,
    },
    {
      _id: "2",
      posterUser: {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        role: "STUDENT",
        department: "ELECTRICAL_AND_COMPUTER_ENGINEERING",
      },
      subject: "Milestone Reached",
      content:
        "We’ve successfully completed the first milestone in our robotics project.",
      project: {
        title: "Robotics Project",
      },
      postedDate: "2024-12-12",
      numOfComments: 5,
    },
  ];

  const [updates] = useState(mockUpdates);

  const renderUpdate = (update) => (
    <div key={update._id} className="update-card">
      <h3>
        {update.subject}
        <span className="role-badge">{update.posterUser.role}</span>
      </h3>
      <p>{update.content}</p>
      <p>
        <strong>Project:</strong> {update.project.title}
      </p>
      <p>
        <strong>Posted By:</strong> {update.posterUser.firstName}{" "}
        {update.posterUser.lastName} ({update.posterUser.department})
      </p>
      <p>
        <strong>Posted On:</strong>{" "}
        <small>{new Date(update.postedDate).toLocaleDateString()}</small>
      </p>
      <p>
        <strong>Comments:</strong> {update.numOfComments}
      </p>
      <button
        className="btn-primary"
        onClick={() => alert("Comments feature pending implementation!")}
      >
        View Comments
      </button>
    </div>
  );

  return (
    <div className="newsfeed-container">
      <h1>Newsfeed</h1>
      <div className="updates-list">
        {updates.map((update) => renderUpdate(update))}
      </div>
    </div>
  );
};

export default Newsfeed;
