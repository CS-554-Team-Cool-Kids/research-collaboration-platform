import React, { useState } from "react";
import KeyIcon from "../../assets/svg/KeyIcon";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import { doSignInWithEmailAndPassword } from "../../firebase/firebaseFunctions";

import queries from "../../queries";

import { useAuth } from "../../context/AuthContext.jsx";
import {
  checkIsProperString,
  checkIsProperPassword,
  validateEmail,
} from "../../helpers.js";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, authState } = useAuth();
  const navigate = useNavigate();

  const [loginMutation] = useMutation(queries.LOGIN_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let { email, password } = e.target.elements;
    try {
      email.value = validateEmail(email.value);
      password.value = checkIsProperPassword(password.value);

      const userCredential = await doSignInWithEmailAndPassword(
        email.value,
        password.value
      );
      const token = await userCredential.user.getIdToken();

      const { data } = await loginMutation({
        variables: { token },
      });

      login({ email: data.login.email, role: data.login.role });

      // const socket = io("http://localhost:4001");



      // console.log("Socket connected:", socket.id);

      if (data.login.role === "STUDENT") {
        navigate("/chat"); // Navigate to chat for students
      } else if (data.login.role === "ADMIN") {
        navigate("/chat"); // Navigate to chat for admins
      } else {
        navigate("/chat"); // Default navigation
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="d-card col-12 col-md-4 glassEffect my-4 mx-auto">
      <div className="d-card-header">
        <h2>
          <KeyIcon />
          Login
        </h2>
      </div>
      <div className="d-card-body">
        <form id="loginform" onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <input
              className="form-control"
              type="email"
              id="email"
              name="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email">Email:</label>
          </div>

          <div className="form-floating mb-3">
            <input
              className="form-control"
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Password:</label>
          </div>

          <div className="row">
            <div className="offset-4 col-4 mt-3">
              <button
                className="btn btn-primary col-12 py-2"
                type="submit"
                id="submit"
              >
                Login
              </button>
            </div>
          </div>
        </form>
        <div className="mt-2">
          <a href="#">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
