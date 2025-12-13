import React from 'react';
import HeaderUlogiran from '../components/HeaderUlogiran';
import Footer from '../components/Footer';
import './PrikazSetaca.css';

export default function PrikazSetaca() {
  return (
    <>
      <HeaderUlogiran />
        <h1>Prikaz dostupnih šetača</h1>

        <div className="prikaz_setaca">
                <div className="sortiranje">
                    <h2>Sortiraj</h2>
                    //mislim da ovdje treba bit form pa da se to nekako salje na bekend
                        <select>
                            <option value="cijena-uzlazno">Cijena: niža prema višoj</option>
                            <option value="cijena-silazno">Cijena: viša prema nižoj</option>
                            <option value="ocjena-uzlazno">Ocjena: niža prema višoj</option>
                            <option value="ocjena-silazno">Ocjena: viša prema najnižoj</option>
                            <option value="lokacija">od najbližih šetača do najdaljih </option>
                        </select>
                    
                </div>

                <div className="popis_setaca">
                    {Map(setaci, (setac) => (
                    <div className="setac">
                        <h3> {setac.name}</h3>
                        <p>Lokacija: {setac.location}</p>
                        <p>Cijena (po satu): {setac.price} eura</p>
                        <p>Ocjena: {setac.rating} / 5</p>
                        <button className="pogledajTermine">Pogledaj termine</button>
                
                    </div>
                    ))}
                </div>
        </div>
        

        

        
      <Footer />
    </>
  );
}
