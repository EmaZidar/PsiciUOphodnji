import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationDropdown from './NotificationDropdown'
import './HeaderUlogiran.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export default function Header() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBrandClick = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${BACKEND_URL}/api/me`, { credentials: 'include' })
      if (res.ok) {
        navigate('/main')
        return
      }
    } catch (err) {
    }
    navigate('/')
  }


  const fetchNotifications = async () => {
    if (!user?.role) return;
    setLoading(true);
    setError("");

    const endpoint = user.role === 'setac'
      ? '/api/setac/notifikacije'
      : '/api/vlasnik/notifikacije';

    try {
      const res = await fetch(endpoint, { credentials: 'include' });
      const data = await res.json();
      setNotifications(data);
    } catch {
      setError("Greška pri dohvaćanju notifikacija");
    } finally {
      setLoading(false);
    }
  };
  
  const handleNotifClick = () => {
    const otvaranje = !open;
    setOpen(otvaranje);
    if (otvaranje) fetchNotifications();
  }

  const handleAccept = async (idrezervacija) => {
    setError("");
    
    const res = await fetch(`/api/rezervacija/${idrezervacija}/prihvati`, {
      method: 'PATCH',
      credentials: 'include',
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error || "Prihvaćanje nije uspjelo");
      return;
    }

    await fetchNotifications();
  };

  const handleReject = async (idrezervacija) => {
    setError("");
    
    const res = await fetch(`/api/rezervacija/${idrezervacija}/odbij`, {
      method: 'PATCH',
      credentials: 'include',
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error || "Odbijanje nije uspjelo");
      return;
    }

    await fetchNotifications();
  };

  const handlePay = (idrezervacija) => {
    navigate(`/placanje/${idrezervacija}`);
  };
  
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/me', { credentials: 'include' })
      if (!res.ok) return;
      const data = await res.json();
      setUser(data.user);
    })();
  }, [])
  
  const[prikaziinfo, setprikaziinfo]=useState(false)
  function kliknutinfo(){
      setprikaziinfo(true);
  }

  function zatvori(){
      setprikaziinfo(false);
  }

  return (
    <>
    <header className="header-container">
      <div className="header-inner">
        <div className="brand"><a className="brand" href="/" onClick={handleBrandClick}>Pawpal</a></div>
        <nav className="header-nav" aria-label="Glavni izbornik">
          <button type="button" aria-label="Obavijesti" title="Obavijesti" className="notif-button" onClick={handleNotifClick}>
            <img src="/images/notification.png" alt="Obavijesti" className="nav-icon" />
          </button>
          {open && (
            <NotificationDropdown
              role={user?.role}
              notifications={notifications}
              loading={loading}
              error={error}
              onAccept={handleAccept}
              onReject={handleReject}
              onPay={handlePay}
              onRefresh={fetchNotifications}
              onClose={() => setOpen(false)}
            />
          )}
          <Link to="/chat" aria-label="Chat" title="Chat">
            <img src="/images/chaticon.png" alt="Chat" className="nav-icon" />
          </Link>
          <Link to="/profil" aria-label="Profil" title="Profil">
            <img src="/images/profileIcon.png" alt="Profil" className="ikonaProfila" />
          </Link>
          <button id="neureden" onClick={kliknutinfo}><img src="/images/info.png" alt="Info" className="nav-icon" /></button>
                  
                   
                    </nav>
           
      </div>
     
    </header>
     {prikaziinfo&&(<div className="maliinfo">
              <button id="x" onClick={zatvori}>x</button>
              <h3>Pomoć</h3>
              <p>Za sva pitanja se možete javiti na naš mail pawpal.pomoc@gmail.com</p>
              <br></br>
              <h3>Sigurnost</h3>
              <p>Svi vaši podatci su sigurni na našoj stranici.</p>
              <br></br>
              <h3>Preporučite nas!</h3>
              <p>Ako Vam se svidjela naša stranica, preporučite ju prijateljima</p>
            </div>
            )}
      </>
  );
}
//ako ce bit ruzno ovako ovaj dio prikaziiinfo sam stavi malo gore izmedu ovog nav i zadnjeg diva
