import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './VlasnikInfo.css';

export default function VlasnikInfo() {
  const { id } = useParams();
  const [vlasnik, setVlasnik] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVlasnik() {
      try {
        const res = await fetch(`/api/vlasnik/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Greška pri dohvaćanju vlasnika');
        const data = await res.json();
        setVlasnik(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchVlasnik();
  }, [id]);

  if (loading) return <p>Učitavanje vlasnika...</p>;
  if (!vlasnik) return <p>Vlasnik nije pronađen.</p>;

  return (
    <div className="vlasnik-info">
      <h2>Profil vlasnika</h2>

      <p><strong>Ime:</strong> {vlasnik.imekorisnik}</p>
      <p><strong>Prezime:</strong> {vlasnik.prezimekorisnik}</p>
      <p><strong>Email:</strong> {vlasnik.email}</p>
      <p><strong>Telefon:</strong> {vlasnik.telefon}</p>

      <h3>Psi vlasnika</h3>
      <ul className="psi-lista">
        {vlasnik.psi.map(p => (
          <li key={p.idpas} className="pas-kartica">
            <p><strong>Ime psa:</strong> {p.imepas}</p>
            <p><strong>Pasmina:</strong> {p.pasmina}</p>
            <p><strong>Godine:</strong> {p.starost}</p>
            <p><strong>Razina energije:</strong> {p.razinaenergije}/5</p>
            <p><strong>Socijalizacija:</strong> {p.socijalizacija}/5</p>
            <p><strong>Zdravstvene napomene:</strong> {p.zdravnapomene || 'Nema napomena'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
