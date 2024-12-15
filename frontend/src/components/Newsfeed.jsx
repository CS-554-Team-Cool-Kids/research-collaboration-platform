import React, { useState } from "react";

const Newsfeed = () => {
  const mockUpdates = [
    {
      _id: "1",
      posterUser: {
        firstName: "John",
        lastName: "Doe",
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
    <div key={update._id} className="news-card">
      <div className="news-header">
        <div className="user-avatar">{update.posterUser.firstName[0]}</div>
        <div>
          <h3>
            {update.posterUser.firstName} {update.posterUser.lastName}
          </h3>
          <p className="news-meta">
            {update.posterUser.role} · {update.posterUser.department}
          </p>
        </div>
      </div>
      <div className="news-body">
        <h4>{update.subject}</h4>
        <p>{update.content}</p>
        <p>
          <strong>Project:</strong> {update.project.title}
        </p>
      </div>
      <div className="news-footer">
        <p className="news-date">
          {new Date(update.postedDate).toLocaleDateString()}
        </p>
        <button className="btn-view-comments">
          View Comments ({update.numOfComments})
        </button>
      </div>
    </div>
  );

  return (
    <div className="newsfeed">
      <div className="newsfeed-content">
        <h2>Newsfeed</h2>
        {updates.map((update) => renderUpdate(update))}
      </div>
    </div>
  );
};

export default Newsfeed;
