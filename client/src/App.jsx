import React from "react";
import Home from "./pages/Home.jsx";
import HomeUlogiran from "./pages/HomeUlogiran.jsx";
import Profile from "./pages/Profile.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import DostupneSetnje from "./pages/DostupneSetnje.jsx";
import Rezervacija from "./pages/Rezervacija.jsx";
import { Routes } from "react-router-dom";
import "./style.css";
import { BrowserRouter, Route } from "react-router-dom";
import ProfilRouter from "./pages/ProfilRouter.jsx";
import UlogiranAdmin from "./pages/UlogiranAdmin.jsx";
import Korisnici from "./pages/Korisnici.jsx";
import Clanarina from "./pages/Clanarina.jsx";
import MjesecnaClanarina from "./pages/MjesecnaClanarina.jsx";
import GodisnjaClanarina from "./pages/GodisnjaClanarina.jsx";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/main" element={<HomeUlogiran />} />
          <Route path="/profil" element={<ProfilRouter />} />  
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/:idkorisnik/setnje" element={<DostupneSetnje />} />
          <Route path="/:idkorisnik/setnje/:idsetnja/rezervacija" element={<Rezervacija />} />
          <Route path="/admin" element={<UlogiranAdmin />} />
          <Route path="/korisnici" element={<Korisnici />} />
          <Route path="/clanarina" element={<Clanarina />} />
          <Route path="/clanarina/mjesecna" element={<MjesecnaClanarina />} />
          <Route path="/clanarina/godisnja" element={<GodisnjaClanarina />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
