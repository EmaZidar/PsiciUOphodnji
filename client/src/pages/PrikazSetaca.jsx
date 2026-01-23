import React, {useState, useEffect} from 'react';
import './PrikazSetaca.css';
import { Link } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export default function PrikazSetaca() {
  const [setaci, setSetaci] = useState([]);
  const [sortBy, setSortBy] = useState('ocjena-silazno');
  const [lokacija, setLokacija] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSetaci = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${BACKEND_URL}/api/setaci`, { 
          method: 'GET',
          credentials: 'include' });
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        const data = await response.json();
        setSetaci(Array.isArray(data) ? data : (data?.setaci ?? []));
      } catch (err) {
          setError(err.message || 'Greška pri dohvaćanju podataka');
          setSetaci([]);
      } finally {
          setLoading(false);
      }
    };

    loadSetaci();
  }, []);

  const sortiraniSetaci = [...(setaci || [])].sort((a, b) => {
    if (sortBy === 'lokacija') {
      const unos = lokacija.trim().toLowerCase();
      if (!unos) return 0;

      const aIma = a.lokdjelovanja.toLowerCase().includes(unos);
      const bIma = b.lokdjelovanja.toLowerCase().includes(unos);

      if (aIma && !bIma) return -1; // a ide gore
      if (!aIma && bIma) return 1; // b ide gore
      return 0;
    }

    if (sortBy === 'cijena-uzlazno') return a.cijena - b.cijena;
    if (sortBy === 'cijena-silazno') return b.cijena - a.cijena;
    if (sortBy === 'ocjena-uzlazno') return a.ocjena - b.ocjena;
    if (sortBy === 'ocjena-silazno') return b.ocjena - a.ocjena;
    return 0;
   })
  
   return (
    <section className="setaci-section">
      <div>
        <h1 className="setaci-title">Pronađi šetača za svog ljubimca</h1>
        <div className="setaci-sort">
          <label className="setaci-sort-label" htmlFor="sort">Sortiraj:</label>
          <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="setaci-sort-select">
            <option value="cijena-uzlazno">Cijena: niža prema višoj</option>
            <option value="cijena-silazno">Cijena: viša prema nižoj</option>
            <option value="ocjena-uzlazno">Ocjena: niža prema višoj</option>
            <option value="ocjena-silazno">Ocjena: viša prema najnižoj</option>
            <option value="lokacija">Od najbližih do najdaljih </option>
          </select>
          {sortBy === 'lokacija' && (
            <input
              type="text"
              placeholder="Unesite grad ili kvart (npr. Trešnjevka)"
              value={lokacija}
              onChange={(e) => setLokacija(e.target.value)}
              className="setaci-lokacija-input"
            />
          )}
        </div>
      </div>
        
      <div className="setaci-list">
        {loading && <p>Učitavanje šetača...</p>}
        {!loading && error && <p className="error-message">{error}</p>}
        {!loading && !error && sortiraniSetaci.map((setac) => (
          <article className="setac-card" key={setac.idkorisnik}>
            <div className="setac-info">
              <h2 className="setac-name">{setac.imekorisnik} {setac.prezkorisnik}</h2>
              <p>
                <span>Lokacija djelovanja: {setac.lokdjelovanja}</span>
              </p>
              <p>
                <span>Cijena: {setac.cijena} €/sat</span>
              </p>
              <p>
                <span>Ocjena: {Number(setac.ocjena).toFixed(2)}/5 ⭐</span>
              </p>
            </div>

            <div className="setac-actions">
              <Link key={setac.idkorisnik} to={`/${setac.idkorisnik}/setnje`}><button className="btn-termini">Dostupne šetnje</button></Link>
            </div>

          </article>
        ))}
      </div>
    </section>
  );
}
