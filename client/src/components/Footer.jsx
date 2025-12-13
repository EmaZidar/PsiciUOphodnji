import React from "react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-columns">
          <div className="col">
            <img src="images/logo.png" alt="PawPal logo" className="footer-logo" />
          </div>
          <div className="col">
            <h4>Brze poveznice</h4>
            <ul>
              <li><a href="#find">Pronađi šetača</a></li>
              <li><a href="#become">Postani šetač</a></li>
              <li><a href="#pricing">Cjenik</a></li>
            </ul>
          </div>
          <div className="col">
            <h4>Kontakt</h4>
            <p>Email: info@pawpal.com</p>
          </div>
        </div>
      </div>
      <div className="footer-bottom">&copy; 2025 PawPal — sva prava pridržana</div>
    </footer>
  );
}
