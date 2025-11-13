import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RegistrationOptions.css';

export default function RegistrationOptions() {
  const navigate = useNavigate();

  const handleSelection = async (role) => {
    try {
      await fetch('/api/user/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
    } catch (e) {
      console.warn('Could not persist role:', e);
    }

    navigate('/');
  };

  return (
    <div className="role-page">
      <div className="role-card">
        <h1>Odaberite ulogu</h1>
        

        <div className="role-buttons">
          <button onClick={() => handleSelection('setac')} className="role-btn primary">Šetač</button>
          <button onClick={() => handleSelection('vlasnik psa')} className="role-btn primary">Vlasnik psa</button>
        </div>
      </div>
    </div>
  );
}
