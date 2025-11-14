import React, { useState, useEffect } from 'react';
import './Register.css';

export default function Register (){
  const [formData, setFormData] = useState({
    // Osnovni podaci za sve korisnike
    ime: '',
    prezime: '',
    email: '',
    telefon: '',
    
    // Odabir uloge
    uloga: '',
    
    // Podaci specifični za šetače
    tipClanarina: '',
    lokDjelovanja: '',
    profilFoto: null,
    
    // Podaci specifični za vlasnike
    primanjeObavijesti: false
  });

  // Preuzmi ime, prezime i email iz URL parametara
  const fullName = new URLSearchParams(window.location.search).get('name') || '';
  const firstName = fullName.split(' ')[0] || '';
  const lastName = fullName.split(' ')[1] || '';
  const email = new URLSearchParams(window.location.search).get('email') || '';
  console.log('Preuzeti podaci iz URL-a:', { firstName, lastName, email });

  // Postavi preuzete podatke u formu kada se komponenta učita
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ime: firstName,
      prezime: lastName,
      email: email
    }));
  }, [firstName, lastName, email]);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'file' ? files[0] : value
    }));
    
    // Očisti error kada korisnik počne unositi
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Osnovna validacija
    if (!formData.ime.trim()) newErrors.ime = 'Ime je obavezno';
    if (!formData.prezime.trim()) newErrors.prezime = 'Prezime je obavezno';
    if (!formData.email.trim()) newErrors.email = 'Email je obavezan';
    if (!formData.telefon.trim()) newErrors.telefon = 'Telefon je obavezan';
    
    // Validacija uloge
    if (!formData.uloga) newErrors.uloga = 'Odaberite ulogu';
    
    // Validacija specifična za šetače
    if (formData.uloga === 'setac') {
      if (!formData.tipClanarina) newErrors.tipClanarina = 'Odaberite vrstu članarine';
      if (!formData.lokDjelovanja.trim()) newErrors.lokDjelovanja = 'Lokacija djelovanja je obavezna';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Prvo registriraj osnovnog korisnika
      const userResponse = await fetch('/api/korisnik/registracija', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ime: formData.ime,
          prezime: formData.prezime,
          email: formData.email,
          telefon: formData.telefon
        })
      });

      const userData = await userResponse.json();

      // Zatim registriraj specifičnu ulogu
      if (formData.uloga === 'setac') {
        await fetch('/api/korisnik/registracija/setac', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idKorisnik: userData.id,
            tipClanarina: formData.tipClanarina,
            lokDjelovanja: formData.lokDjelovanja,
            profilFoto: '/default-profile.jpg' // Za sementara
          })
        });
      } else if (formData.uloga === 'vlasnik') {
        await fetch('/api/korisnik/vlasnik', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idKorisnik: userData.id,
            primanjeObavijesti: formData.primanjeObavijesti
          })
        });
      }

      alert('Registracija uspješna!');
      // Redirect na login ili dashboard
      
    } catch (error) {
      console.error('Greška pri registraciji:', error);
      alert('Došlo je do greške pri registraciji');
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-form">
        <h1>🐕 Registracija za PawPal</h1>
        <p>Pridružite se našoj zajednici ljubitelja pasa</p>

        <form onSubmit={handleSubmit}>
          {/* OSNOVNI PODACI ZA SVE KORISNIKE */}
          <div className="form-section">
            <h2>Osnovni podaci</h2>
            
            <div className="input-group">
              <div className="input-row">
                <div className="input-field">
                  <label htmlFor="ime">Ime *</label>
                  <input
                    type="text"
                    id="ime"
                    name="ime"
                    value={formData.ime}
                    onChange={handleInputChange}
                    className={errors.ime ? 'error' : ''}
                    placeholder="Unesite vaše ime"
                  />
                  {errors.ime && <span className="error-text">{errors.ime}</span>}
                </div>

                <div className="input-field">
                  <label htmlFor="prezime">Prezime *</label>
                  <input
                    type="text"
                    id="prezime"
                    name="prezime"
                    value={formData.prezime}
                    onChange={handleInputChange}
                    className={errors.prezime ? 'error' : ''}
                    placeholder="Unesite vaše prezime"
                  />
                  {errors.prezime && <span className="error-text">{errors.prezime}</span>}
                </div>
              </div>

              <div className="input-row">
                <div className="input-field">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="primjer@email.com"
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="input-field">
                  <label htmlFor="telefon">Telefon *</label>
                  <input
                    type="tel"
                    id="telefon"
                    name="telefon"
                    value={formData.telefon}
                    onChange={handleInputChange}
                    className={errors.telefon ? 'error' : ''}
                    placeholder="+385 9X XXX XXX"
                  />
                  {errors.telefon && <span className="error-text">{errors.telefon}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* ODABIR ULOGE */}
          <div className="form-section">
            <h2>Odaberite vašu ulogu *</h2>
            {errors.uloga && <span className="error-text">{errors.uloga}</span>}
            
            <div className="role-selection">
              <div 
                className={`role-option ${formData.uloga === 'vlasnik' ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, uloga: 'vlasnik' }))}
              >
                <div className="role-icon">🏠</div>
                <h3>Vlasnik psa</h3>
                <p>Tražim pouzdane šetače za svog ljubimca</p>
                <ul>
                  <li>Pronađite provjerene šetače</li>
                  <li>Rezervirajte šetnje online</li>
                  <li>Pratite svog psa u stvarnom vremenu</li>
                </ul>
              </div>

              <div 
                className={`role-option ${formData.uloga === 'setac' ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, uloga: 'setac' }))}
              >
                <div className="role-icon">🚶‍♂️</div>
                <h3>Šetač pasa</h3>
                <p>Želim šetati pse i zarađivati</p>
                <ul>
                  <li>Povežite se s vlasnicima u vašem području</li>
                  <li>Fleksibilno radno vrijeme</li>
                  <li>Sigurna naplata usluga</li>
                </ul>
              </div>
            </div>
          </div>

          {/* SPECIFIČNI PODACI ZA ŠETAČE */}
          {formData.uloga === 'setac' && (
            <div className="form-section role-specific">
              <h2>🐕 Podaci za šetače</h2>
              
              <div className="input-group">
                <div className="input-field">
                  <label htmlFor="tipClanarina">Vrsta članarine *</label>
                  <select
                    id="tipClanarina"
                    name="tipClanarina"
                    value={formData.tipClanarina}
                    onChange={handleInputChange}
                    className={errors.tipClanarina ? 'error' : ''}
                  >
                    <option value="">Odaberite vrstu članarine</option>
                    <option value="mjesečna">Mjesečna članarina</option>
                    <option value="godišnja">Godišnja članarina</option>
                  </select>
                  {errors.tipClanarina && <span className="error-text">{errors.tipClanarina}</span>}
                </div>

                <div className="input-field">
                  <label htmlFor="lokDjelovanja">Područje djelovanja *</label>
                  <input
                    type="text"
                    id="lokDjelovanja"
                    name="lokDjelovanja"
                    value={formData.lokDjelovanja}
                    onChange={handleInputChange}
                    className={errors.lokDjelovanja ? 'error' : ''}
                    placeholder="npr. Zagreb, Centar"
                  />
                  {errors.lokDjelovanja && <span className="error-text">{errors.lokDjelovanja}</span>}
                </div>

                <div className="input-field">
                  <label htmlFor="profilFoto">Profilna fotografija</label>
                  <input
                    type="file"
                    id="profilFoto"
                    name="profilFoto"
                    onChange={handleInputChange}
                    accept="image/*"
                  />
                  <small>Dodajte fotografiju za vaš profil (opcionalno)</small>
                </div>
              </div>
            </div>
          )}

          {/* SPECIFIČNI PODACI ZA VLASNIKE */}
          {formData.uloga === 'vlasnik' && (
            <div className="form-section role-specific">
              <h2>🏠 Podaci za vlasnike</h2>
              
              <div className="checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    name="primanjeObavijesti"
                    checked={formData.primanjeObavijesti}
                    onChange={handleInputChange}
                  />
                  Želim primati obavijesti o novim šetačima i promocijama
                </label>
              </div>
              
              <div className="info-box">
                <h4>💡 Nakon registracije moći ćete:</h4>
                <ul>
                  <li>Dodati podatke o vašem psu/psima</li>
                  <li>Tražiti šetače u vašem području</li>
                  <li>Rezervirati šetnje online</li>
                  <li>Ostavljati recenzije šetačima</li>
                </ul>
              </div>
            </div>
          )}

          <button type="submit" className="submit-btn">
            {formData.uloga ? `Registriraj se kao ${formData.uloga === 'setac' ? 'šetač' : 'vlasnik psa'}` : 'Registriraj se'}
          </button>
        </form>

        <div className="login-link">
          Već imate račun? <a href="/login">Prijavite se ovdje</a>
        </div>
      </div>
    </div>
  );
};
