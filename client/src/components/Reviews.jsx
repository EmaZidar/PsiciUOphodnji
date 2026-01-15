import React, { useEffect, useState } from 'react'
import './Reviews.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''

function StarRating({ value = 0, size = '1rem' }) {
  const pct = Math.max(0, Math.min(5, Number(value) || 0)) / 5 * 100
  return (
    <span className="star-row" style={{ fontSize: size }} aria-hidden>
      <span className="stars-empty">★★★★★</span>
      <span className="stars-filled" style={{ width: `${pct}%` }}>★★★★★</span>
    </span>
  )
}

export default function Reviews({ targetUserId, canReview = false }) {
  const [reviews, setReviews] = useState([])
  const [avg, setAvg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newReview, setNewReview] = useState({ rating: 5, text: '' })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/reviews?user=${encodeURIComponent(targetUserId)}`)
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        setReviews(data.reviews || data || [])
        if (Array.isArray(data.reviews)) {
          const a = data.reviews.reduce((s,r)=>s+r.rating,0)/Math.max(1,data.reviews.length)
          setAvg(Math.round(a*10)/10)
        } else {
          const a = (data.reduce? data.reduce((s,r)=>s+r.rating,0)/data.length : 0)
          setAvg(a? Math.round(a*10)/10 : null)
        }
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    if (targetUserId) load()
  }, [targetUserId])

  const submit = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/reviews`, { method: 'POST', headers: { 'Content-Type':'application/json' }, credentials: 'include', body: JSON.stringify({ user: targetUserId, rating: newReview.rating, text: newReview.text }) })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setReviews(prev => [data, ...prev])
      setNewReview({ rating:5, text:'' })
    } catch (e) { console.warn('Failed to submit review', e) }
  }

  return (
    <div className="reviews-panel">
      <h3 className="reviews-title">Recenzije</h3>

      {loading && <div className="reviews-loading">Učitavanje recenzija...</div>}

      {!loading && (
        <>
          <div className="reviews-summary">
            <div className="reviews-average">{avg ?? '—'}</div>
            <div className="reviews-stars"><StarRating value={avg ?? 0} size="1rem" /></div>
            <div className="reviews-count">{reviews.length} recenzija</div>
          </div>

          <div className="reviews-list">
            {reviews.map((r) => (
              <div key={r.id || r._id} className="review-item">
                <div className="review-header">
                  <div className="review-author">{r.authorName || r.author || 'Korisnik'}</div>
                  <div className="review-stars"><StarRating value={r.rating || 0} size="0.95rem" /></div>
                </div>
                <div className="review-text">{r.text}</div>
              </div>
            ))}
          </div>

          {canReview && (
            <div className="reviews-add">
              <h4>Dodaj recenziju</h4>
              <div className="reviews-add-row">
                <label>
                  Ocjena
                  <select value={newReview.rating} onChange={(e) => setNewReview((s) => ({ ...s, rating: Number(e.target.value) }))}>
                    {[5, 4, 3, 2, 1].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="reviews-add-comment">
                Komentar
                <textarea value={newReview.text} onChange={(e) => setNewReview((s) => ({ ...s, text: e.target.value }))} />
              </label>
              <div className="reviews-add-actions">
                <button className="reviews-submit" onClick={submit}>Pošalji recenziju</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
