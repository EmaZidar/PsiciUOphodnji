import React from "react";
import Home from "./pages/Home.jsx";
import HomeUlogiran from "./pages/HomeUlogiran.jsx";
import Profile from "./pages/Profile.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { Routes } from "react-router-dom";
import "./style.css";
import { BrowserRouter, Route } from "react-router-dom";
import ProfilVlasnik from "./pages/ProfilVlasnik.jsx";
//u linije 19 sam stavila ProfilVlasnik umjesto profile kad sam gledala to svoje
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/main" element={<HomeUlogiran />} />
          <Route path="/profil" element={<Profile />} />  
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
