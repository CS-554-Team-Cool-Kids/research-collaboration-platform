import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import NotFound from "./components/common/NotFound";
import Home from "./components/common/Home";
import UserDashboard from "./components/common/UserDashboard";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

import ProjectList from "./components/project/List";
import ProjectDetails from "./components/project/Details";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/user/:id" element={<UserDashboard />} />
        <Route path="/project/list" element={<ProjectList />} />
        <Route path="/project/details/:id" element={<ProjectDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
