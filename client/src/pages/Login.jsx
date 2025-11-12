import React, { useState } from "react";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogle = () => {
    window.location.href = "/login/auth";
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/login/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        window.location.href = "/";
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data.error || "Neispravni podaci. Pokušajte ponovno.");
    } catch (err) {
      setError("Mrežna greška. Provjerite vezu i pokušajte ponovno.");
    } finally {
      setLoading(false);
    }
  };

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
