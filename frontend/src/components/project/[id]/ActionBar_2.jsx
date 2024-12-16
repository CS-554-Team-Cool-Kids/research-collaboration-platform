import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import HomeIcon from "../../../assets/svg/HomeIcon_2";
import NextIcon from "../../../assets/svg/NextIcon";
import ChatIcon from "../../../assets/svg/ChatIcon_2";
import AnnouncementIcon from "../../../assets/svg/Announcement";
import VoiceIcon from "../../../assets/svg/VoiceIcon";
import Members from "../../../assets/svg/Members";
import Requests from "../../../assets/svg/Requests";
import { useAuth } from "../../../context/AuthContext"; // Import your AuthContext

const ActionBar = (props) => {
  const { authState, logout } = useAuth(); // Use the AuthContext to get authState and logout function

  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    const navItems = document.querySelectorAll(".nav-item");
    const toggle = document.querySelector(".sidebar .toggle");

    if (toggle) {
      toggle.addEventListener("click", () => {
        if (sidebar.className === "sidebar glassEffect open")
          sidebar.classList.remove("open");
        else {
          sidebar.classList.add("open");
        }
      });
    }

    if (navItems.length > 0) {
      navItems.forEach((navItem) => {
        navItem.addEventListener("click", () => {
          navItems.forEach((item) => {
            item.classList.remove("active");
          });

          navItem.classList.add("active");
        });
      });
    }

    // Cleanup event listeners on component unmount
    return () => {
      if (toggle) toggle.removeEventListener("click", () => {});
      if (navItems.length > 0) {
        navItems.forEach((navItem) => {
          navItem.removeEventListener("click", () => {});
        });
      }
    };
  }, []); // Empty dependency array ensures this only runs once on mount

  return (
    <div className="sidebar glassEffect open">
      <div className="toggle">
        <NextIcon />
      </div>

      <div className="logo">Project Alpha</div>

      <nav>
        <div className="nav-title">Management</div>

        <ul>
          <Link to={`/project/${props.projectId}`} className="nav-link">
            <li className="nav-item active">
              <div className="iconSwitch">
                <HomeIcon />
              </div>
              <span>Home</span>
            </li>
          </Link>
          <li className="nav-item">
            <div className="iconSwitch">
              <Members />
            </div>
            <span>Members</span>
          </li>
          {authState.user.role === "PROFESSOR" && (
            <Link
              to={`/project/${props.projectId}/requests`}
              className="nav-link"
            >
              <li className="nav-item">
                <div className="iconSwitch">
                  <Requests />
                </div>
                <span>Requests</span>
              </li>
            </Link>
          )}
        </ul>

        <div className="nav-title">Channel</div>
        <ul>
          <li className="nav-item active">
            <div className="iconSwitch">
              <ChatIcon />
            </div>
            <span>Text</span>
          </li>

          <li className="nav-item">
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
