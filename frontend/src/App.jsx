import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import NotFound from "./components/common/NotFound";
import Home from "./components/common/Home";
import UserDashboard from "./components/common/UserDashboard";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

import ProjectList from "./components/project/List";
import ProjectDetails from "./components/project/[id]/Details";
import ProjectAdd from "./components/project/Add";
import ProtectedRoute from "./components/ProtectedRoute";
import Chat from "./components/Chat";

const App = () => {
  //Theming
  const getCSSVariable = (variable) =>
    getComputedStyle(document.documentElement).getPropertyValue(variable);

  const colors = {
    light: {
      textColor: getCSSVariable("--black1"),
      bgColor: getCSSVariable("--white1"),
      glassColor: getCSSVariable("--glass1"),
      shadowColor: getCSSVariable("--shadow1"),
      stripeTableColor: getCSSVariable("--stripeTableColor1"),
      gradientColor: getCSSVariable("--lightGradient1"),
    },
    dark: {
      textColor: getCSSVariable("--white1"),
      bgColor: getCSSVariable("--black1"),
      glassColor: getCSSVariable("--glass2"),
      shadowColor: getCSSVariable("--shadow2"),
      stripeTableColor: getCSSVariable("--stripeTableColor2"),
      gradientColor: getCSSVariable("--darkGradient1"),
    },
  };

  const applyTheme = (isDarkMode) => {
    const theme = isDarkMode ? colors.dark : colors.light;

    document.documentElement.style.setProperty(
      "--activeTextColor",
      theme.textColor
    );
    document.documentElement.style.setProperty(
      "--activeBgColor",
      theme.bgColor
    );
    document.documentElement.style.setProperty(
      "--activeGlassColor",
      theme.glassColor
    );
    document.documentElement.style.setProperty(
      "--activeShadowColor",
      theme.shadowColor
    );
    document.documentElement.style.setProperty(
      "--activeStripeTableColor",
      theme.stripeTableColor
    );
    document.documentElement.style.setProperty(
      "--activeGradientColor",
      theme.gradientColor
    );

    document.body.classList.toggle("dark", isDarkMode);

    // Toggle classes on #switch and .iconSwitch elements
    const switchElement = document.getElementById("switch");
    const iconSwitchElements = document.querySelectorAll(".iconSwitch");

    if (switchElement) {
      switchElement.classList.toggle("switched", isDarkMode);
    }

    iconSwitchElements.forEach((icon) => {
      icon.classList.toggle("invertColor", isDarkMode);
    });
  };

  const themeSwitch = () => {
    const isDarkMode = document.body.classList.contains("dark");
    const newMode = !isDarkMode;

    window._isDarkMode = newMode ? 1 : 0;
    applyTheme(newMode);
  };

  useEffect(() => {
    // Initialize theme
    const isDarkMode = window._isDarkMode === 1;
    applyTheme(isDarkMode);

    // Add event listener for theme switch
    const switchElement = document.getElementById("switch");
    const handleSwitchClick = async () => {
      themeSwitch();
    };

    if (switchElement) {
      switchElement.addEventListener("click", handleSwitchClick);
    }

    // Cleanup event listener on unmount
    return () => {
      if (switchElement) {
        switchElement.removeEventListener("click", handleSwitchClick);
      }
    };
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/user/:id" element={<UserDashboard />} />
        <Route path="/project" element={<ProjectList />} />
        <Route path="/project/add" element={<ProjectAdd />} />
        <Route path="/project/:id" element={<ProjectDetails />} />
        <Route path="/chat" element={<Chat />} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute allowedRoles={["STUDENT", "PROFESSOR", "ADMIN"]} />
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
