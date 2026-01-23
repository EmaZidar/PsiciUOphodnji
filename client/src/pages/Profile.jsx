import React, { useEffect, useState , useMemo} from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderUlogiran from '../components/HeaderUlogiran';
import Footer from '../components/Footer';
import Reviews from '../components/Reviews';
import './Profile.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

// preview slike prije slanja na backend
function buildUploadPreview(file) {
  return URL.createObjectURL(file);
}

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const [rating, setRating] = useState({ukOcjena: null, brojRecenzija: 0});
  const [ratingLoading, setRatingLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    imekorisnik: "",
    prezkorisnik: "",
    email: "",
    telefon: "",
    lokdjelovanja: "",
  });

  const imagePreviewUrl = useMemo(() => {
    if (!selectedImage) return null;
    return buildUploadPreview(selectedImage);
  }, [selectedImage]);
  

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${BACKEND_URL}/api/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Nije authenticated");

        const data = await res.json();
        if (!cancelled) setUser(data.user);
      } catch (e) {
        if (!cancelled) {
          setUser(null);
          setError(e?.message || "Greška pri dohvaćanju profila");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    setForm({
      imekorisnik: user.imekorisnik ?? "",
      prezkorisnik: user.prezkorisnik ?? "",
      email: user.email ?? "",
      telefon: user.telefon ?? "",
      lokdjelovanja: user.roleData?.lokdjelovanja ?? "",
    });
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    if (!user?.idkorisnik) return;

    async function loadRatingSummary() {
      try {
        setRatingLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/setaci/${user.idkorisnik}/rating-summary`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Greška pri dohvaćanju sažetka ocjena");

        const data = await res.json();
        if (!cancelled) {
          setRating({
            ukOcjena: data.ukocjena ?? null,
            brojRecenzija: data.brojrecenzija ?? 0,
          });
        }
      } catch {
        if (!cancelled) setRating({ ukOcjena: null, brojRecenzija: 0 });
      } finally {
        if (!cancelled) setRatingLoading(false);
      }
    }

    loadRatingSummary();
    return () => {
      cancelled = true;
    };
  }, [user?.idkorisnik])

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    }
  }, [imagePreviewUrl]);

  function handleImageSelect(e) {
    const file = e.target.files[0] ?? null;
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setError("Molimo odaberite JPG/JPEG ili PNG datoteku.");
      setSelectedImage(null);
      return;
    }

    setError("");
    setSelectedImage(file);
  }

  async function handleImageUpload() {
    if (!selectedImage) return;

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("profilfoto", selectedImage);

      const res = await fetch(`${BACKEND_URL}/api/me/profile-image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Greška pri učitavanju slike");
      }

      const data = await res.json();
      setUser(data.user);
      setSelectedImage(null);
    } catch (e) {
      setError(e?.message || "Greška pri uploadu slike");
    } finally {
      setUploading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleEdit() {
    setError("");
    setIsEditing(true);
  }

  function handleCancel() {
    setError("");
    setForm({
      imekorisnik: user?.imekorisnik ?? "",
      prezkorisnik: user?.prezkorisnik ?? "",
      email: user?.email ?? "",
      telefon: user?.telefon ?? "",
      lokdjelovanja: user?.roleData?.lokdjelovanja ?? "",
    });
    setIsEditing(false);
  }

  async function handleSave() {
    try {
      setError("");

      const payload = {
        imekorisnik: form.imekorisnik,
        prezkorisnik: form.prezkorisnik,
        email: form.email,
        telefon: form.telefon,
        lokdjelovanja: form.lokdjelovanja, 
      };

      const res = await fetch(`${BACKEND_URL}/api/me`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Spremanje nije uspjelo");
      }

      const data = await res.json();
      setUser(data.user ?? data);
      setIsEditing(false);
    } catch (e) {
      setError(e?.message || "Greška pri spremanju");
    }
  }

  // dio sa brisanjem profila
  async function handleDeleteProfile() {
    const ok = window.confirm("Jeste sigurni da želite obrisati profil?");
    if (!ok) return;

    try {
      setError("");
      const res = await fetch(`${BACKEND_URL}/api/delete-profile`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Greška pri brisanju profila");
      }

      window.location.href = process.env.REACT_APP_URL || 'http://localhost:5173';
    } catch (e) {
      setError(e?.message || "Greška pri brisanju profila");
    }
  }

  const defaultImage = new URL('/images/profile.png', import.meta.url).href;
  const avatarSrc = imagePreviewUrl || (user?.roleData?.profilfoto ? `${BACKEND_URL}${user.roleData.profilfoto}` : defaultImage);

  return (
    <>
      <HeaderUlogiran />
      <main className="profile-main">
        <h1>Pregled profila</h1>

        {loading && <p>Učitavanje...</p>}
        {!loading && error && <p className="error-message">{error}</p>}

        {!loading && !error && user && (
          <>
            <section className="profile-container">
              <div className="profile-avatar-wrapper">
                <img src={avatarSrc} alt="Profilna fotografija" className="profile-avatar"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultImage; }} />

                <div className="profile-image-upload">
                  <input type="file" id="profileImageInput" accept="image/jpeg, image/jpg, image/png" onChange={handleImageSelect} />
                  <label htmlFor="profileImageInput" className="profile-upload-button">
                    Odaberi sliku
                  </label>
                  {selectedImage && (
                    <button onClick={handleImageUpload} disabled={uploading} className="save-button">
                      {uploading ? 'Učitavanje...' : 'Spremi sliku'}
                    </button>
                  )}
                  <button className="upload-btn">Plati članarinu</button>
                </div>

                <div className="profile-rating">
                  <div className="rating-value">
                    {ratingLoading ? (
                      <span>Učitavanje ocjene…</span>
                    ) : rating.ukOcjena ? (
                      <span>
                        {rating.ukOcjena}/5 ⭐ ({rating.brojRecenzija} recenzija)
                      </span>
                    ) : (
                      <span>Još nema recenzija</span>
                    )}
                  </div>
                  <div className="rating-count">{rating.brojRecenzija} recenzija</div>
                </div>
              </div>

              <div className="profile-details">
                <div className="profile-info-box">
                  <div className="profile-row">
                    <strong>Ime:</strong>{" "}
                    {isEditing ? (
                      <input type="text" name="imekorisnik" value={form.imekorisnik} onChange={handleChange} className="profile-input"/>
                    ) : (
                      user.imekorisnik || '—'
                    )}
                  </div>
                  <div className="profile-row">
                    <strong>Prezime:</strong>{" "}
                    {isEditing ? (
                      <input type="text" name="prezkorisnik" value={form.prezkorisnik} onChange={handleChange} className="profile-input"/>
                    ) : (
                      user.prezkorisnik || '—'
                    )}
                  </div>
                  <div className="profile-row">
                    <strong>Email:</strong>{" "}
                    {isEditing ? (
                      <input type="email" name="email" value={form.email} onChange={handleChange} className="profile-input"/>
                    ) : (
                      user.email || '—'
                    )}
                  </div>
                  <div className="profile-row">
                    <strong>Telefon:</strong>{" "}
                    {isEditing ? (
                      <input type="tel" name="telefon" value={form.telefon} onChange={handleChange} className="profile-input"/>
                    ) : (
                      user.telefon || '—'
                    )}
                  </div>
                  <div className="profile-row">
                    <strong>Lokacija djelovanja:</strong>{" "}
                    {isEditing ? (
                      <input type="text" name="lokdjelovanja" value={form.lokdjelovanja} onChange={handleChange} className="profile-input"/>
                    ) : (
                      user.roleData.lokdjelovanja || '—'
                    )}
                  </div>
                  <div className="profile-row"><strong>Tip članarine:</strong> {user.roleData.tipclanarina || '—'}</div>
                </div>

                <div className="profile-actions">
                  {!isEditing ? (
                    <button onClick={handleEdit} className="save-button">
                      Uredi
                    </button>
                  ) : (
                    <>
                      <button onClick={handleSave} className="save-button">
                        Spremi
                      </button>
                      <button onClick={handleCancel} className="delete-btn">
                        Odustani
                      </button>
                    </>
                  )}
                  <button onClick={handleDeleteProfile} className="delete-btn">
                    Obriši profil
                  </button>
                </div>
              </div>
            </section>
            <Reviews targetUserId={user.idkorisnik} />
          </>
        )}

        {!loading && !error && !user && (
          <p>Nema podataka za korisnika.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
