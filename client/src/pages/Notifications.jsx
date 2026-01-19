import React, { useEffect, useState } from 'react'
import HeaderUlogiran from '../components/HeaderUlogiran'
import Footer from '../components/Footer'
import './Notifications.css'

export default function Notifications() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)

    fetch('/api/poruke', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setMessages(data || [])
        setLoading(false)
      })
      .catch(() => {
        setMessages([])
        setLoading(false)
      })
  }, [])

  function handleDecision(id, decision, index) {
    fetch(`/reservation/${id}/${decision}`, {
      method: 'POST',
      credentials: 'include'
    })

    // ovo bi trebalo radit da zadrzi sve osim te poruke
    setMessages(messages.splice(index, 1))
  }

  return (
    <>
      <HeaderUlogiran />

      <div className="notifications-container">
        <h2>Obavijesti</h2>

        {loading && <p>Učitavanje...</p>}

        {!loading && messages.length === 0 && (
          <p className="muted">Nema obavijesti.</p>
        )}

        {!loading && messages.map((m, i) => (
          <div key={i} className="notification-card">
            <div>
              <div>{m.text}</div>
              <div className="muted">{m.time}</div>
            </div>

            {m.reservationId && (
              <div className="decision-actions">
                <button className="decision-button decision-button--accept" onClick={() => handleDecision(m.reservationId, 'accept', i)}>
                  Prihvati
                </button>
                <button className="decision-button decision-button--reject" onClick={() => handleDecision(m.reservationId, 'reject', i)}>
                  Odbij
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Footer />
    </>
  )
}