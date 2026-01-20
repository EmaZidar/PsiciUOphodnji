import React, { useState } from 'react';
import './Reviews.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

function StarRating({ value = 0, size = '1rem' }) {
  const pct = Math.max(0, Math.min(5, Number(value) || 0)) / 5 * 100;
  return (
    <span className="star-row" style={{ fontSize: size }} aria-hidden>
      <span className="stars-empty">★★★★★</span>
      <span className="stars-filled" style={{ width: `${pct}%` }}>★★★★★</span>
    </span>
  );
}

export default function Reviews({
  reviews = [],
  averageRating = null,
  reviewCount = 0,
  canReview = false,
  targetUserId
}) {
  const [newReview, setNewReview] = useState({ rating: 5, text: '' });
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const submit = async () => {
    if (loadingSubmit) return;

    try {
      setLoadingSubmit(true);
      const res = await fetch(`${BACKEND_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user: targetUserId,
          rating: newReview.rating,
          text: newReview.text
        })
      });
      if (!res.ok) throw new Error('Slanje recenzije nije uspjelo');
      setNewReview({ rating: 5, text: '' });
    } catch (e) {
      console.warn('Greška pri slanju recenzije:', e);
      alert('Neuspjelo slanje recenzije. Pokušajte opet.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="reviews-panel">
      <h3 className="reviews-title">Recenzije</h3>
      <div className="reviews-summary">
        <div className="reviews-average">{averageRating?.toFixed(1) ?? '—'}</div>
        <div className="reviews-stars">
          <StarRating value={averageRating ?? 0} size="1rem" />
        </div>
        <div className="reviews-count">{reviewCount} recenzija</div>
      </div>

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">Još nema recenzija</div>
        ) : (
          reviews.map((r, index) => (
            <div key={r.idRecenzija || r.id || index} className="review-item">
              <div className="review-header">
                <div className="review-author">
                  {r.imeVlasnik || r.authorName || r.author || 'Korisnik'}
                </div>
                <div className="review-stars">
                  <StarRating value={r.ocjena || r.rating || 0} size="0.95rem" />
                </div>
              </div>
              <div className="review-text">{r.tekst || r.text}</div>
            </div>
          ))
        )}
      </div>

      {canReview && (
        <div className="reviews-add">
          <h4>Dodaj recenziju</h4>
          <label>
            Ocjena
            <select
              value={newReview.rating}
              onChange={(e) => setNewReview((s) => ({ ...s, rating: Number(e.target.value) }))}
              disabled={loadingSubmit}
            >
              {[5, 4, 3, 2, 1].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>

          <label className="reviews-add-comment">
            Komentar
            <textarea
              value={newReview.text}
              onChange={(e) => setNewReview((s) => ({ ...s, text: e.target.value }))}
              rows="4"
              disabled={loadingSubmit}
              placeholder="Opciono - podijeli svoje iskustvo..."
            />
          </label>

          <div className="reviews-add-actions">
            <button
              className="reviews-submit"
              onClick={submit}
              disabled={loadingSubmit || !newReview.rating}
            >
              {loadingSubmit ? 'Slanje...' : 'Pošalji recenziju'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
