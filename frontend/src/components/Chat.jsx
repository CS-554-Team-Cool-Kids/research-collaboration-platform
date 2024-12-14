import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

import { useQuery } from "@apollo/client";
import queries from "../queries";

function Chat() {
  const { authState } = useAuth(); // Get authenticated user details
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);

  // Fetch user data using useQuery
  const { data, loading, error } = useQuery(queries.GET_USER_BY_ID, {
    variables: { id: authState.user.id },
    skip: !authState.isAuthenticated, // Skip query if not authenticated
  });

  useEffect(() => {
    if (!authState.isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    const newSocket = io("http://localhost:4001");
    setSocket(newSocket);

    newSocket.emit("user_connected", {
      email: authState.user.email,
      role: authState.user.role,
    });

    if (socket && selectedChannel) {
      socket.emit("join_channel", selectedChannel);

      // Listen for previous messages
      socket.on("previous_messages", (previousMessages) => {
        setMessages(previousMessages);
      });
    }

    // Listen for incoming messages
    newSocket.on("chat_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [authState.isAuthenticated, socket, selectedChannel]);

  const handleChannelSelect = (channelId) => {
    if (socket) {
      // Join the selected channel
      socket.emit("join_channel", channelId);
      setSelectedChannel(channelId);
    }
  };

  const handleSendMessage = () => {
    if (socket && message.trim() && selectedChannel) {
      // Emit the message to the specific channel
      socket.emit("chat_message", {
        channel: selectedChannel,
        user: authState.user.email,
        message,
      });
      setMessage(""); // Clear the input
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const user = data?.getUserById;
  const projects = user?.projects || [];

  return (
    <div className="chat-container">
      <h2>
        Welcome to the Chat, {user.firstName} {user.lastName}
      </h2>

      <div className="channels">
        <h3>Select a Channel:</h3>
        <ul>
          {projects.map((project) => (
            <li
              key={project._id}
              className={selectedChannel === project._id ? "selected" : ""}
              onClick={() => handleChannelSelect(project._id)} // Join the channel on click
            >
              {project.title}
            </li>
          ))}
        </ul>
      </div>

      {selectedChannel && (
        <div className="messages">
          <h4>
            Channel: {projects.find((p) => p._id === selectedChannel)?.title}
          </h4>
          {messages
            .filter((msg) => msg.channel === selectedChannel)
            .map((msg, index) => (
              <div key={index} className="message">
                <strong>{msg.user}:</strong> {msg.message}
              </div>
            ))}
        </div>
      )}

      <div className="message-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!selectedChannel}
        />
        <button onClick={handleSendMessage} disabled={!selectedChannel}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
