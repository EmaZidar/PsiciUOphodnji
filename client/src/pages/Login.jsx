import React, { useState } from "react";
import "./Login.css";

export default function Login() {


  const handleGoogle = () => {
    window.location.href = "/login/auth";
  }
 

    return (
    <section className="login-page">
      <div className="login-container">
        <h2>Prijava</h2>

        <button
          type="button"
          className="btn google"
          onClick={handleGoogle}
          aria-label="Nastavi s Google-om"
        >
          <img src="/google_logo.svg" alt="" className="google-logo" />
          Nastavite s Google-om
        </button>


      </div>
    </section>
  );
}
