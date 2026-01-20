

import './Clanarina.css';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
//TODO: u 61. liniju dodat uvjet && setac.tipClanarina=="godisnja" ali nijedan setac nema tipclanarine iz nekog razloga 
export default function GodisnjaClanarina() {

	const [setaci, setSetaci] = useState([]);
	  const [sortBy, setSortBy] = useState('ocjena-silazno');
	  const [loading, setLoading] = useState(true);
	  const [error, setError] = useState(null);
	 const [prikaziFormu, setPrikaziFormu] = useState(false);
const [godclanarina, setgodclanarina]=useState(0);

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


  useEffect(() => {
		
		const loadgodcl = async () => {
		  try {
			setLoading(true);
			setError(null);
			const response = await fetch('/api/godisnja', { 
			  method: 'GET',
			  credentials: 'include' });
			if (!response.ok) throw new Error(`Server returned ${response.status}`);
			const data = await response.json();
			setgodclanarina(data.godisnja?? 0);
		  } catch (err) {
			  setError(err.message || 'Greška pri dohvaćanju podataka');
			  setgodclanarina(0);
		  } finally {
			  setLoading(false);
		  }
		};
	
	loadgodcl();
  }, []);



  function uredi(){
	setPrikaziFormu(true);

  }

  function spremi(e){
	e.preventDefault();
	setPrikaziFormu(false);

  }

  function spremi1(e){
	setgodclanarina(e.target.value);
	fetch("http://localhost:8000/godisnja", {   //TODO
    method: "POST",
    headers: {
    "Content-Type": "application/json"
  },
    body: JSON.stringify(godclanarina)
  });
  };

	return (
		<>
		<div className="clanarina-page">
			<h3>Članarine</h3>
			<div className="clanarina-list">
					<div className="clanarina-item">
						<span className="clanarina-naziv">Godišnja: </span>
						<span className="clanarina-cijena"> {godclanarina}</span>
						{prikaziFormu && (
            <form onSubmit={spremi}>
              <label> Unesi cijenu: </label>
              <input 
                type="number" 
                name="cijena" 
                value={godclanarina} 
                onChange={spremi1} 
              />
              <button type="submit">Spremi</button>
            </form>
          )}

		  		{!prikaziFormu&&(<button onClick={uredi}   style={{ marginLeft: 12 }}>Uredi</button>)}
					</div>
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

			<div>Tip članarine:  Godišnja {setac.tipClanarina}</div>

		  </article>
		))}
	  </div>
	</>
	);
}
