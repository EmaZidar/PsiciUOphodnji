import React, { useEffect, useState } from "react";
import "./Reviews.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

export default function Reviews({ targetUserId }) {
  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState({ukOcjena: null, brojRecenzija: 0});
  const [ratingLoading, setRatingLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!targetUserId) return;

    async function loadRatingSummary() {
      try {
        setRatingLoading(true);
        setError("");

        const res = await fetch(
          `${BACKEND_URL}/api/setaci/${targetUserId}/rating-summary`,
          { credentials: "include" }
        );

        if (!res.ok) {
          throw new Error("Greška pri dohvaćanju sažetka ocjena");
        }

        const data = await res.json();
        setRating({
          ukOcjena: data.ukocjena ?? null,
          brojRecenzija: data.brojrecenzija ?? 0,
        });

      } catch (err) {
        setError(err.message);
        setRating({ ukOcjena: null, brojRecenzija: 0 });
      } finally {
        setRatingLoading(false);
      }
    }

    loadRatingSummary();
  }, [targetUserId]);

  useEffect(() => {
    if (!targetUserId) return;

    async function fetchReviews() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${BACKEND_URL}/api/setaci/${targetUserId}/recenzije`,
          { credentials: "include" }
        );

        if (!res.ok) {
          throw new Error("Ne mogu dohvatiti recenzije");
        }

        const data = await res.json();
        setReviews(Array.isArray(data.recenzije) ? data.recenzije : []);
      } catch (err) {
        setError(err.message);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [targetUserId]);

  return (
    <section className="reviews-section">
      <h2>Recenzije</h2>

      {ratingLoading ? (
        <p>Učitavanje sažetka...</p>
      ) : rating.ukOcjena ? (
        <p className="reviews-summary">
          {Number(rating.ukOcjena).toFixed(2)}/5 ⭐ ({rating.brojRecenzija} recenzija)
        </p>
      ) : (
        <p>Još nema recenzija</p>
      )}

      {error && <p className="reviews-error">{error}</p>}

      {loading && <p>Učitavanje recenzija...</p>}

      {!loading && !error && reviews.length === 0 && (
        <p>Nema recenzija za prikaz.</p>
      )}

      {!loading && !error && reviews.length > 0 && (
        <div className="reviews-list">
          {reviews.map((r) => (
            <article key={r.idrecenzija} className="review-card">
              <div className="review-top">
                <strong>
                  {r.imekorisnik} {r.prezkorisnik}
                </strong>
                <span>{r.ocjena}/5 ⭐</span>
              </div>

              {r.tekst && <p className="review-text">{r.tekst}</p>}
                
              {r.fotografija && (
                <div className="review-photo">
                  <img
                    src={r.fotografija}
                    alt="Fotografija recenzije"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
