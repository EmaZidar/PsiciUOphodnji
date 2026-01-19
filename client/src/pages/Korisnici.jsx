import './Korisnici.css';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

//TODO GUMB ZA BRISANJE + uloga


export default function Korisnici() {
    const [setaci, setSetaci] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
    
      useEffect(() => {
        // TODO
        // ovo su zasad sam setaci moramo i vlasnike ucigtavat iz baze
        const loadSetaci = async () => {
          try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/setaci', { 
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

    const svikorisnici=[{ime: "snss", prezime: "dnnncvnf"}]
    return(
        <>
        <div className="admin-header">
            <h1>Upravljanje korisnicima</h1>
        </div>
        <div className="admin-header">
            <h2>Popis svih korisnika: </h2>
        </div>
        
        
        <div className="setaci-list">
        {loading && <p>Učitavanje korisnika...</p>}
        {!loading && error && <p className="error-message">{error}</p>}
        {!loading && !error && setaci.map((setac) => (
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
                <span>Ocjena: {setac.ocjena}/5 ⭐</span>
              </p>
              <p>
                <span>Uloga: </span>
              </p>
            </div>

            <button>Obriši ga</button>   

          </article>
        ))}
      </div>
        </>


    )
   

}