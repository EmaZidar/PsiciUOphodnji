import React from 'react';
import HeaderUlogiran from '../components/HeaderUlogiran';
import Footer from '../components/Footer';
import './UlogiranAdmin.css';

export default function UlogiranAdmin({ user }) {
  return (
    <>
      <HeaderUlogiran />
      <main className="ulogiran-admin-main">
        <div className="admin-container">
          <div className="admin-header">
            <h1>Administratorska ploča</h1>
            <p>Upravljajte platformom i korisnicima</p>
          </div>

          <div className="admin-content">
            <div className="admin-card stats-card">
              <h2>Statistika sustava</h2>
              <p>Pregledajte analitiku i ključne metrike.</p>
              <button className="admin-btn">Statistika</button>
            </div>

            <div className="admin-card">
              <h2>Upravljanje korisnicima</h2>
              <p>Pregledajte, uređujte i deaktivirajte korisnike.</p>
              <button className="admin-btn">Korisnici</button>
            </div>

            <div className="admin-card">
              <h2>Prijave i suprotnosti</h2>
              <p>Upravljajte prijavaima korisnika i sporovima.</p>
              <button className="admin-btn">Prijave</button>
            </div>

            <div className="admin-card">
              <h2>Sigurnost i postavke</h2>
              <p>Konfiguracija sustava i sigurnosne postavke.</p>
              <button className="admin-btn">Postavke</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
