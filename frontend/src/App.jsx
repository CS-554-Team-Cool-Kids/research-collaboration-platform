import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/common/Home";
import Login from "./components/auth/Login";
import UserDashboard from "./components/common/UserDashboard";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import NotFound from "./components/common/NotFound";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/authentication/login" element={<Login />} />
        <Route path="/user/:id" element={<UserDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
