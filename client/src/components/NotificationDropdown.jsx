import React from "react";
import './NotificationDropdown.css'

export default function NotificationDropdown({ 
   role, 
   notifications,
   loading, 
   error, 
   onAccept, 
   onReject, 
   onPay, 
   onRefresh, 
   onClose 
}) {
   return (
      <div className="notif-dropdown">
         <div className="notif-header">
            <span>Obavijesti</span>
            <button onClick={onClose} aria-label="Zatvori obavijesti" title="Zatvori obavijesti">X</button>
         </div>

         {loading && <p className="notif-loading">Učitavanje obavijesti...</p>}
         {error && <p className="notif-error">Greška: {error}</p>}
         {!loading && !error && notifications.length === 0 && (
            <p className="notif-msg">Nema novih obavijesti.</p>
         )}

         {!loading && !error && notifications.map((notif) => (
            <div key={notif.idRezervacija} className="notif-item">
               {role === 'setac' && (
                  <>
                     <p>
                        Nova rezervacija - <b>{notif.tipSetnja}</b> {notif.cijena} €/sat, {notif.trajanje} min
                        <br />
                        Zahtjev šalje: <b>{notif.imeKorisnik} {notif.prezKorisnik}</b>
                        <br />
                        <b>{notif.datum}</b> u <b>{notif.vrijeme}</b> s polazišta <b>{notif.polaziste}</b>
                        <br />
                        Dodatne napomene: {notif.dodNapomene || 'Nema'}
                     </p>
                     <div className="notif-actions">
                        <button onClick={() => onAccept(notif.idRezervacija)}>Prihvati</button>
                        <button onClick={() => onReject(notif.idRezervacija)}>Odbij</button>
                     </div>
                  </>
               )}

               {role === 'vlasnik' && (
                  <>
                     <p>
                        Rezervacija <b>{notif.status}</b>
                        <br />
                        Šetnja: <b>{notif.tipSetnja}</b> {notif.cijena} €/sat, {notif.trajanje} min
                        <br />
                        <b>{notif.datum}</b> u <b>{notif.vrijeme}</b>
                     </p>
                     {notif.status === 'potvrdeno' && (
                        <div className="notif-actions">
                           <button onClick={() => onPay(notif.idRezervacija)}>Plati</button>
                        </div>
                     )}
                  </>
               )}
            </div>
         ))}

         <button className="notif-refresh" onClick={onRefresh}>Osvježi</button>
      </div>   
   );
}