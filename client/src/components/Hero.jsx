import React from "react";

export default function Hero() {
  return (
    <section className="hero-full">
      <div className="hero-container">
        <h2>Nemaš vremena prošetati svog psa?</h2>
        <p>
          Poveži se s provjerenim šetačima u svom susjedstvu — brzo, sigurno i jednostavno.
        </p>
        <div className="hero-buttons">
          <a className="btn primary" href="#signup">
            Registracija
          </a>
          <a className="btn outline" href="#login">
            Prijava
          </a>
        </div>
      </div>
    </section>
  );
}
