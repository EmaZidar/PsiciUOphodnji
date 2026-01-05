import React from 'react';
import './Korisnici.css';

export default function Korisnici() {
    //TODO: ovdje moraju iz baze doc svi korisnici koji nisu administratori i njih se spremit u svikorisnici
    const svikorisnici=[{ime: "snss", prezime: "dnnncvnf"}]
    return(
        <>
        <div className="admin-header">
            <h1>Upravljanje korisnicima</h1>
        </div>
        <div className="admin-header">
            <h2>Popis svih korisnika: </h2>
        </div>
        <div className='upravljanje'>
        {svikorisnici.map(((k)=>(
            <div className='jedan'>
                <p> {k.ime} {k.prezime} 
                    <button>Obriši ga</button>
                </p>

            </div>
        )
        ))}
        </div>
        
        </>


    )
   

}