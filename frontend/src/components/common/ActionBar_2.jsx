import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import HomeIcon from "../../assets/svg/HomeIcon_2";
import NextIcon from "../../assets/svg/NextIcon";
import ChatIcon from "../../assets/svg/ChatIcon_2";
import AnnouncementIcon from "../../assets/svg/Announcement";
import VoiceIcon from "../../assets/svg/VoiceIcon";

const ActionBar = (props) => {
  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    const navItems = document.querySelectorAll(".nav-item");
    const toggle = document.querySelector(".sidebar .toggle");

    if (toggle) {
      toggle.addEventListener("click", () => {
        if (sidebar.className === "sidebar glassEffect")
          sidebar.classList.add("open");
        else {
          sidebar.classList.remove("open");
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
    <div className="sidebar glassEffect">
      <div className="toggle">
        <NextIcon />
      </div>

      <div className="logo">Project Alpha</div>

      <nav>
        <div className="nav-title">Management</div>

        <ul>
          <li className="nav-item active">
            <HomeIcon />
            <span>Home</span>
          </li>
          <li className="nav-item">
            <HomeIcon />
            <span>Home</span>
          </li>
          <li className="nav-item">
            <HomeIcon />
            <span>Home</span>
          </li>
        </ul>

        <div className="nav-title">Channel</div>
        <ul>
          <li className="nav-item active">
            <ChatIcon />
            <span>Text</span>
          </li>
          <li className="nav-item">
            <VoiceIcon />
            <span>Voice</span>
          </li>
          <li className="nav-item">
            <AnnouncementIcon />
            <span>Announcement</span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ActionBar;
