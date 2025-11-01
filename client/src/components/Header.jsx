import React from "react";

export default function Header() {
  return (
    <header className="header-container">
      <div className="header-inner">
        <div className="brand">PawPal</div>
        <nav className="header-nav" aria-label="Glavni izbornik">
          <a href="#about">O nama</a>
          <a href="#zasto">Zašto mi?</a>
          <a href="#kontakt">Kontakt</a>
        </nav>
      </div>
    </header>
  );
}
