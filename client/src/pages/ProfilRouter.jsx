import React, { useEffect, useState } from 'react';
import Profile from './Profile.jsx';
import ProfilVlasnik from './ProfilVlasnik.jsx';

export default function ProfilRouter() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch('http://localhost:8000/api/me', { credentials: 'include' })
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
  // if role explicitly says 'vlasnik' show owner profile, otherwise show generic profile
  if (String(role).toLowerCase().includes('vlasnik')) {
    return <ProfilVlasnik />;
  }

  return <Profile />;
}
