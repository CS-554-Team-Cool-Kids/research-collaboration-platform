import React from "react";
import { Link } from "react-router-dom";
import DarkMode from "../../assets/svg/DarkMode";
import LightMode from "../../assets/svg/LightMode";

const Navbar = () => {
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
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
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
            <li className="nav-item">
              <Link className="nav-link" to="/project/list">
                Project
              </Link>
            </li>
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
