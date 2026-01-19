import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderUlogiran from '../components/HeaderUlogiran';
import Footer from '../components/Footer';
import './Placanje.css';

export default function Placanje() {
  const navigate = useNavigate();
  const { idRezervacija } = useParams();

  const [rezervacija, setRezervacija] = useState(null);
  const [method, setMethod] = useState('gotovina');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRezervacija() {
      setLoading(true);
      try {
        const res = await fetch(`/api/rezervacije/${idRezervacija}`);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        setRezervacija(data);
        setMethod(data.nacinPlacanja || 'gotovina');
      } catch (err) {
        setError('Ne mogu dohvatiti rezervaciju: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRezervacija();
  }, [idRezervacija]);

  // Slanje zahtjeva (potvrda rezervacije)
  async function sendRequest(nacinPlacanja) {
    if (!rezervacija) return;

    setLoading(true);
    setError('');

    try {
      // Update rezervacije
      const resPatch = await fetch(`/api/rezervacije/${idRezervacija}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'potvrđeno', nacinPlacanja }),
      });
      if (!resPatch.ok) throw new Error(`Server returned ${resPatch.status}`);

      // Slanje poruke šetaču
      const resMsg = await fetch('/api/poruke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idRezervacija,
          posiljatelj: `Vlasnik-${rezervacija.idKorisnik}`,
          tekst: `Nova rezervacija (${rezervacija.datum} ${rezervacija.vrijeme}) - način plaćanja: ${nacinPlacanja}`,
          vrijemeSlanja: new Date().toISOString(),
        }),
      });
      if (!resMsg.ok) throw new Error(`Server returned ${resMsg.status}`);

      navigate('/');
    } catch (err) {
      setError('Došlo je do greške pri slanju zahtjeva');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <HeaderUlogiran />
      <div className="placanje-container">
        <h2>Plaćanje i slanje zahtjeva</h2>

        <div className="placanje-card">
          {loading ? (
            <p>Učitavanje rezervacije...</p>
          ) : error ? (
            <p className="placanje-error">{error}</p>
          ) : (
            <>
              <p><strong>Datum:</strong> {rezervacija.datum} <strong>Vrijeme:</strong> {rezervacija.vrijeme}</p>
              <p><strong>Polazište:</strong> {rezervacija.polaziste}</p>
              <p><strong>Napomena:</strong> {rezervacija.dodNapomene || '-'}</p>
            </>
          )}

          <div className="placanje-label">
            <span className="placanje-method-label">Način plaćanja</span>
            <div className="placanje-method">{(method === 'gotovina' ? 'Gotovina (plaća se nakon šetnje)' : method) || '-'}</div>
          </div>

          <div className="placanje-actions">
            <button className="placanje-button" onClick={() => sendRequest(method)} disabled={loading || !rezervacija}>{loading ? 'Obrađujem...' : 'Potvrdi i pošalji šetaču'}</button>
            <button className="placanje-back" onClick={() => navigate(-1)} disabled={loading}>Natrag</button>
          </div>

          {error && <div className="placanje-error" style={{ marginTop: 12 }}>{error}</div>}
        </div>
      </div>
      <Footer />
    </>
  );
}
