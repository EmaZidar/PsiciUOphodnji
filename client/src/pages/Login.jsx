import React, { useState } from "react";
import "./Login.css";

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    window.location.href = "/login/auth";
  };

  return (
    <section className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Dobrodošli u PawPal</h1>
          <p>Prijavite se kako biste pristupili aplikaciji</p>
        </div>

        <div className="login-content">
          <div className="features-list">
            <h2>Jednostavna prijava u 2 klika</h2>
            <div className="feature-item">
              <span className="feature-icon">🔐</span>
              <div>
                <h3>Sigurno i brzo</h3>
                <p>Koristite postojeći Google račun</p>
              </div>
            </div>
            
            <div className="feature-item">
              <span className="feature-icon">🐕</span>
              <div>
                <h3>Jedan račun za sve</h3>
                <p>Pristupite kao vlasnik psa ili šetač</p>
              </div>
            </div>
            
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <div>
                <h3>Bez lozinki</h3>
                <p>Nema potrebe za pamćenjem još jedne lozinke</p>
              </div>
            </div>
          </div>

          <div className="login-actions">
            <button
              type="button"
              className={`google-login-btn ${loading ? 'loading' : ''}`}
              onClick={handleGoogleLogin}
              disabled={loading}
              aria-label="Prijavite se putem Google računa"
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <img 
                    src="/google_logo.svg" 
                    alt="Google" 
                    className="google-logo" 
                  />
                  Prijavite se putem Google računa
                </>
              )}
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p>Nemate Google račun? <a href="https://accounts.google.com/signup" target="_blank" rel="noopener noreferrer">Kreirajte ga besplatno</a></p>
        </div>
      </div>
    </section>
  );
}