import React from "react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-columns">
          <div className="col">
            <a href="/" aria-label="PawPal home">
              <img src="images/logo.png" alt="PawPal logo" className="footer-logo" />
            </a>
          </div>
          
          <div className="col">
            <h4>Kontakt</h4>
            <p>Email: pawpal.pomoc@email.com</p>
          </div>
        </div>
      </div>
      <div className="footer-bottom">&copy; 2025 PawPal </div>
    </footer>
  );
}
