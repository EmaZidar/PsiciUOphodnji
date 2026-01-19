import React, { useEffect, useState } from 'react';
import HeaderUlogiran from '../components/HeaderUlogiran';
import './Profile.css';


export default function PodatciVlasnika() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const API = 'http://localhost:8000/api/me';
    fetch(API, { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error('Nije authenticated');
        return r.json();
      })
      .then((data) => {
        setUser(data.user ?? data.session ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('gresla', err);
        setUser(null);
        setLoading(false);
      });
  }, []);

  
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Molimo odaberite JPG, JPEG ili PNG datoteku');
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('profileImage', selectedImage);

    try {
      const response = await fetch('http://localhost:8000/api/upload-profile-image', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) throw new Error('Greška pri učitavanju slike');

      const data = await response.json();
      if (data?.user) {
        setUser(data.user);
      } else {
        const userResponse = await fetch('http://localhost:8000/api/me', { credentials: 'include' });
        const userData = await userResponse.json();
        setUser(userData.user ?? userData.session ?? null);
      }
      setImagePreview(null);
      setSelectedImage(null);
      alert('Slika uspješno učitana!');
    } catch (err) {
      alert('Greška: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // dio sa brisanjem profila
  const handleDeleteProfile = async () => {
    setDeleting(true);
    try {
      const response = await fetch('/api/delete-profile', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Greška pri brisanju profila');
      }

      alert('Profil je uspješno obrisan');
      window.location.href = process.env.REACT_APP_URL || 'http://localhost:5173';
    } catch (err) {
      alert('Greška: ' + err.message);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <HeaderUlogiran />
      <main className="profile-main" style={{ padding: '32px 18px' }}>
        <h1>Pregled profila</h1>
        {loading && <p>Učitavanje...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && user && (
          (() => {
            const pick = (obj, keys) => {
              if (!obj) return undefined;
              for (const k of keys) {
                if (typeof obj[k] !== 'undefined' && obj[k] !== null && String(obj[k]).trim() !== '') return obj[k];
              }
              return undefined;
            };

            ///???
            const avatarFromUser =
              pick(user, ['profileFoto', 'avatar', 'profil', 'profilfoto']);
            const avatarFromRole =
              pick(user?.roleData, ['profileFoto', 'profilFoto', 'profileFoto', 'avatar', 'profil', 'profilfoto']);
            const defaultImage = new URL('/images/profile.png', import.meta.url).href;
            const avatarSrc = avatarFromUser || avatarFromRole || defaultImage;
            const fullAvatarSrc = (typeof avatarSrc === 'string' && avatarSrc.startsWith('/uploads/'))
              ? `http://localhost:8000${avatarSrc}`
              : avatarSrc;


            const firstName = pick(user, ['imeKorisnik', 'ime']) || '';
            const lastName = pick(user, ['prezKorisnik','prezime']) || '';

            return (
              <>
                <section className="profile-container">
                <div className="profile-avatar-wrapper">
                  <img
                    src={imagePreview || fullAvatarSrc}
                    alt="Profilna fotografija"
                    className="profile-avatar"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultImage; }}
                  />
                  <div className="profile-image-upload">
                    <input
                      type="file"
                      id="profileImageInput"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="profileImageInput" className="upload-btn">
                      Odaberi sliku
                    </label>
                    {selectedImage && (
                      <button onClick={handleImageUpload} disabled={uploading} className="save-btn">
                        {uploading ? 'Učitavanje...' : 'Spremi sliku'}
                      </button>
                    )}
                  </div>

                                  </div>


                <div className="profile-details">
                  <div className="profile-info-box">
                    <div className="profile-row"><strong>Ime:</strong> {firstName || '—'}</div>
                    <div className="profile-row"><strong>Prezime:</strong> {lastName || '—'}</div>
                    <div className="profile-row"><strong>Email:</strong> {user.email ?? '—'}</div>
                    <div className="profile-row"><strong>Telefon:</strong> {user.telefon ?? user.phone ?? '—'}</div>
                    <div className="profile-row"><strong>Uloga:</strong> {user.role ?? '—'}</div>
                  </div>

                  <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #ddd' }}>
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="delete-btn"
                    >
                      Obriši profil
                    </button>
                  </div>
                </div>
                </section>

                  
              </>
            );
          })()
        )}

        {!loading && !error && !user && (
          <p>Nema podataka za korisnika.</p>
        )}
      </main>

      {/*  */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Potvrdi brisanje profila</h2>
            <p>Jeste li sigurni da želite obrisati svoj profil? </p>
            
            <div className="modal-buttons">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="modal-btn modal-btn-cancel"
              >
                Ne
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={deleting}
                className="modal-btn modal-btn-delete"
              >
                {deleting ? 'Brišem...' : 'Da'}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
