import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

function Chat() {
  const { authState } = useAuth(); // Get authenticated user details
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!authState.isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = "/login";
      return;
    }

    // Connect to the socket server
    const newSocket = io("http://localhost:4001");
    setSocket(newSocket);

    newSocket.emit("user_connected", {
      email: authState.user.email,
      role: authState.user.role,
    });

    // Listen for incoming messages
    newSocket.on("chat_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [authState.isAuthenticated]);

  const handleSendMessage = () => {
    if (socket && message.trim()) {
      // Emit the message to the server
      socket.emit("chat_message", {
        user: authState.user.email,
        message,
      });
      setMessage(""); // Clear the input
    }
  };

  return (
    <div className="chat-container">
      <h2>Welcome to the Chat, {authState.user.email}</h2>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.user}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div className="message-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
