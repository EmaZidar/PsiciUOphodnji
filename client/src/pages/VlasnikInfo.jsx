import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './VlasnikInfo.css';
import HeaderUlogiran from '../components/HeaderUlogiran';
import Footer from '../components/Footer';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function VlasnikInfo() {
  const { idkorisnik } = useParams();
  const [vlasnik, setVlasnik] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVlasnik() {
      try {
        console.log('VlasnikInfo: fetching', `${BACKEND_URL}/api/vlasnik/${idkorisnik}`);
        const res = await fetch(`${BACKEND_URL}/api/vlasnik/${idkorisnik}`, { credentials: 'include' });
        console.log('VlasnikInfo: fetch status', res.status);
        const text = await res.text();
        console.log('VlasnikInfo: response text', text);
        let data = null;
        try { data = JSON.parse(text || 'null'); } catch (e) { console.warn('VlasnikInfo: response not JSON'); }
        setVlasnik(data?.vlasnik ?? data);
        if (!res.ok) throw new Error('Greška pri dohvaćanju vlasnika');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (idkorisnik) fetchVlasnik();
  }, [idkorisnik]);

  if (loading) return <p>Učitavanje vlasnika...</p>;
  if (!vlasnik) return <p>Vlasnik nije pronađen.</p>;

  return (
    <>
      <HeaderUlogiran />
      <main className="vinfo-page">
        <div className="vinfo-container">
          <h2>Profil vlasnika</h2>

          <div className="vinfo-owner-card">
            <p><strong>Ime:</strong> {vlasnik.imekorisnik}</p>
            <p><strong>Prezime:</strong> {vlasnik.prezkorisnik}</p>
            <p><strong>Email:</strong> {vlasnik.email}</p>
            <p><strong>Telefon:</strong> {vlasnik.telefon}</p>
          </div>

          <section className="vinfo-psi-section">
            <h3>PSI VLASNIKA</h3>
            <ul className="vinfo-psi-lista">
              {vlasnik.psi?.map(p => (
                <li key={p.idpas} className="vinfo-pas-kartica">
                  <p className="vinfo-imePsa"><strong>Ime psa:</strong> {p.imepas}</p>
                  <p><strong>Pasmina:</strong> {p.pasmina}</p>
                  <p><strong>Godine:</strong> {p.starost}</p>
                  <p><strong>Razina energije:</strong> {p.razinaenergije}/5</p>
                  <p><strong>Socijalizacija:</strong> {p.socijalizacija}/5</p>
                  <p><strong>Zdravstvene napomene:</strong> {p.zdravnapomene || 'Nema napomena'}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
