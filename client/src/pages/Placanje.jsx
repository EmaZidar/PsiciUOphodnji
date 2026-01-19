import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderUlogiran from '../components/HeaderUlogiran';
import Footer from '../components/Footer';
import './Placanje.css';

// formatira da uvijek budu samo znamenke 
const samoZnamenke = (s) => (s ?? '').replace(/\D/g, '');

const formatirajBrojKartice = (value) => {
  const znamenke = samoZnamenke(value).slice(0, 16);
  return znamenke;
};

const formatirajDatumIsteka = (value) => {
  const znamenke = samoZnamenke(value).slice(0, 4);
  if (znamenke.length <= 2) return znamenke;
  return `${znamenke.slice(0, 2)}/${znamenke.slice(2)}`;
};

const validatePayment = ({ brojKartice, datumIsteka, nositelj, cvv }) => {
  if (samoZnamenke(brojKartice).length !== 16)
    return 'Broj kartice mora imati 16 znamenki.';

  if (!/^\d{2}\/\d{2}$/.test(datumIsteka))
    return 'Datum isteka mora biti u formatu MM/GG.';

  if (!nositelj || nositelj.trim().length < 3)
    return 'Unesi ime nositelja kartice.';

  if (samoZnamenke(cvv).length !== 3)
    return 'CVV mora imati 3 znamenke.';

  return null;
};

export default function Placanje() {
  const navigate = useNavigate();
  const { idRezervacija } = useParams();

  const [rezervacija, setRezervacija] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [brojKartice, setBrojKartice] = useState('');
  const [datumIsteka, setDatumIsteka] = useState('');
  const [nositelj, setNositelj] = useState('');
  const [cvv, setCvv] = useState('');

  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [formError, setFormError] = useState('');

  /* dohvat rezervacije */
  useEffect(() => {
    async function fetchRezervacija() {
      try {
        const res = await fetch(`/api/rezervacije/${idRezervacija}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`Server vratio ${res.status}`);
        const data = await res.json();
        setRezervacija(data);

        if (data.status === 'placeno') {
          setPaid(true);
        }
      } catch (err) {
        setError('Ne mogu dohvatiti rezervaciju.');
      } finally {
        setLoading(false);
      }
    }
    fetchRezervacija();
  }, [idRezervacija]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const err = validatePayment({ brojKartice, datumIsteka, nositelj, cvv });
    if (err) {
      setFormError(err);
      return;
    }

    setPaying(true);
    await new Promise((r) => setTimeout(r, 2000)); // "procesiranje placanja"

    try {
      const res = await fetch(`/api/rezervacije/${idRezervacija}/placanje`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'placeno' }),
      });
      if (!res.ok) throw new Error();

      setPaid(true);
    } catch {
      setFormError('Greška pri plaćanju.');
    } finally {
      setPaying(false);
    }
  };

  const karticnoPlacanje =
    rezervacija?.nacinPlacanja === 'kreditna kartica';

  return (
    <>
      <HeaderUlogiran />

      <div className="placanje-container">
        <h2>Plaćanje</h2>

        <div className="placanje-card">
          {loading ? (
            <p>Učitavanje...</p>
          ) : error ? (
            <p className="placanje-error">{error}</p>
          ) : (
            <>
              <p><strong>Datum:</strong> {rezervacija.datum}</p>
              <p><strong>Vrijeme:</strong> {rezervacija.vrijeme}</p>
              <p><strong>Polazište:</strong> {rezervacija.polaziste}</p>
              <p><strong>Način plaćanja:</strong> {rezervacija.nacinPlacanja}</p>
              <p><strong>Status:</strong> {rezervacija.status}</p>
            </>
          )}
        </div>

        {!loading && !error && rezervacija && (
          <div className="placanje-card">

            {paid && (
              <div className="placanje-success">
                <p><strong>Plaćeno!</strong></p>
                <button onClick={() => navigate('/main')} className="placanje-btn primary">
                  Povratak
                </button>
              </div>
            )}

            {!paid && karticnoPlacanje && (
              <>
                <h3>Podaci kartice</h3>
                <form onSubmit={handleSubmit} className="placanje-form">
                  <input
                    className="placanje-input"
                    placeholder="Broj kartice"
                    value={brojKartice}
                    onChange={(e) =>
                      setBrojKartice(formatirajBrojKartice(e.target.value))
                    }
                    disabled={paying}
                  />

                  <input
                    className="placanje-input"
                    placeholder="MM/GG"
                    value={datumIsteka}
                    onChange={(e) =>
                      setDatumIsteka(formatirajDatumIsteka(e.target.value))
                    }
                    disabled={paying}
                  />

                  <input
                    className="placanje-input"
                    placeholder="Nositelj kartice"
                    value={nositelj}
                    onChange={(e) => setNositelj(e.target.value)}
                    disabled={paying}
                  />

                  <input
                    className="placanje-input"
                    placeholder="CVV"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(samoZnamenke(e.target.value).slice(0, 3))
                    }
                    disabled={paying}
                  />

                  {formError && (
                    <p className="placanje-error">{formError}</p>
                  )}

                  {paying && (
                    <p className="placanje-processing">
                      Provođenje transakcije...
                    </p>
                  )}

                  <button
                    type="submit"
                    className="placanje-btn primary"
                    disabled={paying}
                  >
                    Potvrdi plaćanje
                  </button>
                </form>
              </>
            )}

            {!paid && !karticnoPlacanje && (
              <div className="placanje-info">
                <p>
                  <strong>Plaćanje gotovinom</strong>
                </p>
                <p>
                  Plaćanje se vrši gotovinom nakon odrađene šetnje.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
