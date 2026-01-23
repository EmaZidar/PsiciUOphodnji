import React, { useEffect, useState } from 'react';
import Profile from './Profile.jsx';
import ProfilVlasnik from './ProfilVlasnik.jsx';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export default function ProfilRouter() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch(`${BACKEND_URL}/api/me`, { credentials: 'include' })
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        setUser(data?.user ?? data?.session ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setUser(null);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Učitavanje profila…</div>;

  const role = user?.role ?? '';
  if (String(role).toLowerCase().includes('vlasnik')) {
    return <ProfilVlasnik />;
  }

  return <Profile />;
}
