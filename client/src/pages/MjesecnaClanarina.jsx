import './Clanarina.css';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
//TODO: u 59. liniju dodat uvjet && setac.tipClanarina=="mjesecna" ali nijedan setac nema tipclanarine iz nekog razloga 
export default function MjesecnaClanarina() {


	const [setaci, setSetaci] = useState([]);
	  const [sortBy, setSortBy] = useState('ocjena-silazno');
	  const [loading, setLoading] = useState(true);
	  const [error, setError] = useState(null);
  const [prikaziFormu, setPrikaziFormu] = useState(false);
const [mjclanarina, setmjclanarina]=useState(0);

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
		
		const loadmjcl = async () => {
		  try {
			setLoading(true);
			setError(null);
			const response = await fetch('/api/mjesecna', { 
			  method: 'GET',
			  credentials: 'include' });
			if (!response.ok) throw new Error(`Server returned ${response.status}`);
			const data = await response.json();
			setmjclanarina(data.mjesecna?? 0);
		  } catch (err) {
			  setError(err.message || 'Greška pri dohvaćanju podataka');
			  setmjclanarina(0);
		  } finally {
			  setLoading(false);
		  }
		};
	
	loadmjcl();
  }, []);




  function uredi(){
	setPrikaziFormu(true);

  }

  function spremi(e){
	e.preventDefault();
	setPrikaziFormu(false);

  }

  function spremi1(e){
	setmjclanarina(e.target.value);
	fetch("http://localhost:8000/mjesecna", {   //TODO
    method: "POST",
    headers: {
    "Content-Type": "application/json"
  },
    body: JSON.stringify(mjclanarina)
  });
  };

	return (
		<>
		<div className="clanarina-page">
			<h3>Članarine</h3>
			<div className="clanarina-list">
				
				
						<span className="clanarina-naziv">Mjesečna: </span>
						<span className="clanarina-cijena"> {mjclanarina}</span>
						{prikaziFormu && (
            <form onSubmit={spremi}>
              <label> Unesi cijenu: </label>
              <input 
                type="number" 
                name="cijena" 
                value={mjclanarina} 
                onChange={spremi1} 
              />
              <button type="submit">Spremi</button>
            </form>
          )}

		  		{!prikaziFormu&&(<button onClick={uredi}   style={{ marginLeft: 12 }}>Uredi</button>)}

						
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
