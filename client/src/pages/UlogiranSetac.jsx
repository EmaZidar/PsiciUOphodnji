import React, { useState, useEffect } from 'react';
import HeaderUlogiran from '../components/HeaderUlogiran';
import Footer from '../components/Footer';
import './UlogiranSetac.css';
import Appointments from '../components/Appointments';

export default function UlogiranSetac({ user }) {
  const [remoteUser, setRemoteUser] = useState(user || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) return; 
    let mounted = true;
    setLoading(true);
    fetch('/api/me', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(data => {
        if (!mounted) return;
        setRemoteUser(data.user ?? data.session ?? null);
      })
      .catch(() => {
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  const effectiveUser = remoteUser || user || null;
  const firstName = (effectiveUser && (effectiveUser.imeKorisnik || effectiveUser.name || effectiveUser.ime)) || '';
  const userId = effectiveUser && (effectiveUser._id || effectiveUser.id || effectiveUser.idKorisnik || effectiveUser.idkorisnik);

  return (
    <>
      <HeaderUlogiran />
      <main className="ulogiran-setac-main">
        <h1>Dobrodošli!</h1>
        <Appointments userId={userId} />
      </main>
      <Footer />
    </>
  );
}
