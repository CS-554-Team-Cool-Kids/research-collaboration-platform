import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import your AuthContext
import DarkMode from "../../assets/svg/DarkMode";
import LightMode from "../../assets/svg/LightMode";

const Navbar = () => {
  const { authState, logout } = useAuth(); // Use the AuthContext to get authState and logout function

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          RCP_LOGO
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            {/* Always show Home */}
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>

            {/* Show links based on authentication */}
            {!authState.isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/auth/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/auth/register">
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/project">
                    Project
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="nav-link btn btn-link" onClick={logout}>
                    Logout
                  </button>
                </li>
              </>
            )}

            {/* Theme toggle */}
            <li className="ms-5">
              <div className="d-flex">
                <div className="my-auto ms-auto">
                  <LightMode />
                </div>
                <div>
                  <a href="#" className="p-0">
                    <div id="switch" className="m-4">
                      <div id="circle"></div>
                    </div>
                  </a>
                </div>
                <div className="my-auto me-auto">
                  <DarkMode />
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
