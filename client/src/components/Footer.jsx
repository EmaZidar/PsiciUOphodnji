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
            <h4>Brze poveznice</h4>
            <ul>
              <li>Pronađi šetača</li>
              <li>Postani šetač</li>
              <li>Cjenik</li>
            </ul>
          </div>
          <div className="col">
            <h4>Kontakt</h4>
            <p>Email: info@pawpal.example</p>
          </div>
        </div>
      </div>
      <div className="footer-bottom">&copy; 2025 PawPal — sva prava pridržana</div>
    </footer>
  );
}
