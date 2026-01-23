import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './SetnjeSetacu.css';

export default function SetnjeSetacu() {
  const [setnje, setSetnje] = useState([]);
  const [loading, setLoading] = useState(true);
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


  useEffect(() => {
    fetch('/api/setnje-setaca', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setSetnje(data);
        setLoading(false);
      })
      .catch(() => {
        console.error('Greška pri dohvaćanju šetnji');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Učitavanje šetnji...</p>;
  }

  if (setnje.length === 0) {
    return <p>Nemaš budućih zakazanih šetnji.</p>;
  }

  return (
    <div className="setacu-sve-setnje">
      {setnje.map((s) => (
        <div key={s.idsetnja} className="setacu-jedna-setnja">
          <p><strong>Datum:</strong> {formatDatumHR(s.datum)}</p>
          <p><strong>Vrijeme:</strong> {formatVrijeme(s.vrijeme)}</p>
          <p><strong>Polazište:</strong> {s.polaziste}</p>
          <p><strong>Tip šetnje:</strong> {s.tipsetnja}</p>
          <p><strong>Trajanje:</strong> {s.trajanje} min</p>
          <p><strong>Cijena:</strong> {s.cijena} €</p>

          <p>
            <strong>Vlasnik:</strong>{' '}
            <Link to={`/vlasnik/${s.idkorisnik}`}>
              {s.imekorisnik} {s.prezkorisnik}
            </Link>
          </p>

          <p><strong>Dodatne napomene:</strong> {s.dodnapomene || 'Nema dodatnih napomena'}</p>
        </div>
      ))}
    </div>

  );
}
