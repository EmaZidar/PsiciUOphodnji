import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="header-container">
      <div className="header-inner">
        <div className="brand"><Link className="brand" to="/">Pawpal</Link></div>
        <nav className="header-nav" aria-label="Glavni izbornik">
          <a href="/notifications" aria-label="Obavijesti" title="Obavijesti" style={{ display: 'inline-flex', alignItems: 'center', padding: 6 }}>
            <img src="/images/notification.png" alt="Obavijesti" style={{ width: 32, height: 32 }} />
          </a>
          <a href="/chat" aria-label="Chat" title="Chat" style={{ display: 'inline-flex', alignItems: 'center', padding: 6 }}>
            <img src="/images/chaticon.png" alt="Chat" style={{ width: 32, height: 32 }} />
          </a>
          <Link to="/profil" aria-label="Profil" title="Profil" style={{ display: 'inline-flex', alignItems: 'center', padding: 6 }}>
            <img src="/images/profileIcon.png" alt="Profil" className="ikonaProfila" style={{ width: 36, height: 36, borderRadius: 18 }} />
          </Link>
          <a href="/info" aria-label="Info" title="Info" style={{ display: 'inline-flex', alignItems: 'center', padding: 6 }}>
            <img src="/images/info.png" alt="Info" style={{ width: 36, height: 36 }} />
          </a>
        </nav>
      </div>
    </header>
  );
}

