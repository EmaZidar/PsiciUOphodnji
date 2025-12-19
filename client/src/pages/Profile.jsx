import React, { useEffect, useState } from 'react';
import HeaderUlogiran from '../components/HeaderUlogiran';
import Footer from '../components/Footer';
import './Profile.css';
//skroz na dnu returna treba dodat <Footer/> ako ce ovo bit finalna stranica za setaca
export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Fetch session + DB user info from server
    const API = 'http://localhost:8000/api/me';
    fetch(API, { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error('Not authenticated');
        return r.json();
      })
      .then((data) => {
        // Prefer DB user (user) then session
        setUser(data.user ?? data.session ?? null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
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
      // Use updated user returned by the server (avoids refresh/race conditions)
      if (data?.user) {
        setUser(data.user);
      } else {
        // Fallback: re-fetch user data if not provided
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
      const response = await fetch('http://localhost:8000/api/delete-profile', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Greška pri brisanju profila');
      }

      alert('Profil je uspješno obrisan. Preusmjeravamo vas na početnu stranicu...');
      window.location.href = 'http://localhost:5173/';
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
            // Helper to pick the first existing field from several possible DB/Google names
            const pick = (obj, keys) => {
              if (!obj) return undefined;
              for (const k of keys) {
                if (typeof obj[k] !== 'undefined' && obj[k] !== null && String(obj[k]).trim() !== '') return obj[k];
              }
              return undefined;
            };

            const avatarFromUser =
              pick(user, ['profileFoto', 'profilFoto', 'profileFoto', 'avatar', 'profil', 'profilfoto']);
            const avatarFromRole =
              pick(user?.roleData, ['profileFoto', 'profilFoto', 'profileFoto', 'avatar', 'profil', 'profilfoto']);
            const avatarSrc = avatarFromUser || avatarFromRole || '/images/profile.png';
            const fullAvatarSrc = avatarSrc.startsWith('/uploads/') 
              ? `http://localhost:8000${avatarSrc}` 
              : avatarSrc;


            const firstName = pick(user, ['imeKorisnik', 'imekorisnik', 'imeKorisnik', 'ime', 'name', 'given_name']) || '';
            const lastName = pick(user, ['prezKorisnik', 'prezkorisnik', 'prezime', 'prezKorisnik', 'surname', 'family_name']) || '';

            return (
              <section className="profile-container">
                <div className="profile-avatar-wrapper">
                  <img src={imagePreview || fullAvatarSrc} alt="Profilna fotografija" className="profile-avatar" />
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
            );
          })()
        )}

        {!loading && !error && !user && (
          <p>Nema dostupnih podataka za korisnika.</p>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Potvrdi brisanje profila</h2>
            <p>Jeste li sigurni da želite obrisati svoj profil? Ova akcija se ne može vratiti.</p>
            
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
