import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/common/Home";
import Login from "./components/auth/Login";
import Navbar from "./components/common/Navbar";
import NotFound from "./components/common/NotFound";

const App = () => {
  return (
    <div>
      <Navbar />
      <div className="container-fluid mt-3">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/authentication/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
