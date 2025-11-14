import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="header-container">
      <div className="header-inner">
        <div className="brand"><Link className="brand" to="/">Pawpal</Link></div>
        <nav className="header-nav" aria-label="Glavni izbornik">
          <a href="#about">O nama</a>
          <a href="#zasto">Zašto mi?</a>
          <a href="#kontakt">Kontakt</a>
          <Link to="/profil" > <img src="/images/profil.png" alt="profil" className="ikonaProfila"></img>  </Link>
        </nav>
      </div>
    </header>
  );
}

