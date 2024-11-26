import React, { useState, useEffect } from "react";
import KeyIcon from "../../assets/svg/KeyIcon";
import { doSignInWithEmailAndPassword } from "../../firebase/firebaseFunctions";
import { LOGIN_MUTATION } from "../../mutations.js";
import { useMutation } from "@apollo/client";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, authState } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate("/protected");
    }
  }, [authState.isAuthenticated, navigate]);

  const [loginMutation] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add logic to handle form submission (e.g., API call)

    let { email, password } = e.target.elements;
    console.log({ email, password });

    try {
      const userCredential = await doSignInWithEmailAndPassword(
        email.value,
        password.value
      );
      const token = await userCredential.user.getIdToken();
      console.log(token);

      const { data } = await loginMutation({
        variables: { token },
      });
      login({ email: data.login.email, role: data.login.role });

      navigate("/protected");
    } catch (error) {
      alert(error);
    }
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="container-fluid">
        <div className="card col-12 col-md-4 glassEffect my-auto mx-auto">
          <div className="card-header glassEffect">
            <KeyIcon /> Login
          </div>
          <div className="card-body">
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
                    className="btn btn-warning col-12 py-2"
                    type="submit"
                    id="submit"
                  >
                    Login
                  </button>
                </div>
              </div>
            </form>
            <div className="mt-2">
              <a href="/resetpassword">Forgot Password?</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Login;
