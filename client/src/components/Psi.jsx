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
    
 // const njegoviPsi = []; // tu nekako s bekenda dobit te podatke
const firstName =
  user?.imeKorisnik ||'';
const idvlasnika = user?.idKorisnik||'';
const njegoviPsi=user?.Psi || [{ime: "imamIme"}, { ime: "Rex", pasmina: "Mješanac", dob: 3, energija: "visoka" },
  { ime: "Max" }]


  const [prikaziFormu, setPrikaziFormu] = useState(false);


  const [pas, setPas] = useState({
  ime: "",
  pasmina: "",
  dob: "",
  energija: ""
});

  function spremi(e) {
  setPas({
    ...pas,
    [e.target.name]: e.target.value
  });
}


function handleSubmit(e) {
  e.preventDefault();
  const kojiPas={...pas, idKorisnik: idKorisnik}
  fetch("http://localhost:8000/psi", {   //TODO link provjeri
    method: "POST",
    headers: {
    "Content-Type": "application/json"
  },
    body: JSON.stringify(kojiPas)
  });
  setPrikaziFormu(false);
}

function odustani(){
  setPrikaziFormu(false)
  setPas({ime: "", pasmina:"", energija:"", dob:""});
}

function resetiraj(e){
  e.preventDefault();
  setPas({ime: "", pasmina:"", energija:"", dob:""});
}

function izbrisi(){
  const kojiPas={...pas, idKorisnik: idKorisnik}
  fetch("http://localhost:8000/psi", {   // link 
    method: "POST",
    body: JSON.stringify(kojiPas)
  });
}



  return (
    <div className="sviPsi">
        {njegoviPsi.map((pas)=> (<div className="jedanPas"> 
            <h3 className="imePsa">{pas.ime || "-" }</h3>
            <p>Pasmina:{pas.pasmina || "-"}</p>
            <p>Godine: {pas.dob|| "-"}</p>
            <p>Razina energije: {pas.energija|| "-"}</p>
            <button onClick={izbrisi}>Izbriši psa</button>                       

         </div>))}
         <div className="dodajP">
                    <button onClick={() => setPrikaziFormu(true)}>+</button>
         </div>
         {prikaziFormu&&(<form onSubmit={handleSubmit} className="dodajPsa">
            <label for="ime">Ime psa:</label>
            <input type="text" id="ime" name="ime"   value={pas.ime}  onChange={spremi}></input><br></br>
            <label for="pasmina">Pasmina:      </label>
            <input type="text" id="pasmina" name="pasmina" value={pas.pasmina}  onChange={spremi}></input><br></br>
            <label for="dob">Godine:</label>
            <input type="number" id="dob" name="dob" value={pas.dob}  onChange={spremi}></input><br></br>
            <label for="energija">Razina energije:    </label>
            <input type="text" id="energija" name="energija"   value={pas.energija}  onChange={spremi}></input><br></br>
            <button type="submit" >Dodaj psa</button>
            <button onClick={resetiraj} >Resetiraj</button>
            <button onClick={odustani} >Odustani</button>



        </form>)}
        

    </div>    
    );
}
