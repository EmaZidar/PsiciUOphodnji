import React, { useEffect, useState } from 'react';
import HeaderUlogiran from '../components/HeaderUlogiran';
import Footer from '../components/Footer';
import UlogiranVlasnik from './UlogiranVlasnik';
import UlogiranSetac from './UlogiranSetac';
import UlogiranAdmin from './UlogiranAdmin';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export default function HomeUlogiran() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCall = async () => {
      const API = `${BACKEND_URL}/api/me`;
      const response = await fetch(API, { credentials: 'include' });
      if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
        
      const data = await response.json();
      return data;
    }

    fetchCall().then(
      data => {
        setUser(data.user ?? data.session ?? null);
        setLoading(false);
      },
      err => {
        setError(err.message);
        setLoading(false);
      }
    )
    
  }, []);

  if (loading) {
    return (
      <>
        <HeaderUlogiran />
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Učitavanje...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <HeaderUlogiran />
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Greška pri učitavanju: {error}</p>
        </main>
        <Footer />
      </>
    );
  }

  const role = user?.role || 'unassigned';

  if (role === 'vlasnik') {
    return <UlogiranVlasnik user={user} />;
  } else if (role === 'setac') {
    return <UlogiranSetac user={user} />;
  } else if (role === 'admin') {
    return <UlogiranAdmin user={user} />;
  } else {
    return (
      <>
        <HeaderUlogiran />
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Vaša uloga nije određena. </p>
        </main>
        <Footer />
      </>
    );
  }
}
