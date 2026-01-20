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

  const handleAccept = async (idRezervacija) => {
    await fetch(`/api/rezervacija/${idRezervacija}/prihvati`, {
      method: 'PATCH',
      credentials: 'include',
    });
    fetchNotifications();
  };

  const handleReject = async (idRezervacija) => {
    await fetch(`/api/rezervacija/${idRezervacija}/odbij`, {
      method: 'PATCH',
      credentials: 'include',
    });
    fetchNotifications();
  };

  const handlePay = (idRezervacija) => {
    navigate(`/placanje/${idRezervacija}`);
  };

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/me', { credentials: 'include' })
      if (!res.ok) return;
      const data = await res.json();
      setUser(data.user);
    })();
  }, [])

  return (
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
          <Link to="/info" aria-label="Info" title="Info">
            <img src="/images/info.png" alt="Info" className="nav-icon" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

