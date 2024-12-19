import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import HomeIcon from "../../../assets/svg/HomeIcon_2";
import NextIcon from "../../../assets/svg/NextIcon";
import ChatIcon from "../../../assets/svg/ChatIcon_2";
import AnnouncementIcon from "../../../assets/svg/Announcement";
import VoiceIcon from "../../../assets/svg/VoiceIcon";
import Team from "../../../assets/svg/Team";
import Requests from "../../../assets/svg/Requests";
import { useAuth } from "../../../context/AuthContext"; // Import your AuthContext

const ActionBar = (props) => {
  const { authState } = useAuth(); // Use the AuthContext to get authState
  const location = useLocation(); // Get the current route location

  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    const toggle = document.querySelector(".sidebar .toggle");

    if (toggle) {
      toggle.addEventListener("click", () => {
        if (sidebar.classList.contains("open"))
          sidebar.classList.remove("open");
        else sidebar.classList.add("open");
      });
    }

    // Cleanup event listeners on component unmount
    return () => {
      if (toggle) toggle.removeEventListener("click", () => {});
    };
  }, []); // Empty dependency array ensures this only runs once on mount

  // Utility to determine if a route is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar glassEffect open">
      <div className="toggle">
        <div className="iconSwitch">
          <NextIcon />
        </div>
      </div>

      <div className="logo">{props.projectTitle}</div>

      <nav>
        <div className="nav-title">Management</div>

        <ul>
          <li
            className={`nav-item ${
              isActive(`/project/${props.projectId}`) ? "active" : ""
            }`}
          >
            <Link to={`/project/${props.projectId}`} className="nav-link">
              <div className="iconSwitch">
                <HomeIcon />
              </div>
              <span>Home</span>
            </Link>
          </li>
          <li
            className={`nav-item ${
              isActive(`/project/${props.projectId}/team`) ? "active" : ""
            }`}
          >
            <Link to={`/project/${props.projectId}/team`} className="nav-link">
              <div className="iconSwitch">
                <Team />
              </div>
              <span>Team</span>
              </Link>
          </li>

          {authState.user.role === "PROFESSOR" && (
            <li
              className={`nav-item ${
                isActive(`/project/${props.projectId}/requests`)
                  ? "active"
                  : ""
              }`}
            >
              <Link
                to={`/project/${props.projectId}/requests`}
                className="nav-link"
              >
                <div className="iconSwitch">
                  <Requests />
                </div>
                <span>Requests</span>
              </Link>
            </li>
          )}
        </ul>

        <div className="nav-title">Channel</div>
        <ul>
          <li
            className={`nav-item ${isActive("/channel/text") ? "active" : ""}`}
          >
            <div className="iconSwitch">
              <ChatIcon />
            </div>
            <span>Text</span>
          </li>

          <li
            className={`nav-item ${
              isActive("/channel/announcement") ? "active" : ""
            }`}
          >
            <div className="iconSwitch">
              <AnnouncementIcon />
            </div>
            <span>Announcement</span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ActionBar;
