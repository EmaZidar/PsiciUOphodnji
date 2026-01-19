import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderUlogiran from '../components/HeaderUlogiran';
import Footer from '../components/Footer';
import './Rezervacija.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export default function Rezervacija() {
   const navigate = useNavigate();
   const { idkorisnik, idsetnja } = useParams();

   const [rezervacija, setRezervacija] = useState({
      polaziste: '',
      vrijeme: '',
      datum: '',
      nacinPlacanja: 'gotovina',
      dodNapomene: '',
   });

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   function handleChange(e) {
      const { name, value } = e.target;
      setRezervacija(prev => ({ ...prev, [name]: value }));
   }

   function validate() {
      if (!rezervacija.polaziste) return 'Polazište je obavezno.';
      if (!rezervacija.vrijeme) return 'Vrijeme je obavezno.';
      if (!rezervacija.datum) return 'Datum je obavezan.';
      if (!idsetnja) return 'ID šetnje nije pronađen u URL-u.';
      if (!idkorisnik) return 'ID korisnika nije pronađen u URL-u.';
      return null;
   }

   async function handleSubmit(e) {
      e.preventDefault();
      setError(null);

      const validationError = validate();
      if (validationError) {
         setError(validationError);
         return;
      }

      setLoading(true);
      //TODO
      // treba insertat u tablicu rezervacija
      // podaci su u rezervacija + idsetnja iz params + idkorisnik iz params
      
      try {
         const payload = {
            ...rezervacija,
            idSetnja: idsetnja,
            idKorisnik: idkorisnik,
            status: 'na čekanju',
         };
         const res = await fetch(`${BACKEND_URL}/api/rezervacije`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });

         if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `Server returned ${res.status}`);
         }

         const created = await res.json();
         const idRezervacija = created.idRezervacija || created.id || created.insertId || null;
         if (!idRezervacija) throw new Error('Nije vraćen id rezervacije od servera.');

         setLoading(false);
         navigate(`/placanje/${idRezervacija}`);
      } catch (err) {
         setError('Greška pri slanju rezervacije: ' + err.message);
         setLoading(false);
      }
   }

   return (<>
      <HeaderUlogiran />
      <div className="rezervacija-container">
         <h2>Rezervacija</h2>
         <form className="rezervacija-form" onSubmit={handleSubmit}>
            <label>
               Polazište
               <input name="polaziste" placeholder="Adresa" value={rezervacija.polaziste} onChange={handleChange} required />
            </label>
            <label>
               Vrijeme
               <input type="time" name="vrijeme" value={rezervacija.vrijeme} onChange={handleChange} required />
            </label>
            <label>
               Datum
               <input type="date" name="datum" value={rezervacija.datum} onChange={handleChange} required />
            </label>
            <label>
               Način plaćanja
               <select name="nacinPlacanja" value={rezervacija.nacinPlacanja} onChange={handleChange}>
                  <option value="gotovina">Gotovina</option>
                  <option value="PayPal">PayPal</option>
                  <option value="kreditna kartica">Kreditna kartica</option>
               </select>
            </label>
            <label>
               Dodatne napomene
               <textarea name="dodNapomene" placeholder="Npr. pas reagira na mačke, ne voli bicikle i sl." value={rezervacija.dodNapomene} onChange={handleChange} maxLength={300} />
            </label>
            <div className="rezervacija-actions">
               <button type="submit" disabled={loading}>{loading ? 'Šaljem...' : 'Pošalji zahtjev'}</button>
            </div>

            {error && <div className="rezervacija-error">{error}</div>}
         </form>
      </div>
      <Footer />
   </>);
}