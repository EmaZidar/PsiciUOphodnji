import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './SetnjeSetacu.css';

export default function SetnjeSetacu() {
  const [setnje, setSetnje] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="setnje-lista">
      {setnje.map((s) => (
        <div key={s.idsetnja} className="setnja-kartica">
          <p><strong>Datum:</strong> {s.datum}</p>
          <p><strong>Vrijeme:</strong> {s.vrijeme}</p>
          <p><strong>Polazište:</strong> {s.polaziste}</p>
          <p><strong>Tip šetnje:</strong> {s.tipsetnje}</p>
          <p><strong>Trajanje:</strong> {s.trajanje} min</p>
          <p><strong>Cijena:</strong> {s.cijena} €</p>

          <p>
            <strong>Vlasnik:</strong>{' '}
            <Link to={`/vlasnik/${s.vlasnikid}`}>
              {s.imekorisnik} {s.prezimekorisnik}
            </Link>
          </p>

        </div>
      ))}
    </div>
  );
}
