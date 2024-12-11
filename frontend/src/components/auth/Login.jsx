import React, { useState } from "react";
import KeyIcon from "../../assets/svg/KeyIcon";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add logic to handle form submission (e.g., API call)
    console.log({ email, password });
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
