import React, { useEffect, useState } from 'react';
import HeaderUlogiran from '../components/HeaderUlogiran';
import './podatciVlasnika.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    imekorisnik: "",
    prezkorisnik: "",
    email: "",
    telefon: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${BACKEND_URL}/api/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Nije authenticated");

        const data = await res.json();
        if (!cancelled) setUser(data.user);
      } catch (e) {
        if (!cancelled) {
          setUser(null);
          setError(e?.message || "Greška pri dohvaćanju profila");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    setForm({
      imekorisnik: user.imekorisnik ?? "",
      prezkorisnik: user.prezkorisnik ?? "",
      email: user.email ?? "",
      telefon: user.telefon ?? "",
    });
  }, [user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleEdit() {
    setError("");
    setIsEditing(true);
  }

  function handleCancel() {
    setError("");
    setForm({
      imekorisnik: user?.imekorisnik ?? "",
      prezkorisnik: user?.prezkorisnik ?? "",
      email: user?.email ?? "",
      telefon: user?.telefon ?? "",
    });
    setIsEditing(false);
  }

  async function handleSave() {
    try {
      setError("");

      const res = await fetch(`${BACKEND_URL}/api/me`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imekorisnik: form.imekorisnik,
          prezkorisnik: form.prezkorisnik,
          email: form.email,
          telefon: form.telefon,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Spremanje nije uspjelo");
      }

      const data = await res.json();
      setUser(data.user ?? data);
      setIsEditing(false);
    } catch (e) {
      setError(e?.message || "Greška pri spremanju");
    }
  }

  // dio sa brisanjem profila
  async function handleDeleteProfile() {
    const ok = window.confirm("Jeste sigurni da želite obrisati profil?");
    if (!ok) return;

    try {
      setError("");
      const res = await fetch(`${BACKEND_URL}/api/delete-profile`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Greška pri brisanju profila");
      }

      window.location.href = process.env.REACT_APP_URL || 'http://localhost:5173';
    } catch (e) {
      setError(e?.message || "Greška pri brisanju profila");
    }
  }

  return (
    <>
      <HeaderUlogiran />
      <main className="v-profile-main">
        <h1>Pregled profila</h1>

        {loading && <p>Učitavanje...</p>}
        {!loading && error && <p className="v-error-message">{error}</p>}

        {!loading && !error && user && (
          <>
            <section className="v-profile-container">
              <div className="v-profile-details">
                <div className="v-profile-info-box">
                  <div className="v-profile-row">
                    <strong>Ime:</strong>{" "}
                    {isEditing ? (
                      <input type="text" name="imekorisnik" value={form.imekorisnik} onChange={handleChange} className="profile-input"/>
                    ) : (
                      user.imekorisnik || '—'
                    )}
                  </div>
                  <div className="v-profile-row">
                    <strong>Prezime:</strong>{" "}
                    {isEditing ? (
                      <input type="text" name="prezkorisnik" value={form.prezkorisnik} onChange={handleChange} className="profile-input"/>
                    ) : (
                      user.prezkorisnik || '—'
                    )}
                  </div>
                  <div className="v-profile-row">
                    <strong>Email:</strong>{" "}
                    {isEditing ? (
                      <input type="email" name="email" value={form.email} onChange={handleChange} className="profile-input"/>
                    ) : (
                      user.email || '—'
                    )}
                  </div>
                  <div className="v-profile-row">
                    <strong>Telefon:</strong>{" "}
                    {isEditing ? (
                      <input type="tel" name="telefon" value={form.telefon} onChange={handleChange} className="profile-input"/>
                    ) : (
                      user.telefon || '—'
                    )}
                  </div>
                </div>

                <div className="v-profile-actions">
                  {!isEditing ? (
                    <button onClick={handleEdit} className="v-delete-btn">
                      Uredi
                    </button>
                  ) : (
                    <>
                      <button onClick={handleSave} className="v-delete-btn">
                        Spremi
                      </button>
                      <button onClick={handleCancel} className="delete-btn">
                        Odustani
                      </button>
                    </>
                  )}
                  <button onClick={handleDeleteProfile} className="v-delete-btn">
                    Obriši profil
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {!loading && !error && !user && (
          <p>Nema podataka za korisnika.</p>
        )}
      </main>
    </>
  );
}
