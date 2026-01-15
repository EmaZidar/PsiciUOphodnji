import React, { useEffect, useState } from 'react';
import "./MojeSetnje.css"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export default function MojeSetnje(){

    const [loading, setLoading] = useState(true);
      const [user, setUser] = useState(null);
      const [error, setError] = useState(null);    
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
        
     // const njegoviPsi = []; // tu nekako s bekenda dobit te podatke
    const firstName =
      user?.imeKorisnik ||
      user?.imekorisnik ||
      user?.ime ||
      user?.name ||
      user?.given_name ||
      '';
    const njegoveProsleSetnje=user?.prosleSetnje || [{datum: "nema"}, { datum: "1.1.2000.",  recenzija: "-" },]
    const njegoveBuduceSetnje=user?.buduceSetnje || [{datum: "nema"}, 
      { datum: "1.1.2026.",  otakazan: "0"}]
    return(
    <>
<div className="basSveSetnje">
<div className="sveSetnje">
    <h2>Moje prošle šetnje:</h2>
    
        {njegoveProsleSetnje.map((setnja)=>(

            <div className='jednaSetnja'>
            <h3>Šetnja</h3>
            <p>Datum: {setnja.datum}</p>
            <p>Recenzija: {setnja.recenzija}</p>
            <button>Ostavi recenziju</button>

        </div>

        ))}
        
    </div>

<div className="sveSetnje">
<h2>Moje buduće šetnje:</h2>
    
        {njegoveBuduceSetnje.map((setnja)=>(

        <div className='jednaSetnja'>
            <h3>Šetnja</h3>
            <p>Zakazana: {setnja.datum} </p>
            <button>Otkaži </button>

        </div>

        ))}
        
    </div>

</div>
    </>
    );
}