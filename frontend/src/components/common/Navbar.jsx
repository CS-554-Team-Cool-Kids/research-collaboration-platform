import React from "react";
import { Link, useLocation } from "react-router-dom"; // Import useLocation
import { useAuth } from "../../context/AuthContext"; // Import your AuthContext
import DarkMode from "../../assets/svg/DarkMode";
import LightMode from "../../assets/svg/LightMode";

const Navbar = () => {
  const { authState, logout } = useAuth(); // Use the AuthContext to get authState and logout function
  const location = useLocation(); // Get the current location

  // Helper function to determine active route
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-md sticky-top glassEffect">
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
              <Link
                className={`nav-link ${isActive("/") ? "active" : ""}`}
                to="/"
              >
                Home
              </Link>
            </li>

            {/* Show links based on authentication */}
            {!authState.isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      isActive("/auth/login") ? "active" : ""
                    }`}
                    to="/auth/login"
                  >
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      isActive("/auth/register") ? "active" : ""
                    }`}
                    to="/auth/register"
                  >
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      isActive("/dashboard") ? "active" : ""
                    }`}
                    to="/dashboard"
                  >
                    Dashboard
                  </Link>
                </li>
                {/* Show links based on user role */}
                {authState.user.role === "STUDENT" && (
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${
                        isActive("/allprojects") ? "active" : ""
                      }`}
                      to="/allprojects"
                    >
                      Project Database
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      isActive("/project") ? "active" : ""
                    }`}
                    to="/project"
                  >
                    My Projects
                  </Link>
                </li>
                {authState.user.role === "STUDENT" && (
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${
                        isActive("/application") ? "active" : ""
                      }`}
                      to="/application"
                    >
                      Application Status
                    </Link>
                  </li>
                )}

                <li className="nav-item ms-5">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}

            {/* Theme toggle */}
            <li className="ms-5">
              <div className="d-flex">
                <div className="my-auto ms-auto iconSwitch">
                  <LightMode />
                </div>
                <div>
                  <a href="#" className="p-0">
                    <div id="switch" className="m-4">
                      <div id="circle" className="iconSwitch"></div>
                    </div>
                  </a>
                </div>
                <div className="my-auto me-auto iconSwitch">
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
