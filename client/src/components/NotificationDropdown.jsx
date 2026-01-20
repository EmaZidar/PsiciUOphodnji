import React from "react";
import './NotificationDropdown.css'

function formatDatumHR(datum) {
  if (!datum) return '';

  const d = new Date(datum);

  const dan = String(d.getDate()).padStart(2, '0');
  const mjesec = String(d.getMonth() + 1).padStart(2, '0');
  const godina = d.getFullYear();

  return `${dan}.${mjesec}.${godina}.`;
}

function formatVrijeme(vrijeme) {
  if (!vrijeme) return '';

  return vrijeme.slice(0, 5);
}



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
            <div key={notif.idrezervacija} className="notif-item">
               {role === 'setac' && (
                  <>
                     <p>
                        Nova rezervacija - <b>{notif.tipsetnja}</b> {notif.cijena} €/sat, {notif.trajanje} min
                        <br />
                        Zahtjev šalje: <b>{notif.imekorisnik} {notif.prezkorisnik}</b>
                        <br />
                        <b>{formatDatumHR(notif.datum)}</b> u <b>{formatVrijeme(notif.vrijeme)}</b> s polazišta <b>{notif.polaziste}</b>
                        <br />
                        Dodatne napomene: {notif.dodnapomene || 'Nema'}
                     </p>
                     <div className="notif-actions">
                        <button onClick={() => onAccept(notif.idrezervacija)}>Prihvati</button>
                        <button onClick={() => onReject(notif.idrezervacija)}>Odbij</button>
                     </div>
                  </>
               )}

               {role === 'vlasnik' && (
                  <>
                     <p>
                        Rezervacija <b>{notif.status}</b>
                        <br />
                        Šetnja: <b>{notif.tipsetnja}</b> {notif.cijena} €/sat, {notif.trajanje} min
                        <br />
                        <b>{formatDatumHR(notif.datum)}</b> u <b>{formatVrijeme(notif.vrijeme)}</b>
                     </p>
                     {notif.status === 'potvrdeno' && (
                        <div className="notif-actions">
                           <button onClick={() => onPay(notif.idrezervacija)}>Plati</button>
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