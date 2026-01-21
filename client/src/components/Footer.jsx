import React from "react";
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export default function Footer() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      // ignore
    }
    localStorage.setItem('sessionExpired', 'true');
    navigate('/', { replace: true });
  }

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-columns">
          <div className="col footer-col-logo">
            <a href="/" aria-label="PawPal home">
              <img src="/images/logo.png" alt="PawPal logo" className="footer-logo" />
            </a>
          </div>

          <div className="col footer-col-contact">
            <h4>Kontakt</h4>
            <p>Email: pawpal.pomoc@email.com</p>
          </div>

          <div className="col footer-col-logout">
            <button onClick={handleLogout} className="footer-logout" aria-label="Odjavi se" title="Odjavi se">
              <img src="/images/logout.png" alt="Odjavi se" className="logout-icon" />
            </button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">&copy; 2025 PawPal </div>
    </footer>
  );
}
