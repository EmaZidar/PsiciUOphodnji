import React, { useEffect, useState } from 'react';
import './Psi.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export default function Psi() {

const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);   
          const [psi, setpsi] = useState([]);
  
  useEffect(() => {
        const API = `${BACKEND_URL}/api/me`;
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


 

    useEffect(() => {
            
            const loadpsi = async () => {
              try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${BACKEND_URL}/api/psi`, { 
                  method: 'GET',
                  credentials: 'include' });
                if (!response.ok) throw new Error(`Server returned ${response.status}`);
                const data = await response.json();
                setpsi(Array.isArray(data) ? data : (data?.psi ?? []));
              } catch (err) {
                  setError(err.message || 'Greška pri dohvaćanju podataka');
                  setpsi([]);
              } finally {
                  setLoading(false);
              }
            };
        
        loadpsi();
      }, []);
    
 // const njegoviPsi = []; // tu nekako s bekenda dobit te podatke

const idKorisnik = user?.idKorisnik||'';
const njegoviPsi=psi || [{imePas: "imamIme"}, { imePas: "Rex", pasmina: "Mješanac", starost: 3, razinaEnergije: "visoka" },
  { imePas: "Max" }]


  const [prikaziFormu, setPrikaziFormu] = useState(false);


  const [pas, setPas] = useState({
  imePas: "",
  pasmina: "",
  starost: "",
  razinaEnergije: "",
  zdravNapomene:"",
  socijalizacija:""
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
  fetch(`${BACKEND_URL}/api/psi`, {   //TODO
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
  setPas({imePas: "",
  pasmina: "",
  starost: "",
  razinaEnergije: "",
  zdravNapomene:"",
  socijalizacija:""});
}

function resetiraj(e){
  e.preventDefault();
  setPas({imePas: "",
  pasmina: "",
  starost: "",
  razinaEnergije: "", zdravNapomene:"", socijalizacija:""});
}

function izbrisi(idPas){
  fetch(`${BACKEND_URL}/api/psi/${idPas}`, {   // tu mozda napravi da se odma opet izrendera stranica pa ga nece bit sad
    method: "DELETE",
  });
}



  return (
    <div className="sviPsi">
        {njegoviPsi.map((pas)=> (<div key={pas.idPas} className="jedanPas"> 
            <h3 className="imePsa">{pas.imePas || "-" }</h3>
            <p>Pasmina:{pas.pasmina || "-"}</p>
            <p>Godine: {pas.starost|| "-"}</p>
            <p>Socijalizacija s drugim psima:{pas.socijalizacija || "-"}</p>
            <p>Zdravstvene napomene: {pas.zdravNapomene || "-"}</p>
            <p>Razina energije: {pas.razinaEnergije|| "-"}</p>

            <button onClick={izbrisi(pas.idPas)}>Izbriši psa</button>                       

         </div>))}
         <div className="dodajP">
                    <button onClick={() => setPrikaziFormu(true)}>+</button>
         </div>
         {prikaziFormu&&(<form onSubmit={handleSubmit} className="dodajPsa">
            <label >Ime psa:</label>
            <input type="text" id="imePas" name="imePas"  required value={pas.imePas} maxLength={50} onChange={spremi} ></input><br></br>
            <label >Pasmina:      </label>
            <input type="text" id="pasmina" name="pasmina" required value={pas.pasmina} maxLength={50} onChange={spremi}></input><br></br>
            <label>Godine:</label>
            <input type="number" id="starost" required name="starost" value={pas.starost} max={20} onChange={spremi}></input><br></br>
            <label >Razina energije:    </label>
            <input type="number" id="razinaEnergije" name="razinaEnergije"  max={5} required value={pas.razinaEnergije}  onChange={spremi}></input><br></br>
            <label>Socijalizacija:    </label>
            <input type="number" id="socijalizacija" required name="socijalizacija"  max={5} value={pas.socijalizacija}  onChange={spremi}></input><br></br>
            <label >Zdravstvene napomene: </label>
            <input type="text" id="zdravNapomene"  name="zdravNapomene" maxLength={500}  value={pas.zdravNapomene}  onChange={spremi}></input><br></br>

            <button type="submit" >Dodaj psa</button>
            <button onClick={resetiraj} >Resetiraj</button>
            <button onClick={odustani} >Odustani</button>



        </form>)}
        

    </div>    
    );
}
