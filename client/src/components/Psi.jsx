import React, { useEffect, useState } from 'react';
import './Psi.css';

export default function Psi() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const API = 'http://localhost:8000/api/me';
    fetch(API, { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error('Not authenticated');
        return r.json();
      })
      .then((data) => {
        setUser(data.user ?? data.session ?? null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const firstName =
    user?.imeKorisnik || user?.imekorisnik || user?.ime || user?.name || user?.given_name || '';

  const njegoviPsi =
    user?.Psi || [
      { ime: 'imamIme' },
      { ime: 'Rex', pasmina: 'Mješanac', dob: 3, energija: 'visoka' },
      { ime: 'Max' },
    ];

  if (loading) return <div>Učitavanje...</div>;
  if (error) return <div>Pogreška: {error}</div>;

  return (
    <div className="sviPsi">
      {njegoviPsi.map((pas, idx) => (
        <div className="jedanPas" key={idx}>
          <h3 className="imePsa">{pas.ime || 'nemam'}</h3>
          <p>Pasmina: {pas.pasmina || 'nemam'}</p>
          <p>Godine: {pas.dob || 'nemam'}</p>
          <p>Razina energije: {pas.energija || 'nemam'}</p>
          <button>Izbriši psa</button>
        </div>
      ))}

      <form className="dodajPsa">
        <label htmlFor="ime">Ime psa:</label>
        <input type="text" id="ime" name="ime" />
        <br />

        <label htmlFor="pasmina">Pasmina:</label>
        <input type="text" id="pasmina" name="pasmina" />
        <br />

        <label htmlFor="dob">Godine:</label>
        <input type="number" id="dob" name="dob" />
        <br />

        <label htmlFor="energija">Razina energije:</label>
        <input type="text" id="energija" name="energija" />
        <br />

        <button type="submit" value="Submit">
          Dodaj psa
        </button>
        <button type="reset" value="Reset">
          Resetiraj
        </button>

        <h1>{firstName || 'NEMA IMENA'}</h1>
      </form>
    </div>
  );
}
