import React from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="hero-full">
      <div className="hero-container">
        <h2>Nemaš vremena prošetati svog psa?</h2>
        <p>
          Poveži se s provjerenim šetačima u svom susjedstvu — brzo, sigurno i jednostavno.
        </p>
        <div className="hero-buttons">
          <Link className="btn outline" to="/login">
            Prijava
          </Link>
        </div>
      </div>
    </section>
  );
}
