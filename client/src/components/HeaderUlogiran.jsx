import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './HeaderUlogiran.css'

export default function Header() {
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  const handleBrandClick = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/me', { credentials: 'include' })
      if (res.ok) {
        navigate('/main')
        return
      }
    } catch (err) {
    }
    navigate('/')
  }

  async function fetchUnread() {
    try {
      let res = await fetch('/api/notifications', { credentials: 'include' })
      if (!res.ok) {
        res = await fetch('/api/poruke', { credentials: 'include' })
      }
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data)) {
        const count = data.filter(n => !n.read).length || data.length
        setUnread(count)
        return
      }
      if (typeof data.unreadCount === 'number') {
        setUnread(data.unreadCount)
        return
      }
      if (typeof data.count === 'number') {
        setUnread(data.count)
        return
      }
    } catch (err) {
    }
  }

  useEffect(() => {
    fetchUnread()
    const iv = setInterval(fetchUnread, 20000)
    return () => clearInterval(iv)
  }, [])

  return (
    <header className="header-container">
      <div className="header-inner">
        <div className="brand"><a className="brand" href="/" onClick={handleBrandClick}>Pawpal</a></div>
        <nav className="header-nav" aria-label="Glavni izbornik">
          <Link to="/notifications" aria-label="Obavijesti" title="Obavijesti" className="notif-link">
            <img src="/images/notification.png" alt="Obavijesti" className="nav-icon" />
            {unread > 0 && (
              <span className="notif-badge">{unread}</span>
            )}
          </Link>
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

