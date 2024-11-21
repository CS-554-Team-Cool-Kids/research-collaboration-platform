import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import Login from "./components/authentication/login";
import Navbar from "./components/navbar"; // Import Navbar component
import NotFound from "./components/NotFound";

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/authentication/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
