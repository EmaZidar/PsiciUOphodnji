import React, { useEffect, useState } from 'react';
import HeaderUlogiran from '../components/HeaderUlogiran';
import Footer from '../components/Footer';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch session + DB user info from server
    const API = 'http://localhost:8000/api/me';
    fetch(API, { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error('Not authenticated');
        return r.json();
      })
      .then((data) => {
        // Prefer DB user (user) then session
        setUser(data.user ?? data.session ?? null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <HeaderUlogiran />
      <main className="profile-main" style={{ padding: '32px 18px' }}>
        <h1>Pregled profila</h1>
        {loading && <p>Učitavanje...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && user && (
          (() => {
            // Helper to pick the first existing field from several possible DB/Google names
            const pick = (obj, keys) => {
              if (!obj) return undefined;
              for (const k of keys) {
                if (typeof obj[k] !== 'undefined' && obj[k] !== null && String(obj[k]).trim() !== '') return obj[k];
              }
              return undefined;
            };

            const avatarSrc =
              pick(user, ['profileFoto', 'profilFoto', 'profileFoto', 'avatar', 'profil', 'profilfoto']) || '/images/profile.png';

            const firstName = pick(user, ['imeKorisnik', 'imekorisnik', 'imeKorisnik', 'ime', 'name', 'given_name']) || '';
            const lastName = pick(user, ['prezKorisnik', 'prezkorisnik', 'prezime', 'prezKorisnik', 'surname', 'family_name']) || '';

            return (
              <section className="profile-container">
                <div className="profile-avatar-wrapper">
                  <img src={avatarSrc} alt="Profilna fotografija" className="profile-avatar" />
                </div>

                <div className="profile-details">
                  <div className="profile-info-box">
                    <div className="profile-row"><strong>Ime:</strong> {firstName || '—'}</div>
                    <div className="profile-row"><strong>Prezime:</strong> {lastName || '—'}</div>
                    <div className="profile-row"><strong>Email:</strong> {user.email ?? '—'}</div>
                    <div className="profile-row"><strong>Telefon:</strong> {user.telefon ?? user.phone ?? '—'}</div>
                    <div className="profile-row"><strong>Uloga:</strong> {user.role ?? '—'}</div>
                  </div>
                </div>
              </section>
            );
          })()
        )}

        {!loading && !error && !user && (
          <p>Nema dostupnih podataka za korisnika.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
