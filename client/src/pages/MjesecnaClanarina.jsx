import './Clanarina.css';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
//TODO: u 59. liniju dodat uvjet && setac.tipClanarina=="mjesecna" ali nijedan setac nema tipclanarine iz nekog razloga 
export default function MjesecnaClanarina() {


	const [setaci, setSetaci] = useState([]);
	  const [sortBy, setSortBy] = useState('ocjena-silazno');
	  const [loading, setLoading] = useState(true);
	  const [error, setError] = useState(null);
	
	  useEffect(() => {
		
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


	return (
		<>
		<div className="clanarina-page">
			<h3>Članarine</h3>
			<div className="clanarina-list">
				
				
						<span className="clanarina-naziv">Mjesečna: </span>
						<span className="clanarina-cijena"> 5 eura</span>
						<button style={{ marginLeft: 12 }}>Uredi</button>
					</div>
			
			
		</div>

		<div className="setaci-list">
        {loading && <p>Učitavanje šetača...</p>}
        {!loading && error && <p className="error-message">{error}</p>}
        {!loading  &&!error && setaci.map((setac) => (
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
            </div>

            <div>Tip članarine:  Mjesečna {setac.tipClanarina}</div>

          </article>
        ))}
      </div>
	</>
	);
}
