import React from "react";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import { Routes } from "react-router-dom";
import "./style.css";
import { BrowserRouter, Route } from "react-router-dom";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
