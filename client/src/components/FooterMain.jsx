import React from 'react';

export default function FooterMain() {
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
            <img src="/images/paw.png" alt="Paw" className="paw-icon" />
          </div>
        </div>
      </div>
      <div className="footer-bottom">&copy; 2025 PawPal </div>
    </footer>
  );
}
