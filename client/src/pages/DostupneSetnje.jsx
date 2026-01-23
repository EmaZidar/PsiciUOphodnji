import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import HeaderUlogiran from '../components/HeaderUlogiran';
import Footer from '../components/Footer';
import Reviews from '../components/Reviews.jsx';
import {Link} from 'react-router-dom';
import './DostupneSetnje.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export default function DostupneSetnje() {
   const { idkorisnik } = useParams();
   const [loading, setLoading] = useState(true);
   const [setac, setSetac] = useState(null); // podaci o setacu + njegove dostupne setnje
   const [error, setError] = useState(null);

   useEffect(() => {
      //TODO
      // treba mergeat tablice korisnik, setac, setnja, recenzija
      // ovo treba vratit: { setac: { ... , setnje: [ {...}, {...} ] } }
      // btw ovaj useparams idkorisnik je string i treba ga pretvorit u broj ako treba u backu
      if (!idkorisnik) return;

      const loadSetac = async () => {
         try {
            setLoading(true);
            setError(null);
            console.log("Fetching setac data for idkorisnik:", idkorisnik);
            const response = await fetch(`${BACKEND_URL}/api/setnje/${idkorisnik}`, {
               method: 'GET',
               credentials: 'include',
            });
            if (!response.ok) throw new Error('Ne mogu dohvatiti podatke o šetaču');
            const data = await response.json();
            setSetac(data?.setac ?? null);
         } catch (err) {
            setSetac(null);
            setError(err.message || 'Greška pri dohvaćanju');
         } finally {
            setLoading(false);
         }
      };

      loadSetac();
   }, [idkorisnik]);

   return(
   <>
      <HeaderUlogiran />
      <main className="ds-main">
         {loading && (
            <p>Učitavanje šetača...</p>
         )}
         {!loading && error && (
            <p className="error-message">Šetač nije pronađen. {error}</p>
         )}
         {!loading && setac && (
            <>
               <section className="ds-container">
                  <div className="ds-avatar-wrapper">
                     <img src={setac?.profilfoto} alt="Profilna fotografija" className="ds-avatar" />
                  </div>

                  <div className="ds-details">
                     <div className="ds-info-box">
                        <div className="ds-row">
                           <strong>Ime:</strong> {setac.imekorisnik}
                        </div>
                        <div className="ds-row">
                           <strong>Prezime:</strong> {setac.prezkorisnik}
                        </div>
                        <div className="ds-row">
                           <strong>Email:</strong> {setac.email}
                        </div>
                        <div className="ds-row">
                           <strong>Telefon:</strong> {setac.telefon}
                        </div>
                        <div className="ds-row">
                           <strong>Lokacija djelovanja:</strong> {setac.lokdjelovanja}
                        </div>
                     </div>
                  </div>
               </section>

               <section className="setnje-container">
                  <h2>Dostupne šetnje</h2>
                  {Array.isArray(setac.setnje) && setac.setnje.length === 0 && (
                     <p>Šetač nema dostupnih šetnji.</p>
                  )}
                  {Array.isArray(setac.setnje) && setac.setnje.length > 0 && (
                     <ul className="setnje-list">
                        {setac.setnje.map((setnja) => (
                           <li key={setnja.idsetnja} className="setnja-item">
                              <div>
                                 <strong>Tip:</strong> {setnja.tipsetnja}
                              </div>
                              <div>
                                 <strong>Trajanje:</strong> {setnja.trajanje} minuta
                              </div>
                              <div>
                                 <strong>Cijena:</strong> {setnja.cijena} €
                              </div>
                              <div className="setnja-action">
                                 <Link key={setnja.idsetnja} to={`/setnje/${setnja.idsetnja}/rezervacija`}>
                                    <button className="btn-termini">Rezerviraj</button>
                                 </Link>
                              </div>
                           </li>
                        ))}
                     </ul>
                  )}
               </section>
            </>
         )}
      </main>
      <Reviews targetUserId={idkorisnik} />
      <Footer />
   </>);
}