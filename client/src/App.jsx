import React from "react";
import Home from "./pages/Home.jsx";
import HomeUlogiran from "./pages/HomeUlogiran.jsx";
import Profile from "./pages/Profile.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { Routes } from "react-router-dom";
import "./style.css";
import { BrowserRouter, Route } from "react-router-dom";
import UlogiranAdmin from "./pages/UlogiranAdmin.jsx";
import Korisnici from "./pages/Korisnici.jsx";
import Clanarina from "./pages/Clanarina.jsx";


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
          <Route path="/admin" element={<UlogiranAdmin />} />
          <Route path="/korisnici" element={<Korisnici />} />
          <Route path="/clanarina" element={<Clanarina />} />

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
