import React, { useEffect, useState } from "react";
import "./MojeSetnje.css";
import React, { useEffect, useState } from "react";
import "./MojeSetnje.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

function formatDatumHR(datum) {
    if (!datum) return "";
    const d = new Date(datum);
    if (isNaN(d)) return datum;
    const dan = String(d.getDate()).padStart(2, "0");
    const mjesec = String(d.getMonth() + 1).padStart(2, "0");
    const godina = d.getFullYear();
    return `${dan}.${mjesec}.${godina}.`;
}

function formatVrijeme(vrijeme) {
  if (!vrijeme) return '';

  return vrijeme.slice(0, 5);
}
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

function formatDatumHR(datum) {
    if (!datum) return "";
    const d = new Date(datum);
    if (isNaN(d)) return datum;
    const dan = String(d.getDate()).padStart(2, "0");
    const mjesec = String(d.getMonth() + 1).padStart(2, "0");
    const godina = d.getFullYear();
    return `${dan}.${mjesec}.${godina}.`;
}

function formatVrijeme(vrijeme) {
  if (!vrijeme) return '';

  return vrijeme.slice(0, 5);
}

export default function MojeSetnje() {
export default function MojeSetnje() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [prosleSetnje, setprosle] = useState([]);
    const [buduceSetnje, setbuduce] = useState([]);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [prosleSetnje, setprosle] = useState([]);
    const [buduceSetnje, setbuduce] = useState([]);

    useEffect(() => {
        const API = `${BACKEND_URL}/api/me`;
        fetch(API, { credentials: "include" })
            .then((r) => {
                if (!r.ok) throw new Error("Not authenticated");
    useEffect(() => {
        const API = `${BACKEND_URL}/api/me`;
        fetch(API, { credentials: "include" })
            .then((r) => {
                if (!r.ok) throw new Error("Not authenticated");
                return r.json();
            })
            .then((data) => {
                setUser(data.user ?? data.session ?? null);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    async function loadProsleSetnje(userId) {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${BACKEND_URL}/api/prosleSetnje/${userId}`, {
                method: "GET",
                credentials: "include",
            });
            if (!response.ok) throw new Error(`Server returned ${response.status}`);
            const data = await response.json();
            setprosle(Array.isArray(data) ? data : (data?.prosleSetnje ?? data?.proslesetnje ?? []));
        } catch (err) {
            setError(err.message || "Greška pri dohvaćanju podataka");
            setprosle([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!user || !user.idkorisnik) return;
        loadProsleSetnje(user.idkorisnik);
    }, [user]);

    async function loadBuduceSetnje(userId) {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${BACKEND_URL}/api/buduceSetnje/${userId}`, {
                method: "GET",
                credentials: "include",
            });
            if (!response.ok) throw new Error(`Server returned ${response.status}`);
            const data = await response.json();
            setbuduce(Array.isArray(data) ? data : (data?.buduceSetnje ?? data?.buducesetnje ?? []));
        } catch (err) {
            setError(err.message || "Greška pri dohvaćanju podataka");
            setbuduce([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!user || !user.idkorisnik) return;
        loadBuduceSetnje(user.idkorisnik);
    }, [user]);

    const njegoveProsleSetnje = prosleSetnje || [
        { datum: "nema" },
        { datum: "1.1.2000.", recenzija: "-" },
    ];
    const njegoveBuduceSetnje = buduceSetnje || [
        { datum: "nema" },
        { datum: "1.1.2026.", otakazan: "0" },
    ];

    const [prikaziFormu, setPrikaziFormu] = useState(false);

    const [recenzija, setrecenzija] = useState({
        fotografija: "",
        idRezervacija: "",
        idRecenzija: "",
        ocjena: "",
        tekst: "",
    });

    function spremi(e) {
        setrecenzija({
            ...recenzija,
            [e.target.name]: e.target.value,
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        let id = recenzija.idRezervacija ?? recenzija.idrezervacija;
        if (!id) {
            try {
                const el = document.querySelector('form.formazarecenziju input[name="idRezervacija"]');
                if (el && el.value) id = el.value;
            } catch (err) {
                console.warn('Could not read hidden idRezervacija input:', err);
            }
        }
        if (!id) {
            alert('Neodređena rezervacija — pokušaj ponovno otvoriti formu putem "Ostavi recenziju"');
            return;
        }
        const payload = { ...recenzija, idRezervacija: Number(id) };

        fetch(`${BACKEND_URL}/recenzija`, {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then(async (res) => {
                if (res.status === 201) {
                    if (user && user.idkorisnik) await loadProsleSetnje(user.idkorisnik);
                    setPrikaziFormu(false);
                } else {
                    const body = await res.json().catch(() => ({}));
                    alert('Greška pri slanju recenzije: ' + (body?.error || `Server returned ${res.status}`));
                }
            })
            .catch((err) => alert('Greška pri slanju recenzije: ' + (err.message || err)));
    }

    function odustani() {
        setPrikaziFormu(false);
    }

    function odustani() {
        setPrikaziFormu(false);
        setrecenzija({
            fotografija: "",
            idRezervacija: "",
            idRecenzija: "",
            ocjena: "",
            tekst: "",
        });
        setImagePreview(null);
        setSelectedImage(null);
    }

    function resetiraj(e) {
        e.preventDefault();
        setrecenzija({
            fotografija: "",
            idRezervacija: "",
            idRecenzija: "",
            ocjena: "",
            tekst: "",
        });
        setImagePreview(null);
        setSelectedImage(null);
    }

    function izbrisi(idRezervacija) {
        fetch(`${BACKEND_URL}/api/delete/rezervacija/${idRezervacija}`, {
            method: "DELETE",
        }).then((res) => {
            if (res.ok) {
                setbuduce((prev) =>
                    prev.filter(
                        (setnja) => setnja.idrezervacija !== idRezervacija,
                    ),
                );
            }
        });
    }

    async function zavrsi(idRezervacija) {
        try {
            const res = await fetch(`${BACKEND_URL}/api/rezervacija/${idRezervacija}/zavrsi`, {
                method: 'PATCH',
                credentials: 'include',
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error || 'Neuspjelo završavanje šetnje');
            }
            if (user && user.idkorisnik) {
                await loadProsleSetnje(user.idkorisnik);
                await loadBuduceSetnje(user.idkorisnik);
            }
        } catch (err) {
            alert('Greška: ' + (err.message || 'Neuspjelo'));
        }
    }

    const handleImageUpload = async () => {
        if (!selectedImage) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("profileImage", selectedImage);
        setUploading(true);
        const formData = new FormData();
        formData.append("profileImage", selectedImage);

        try {
            const response = await fetch(
                `${BACKEND_URL}/api/upload-profile-image`,
                {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                },
            );

            if (!response.ok) throw new Error("Greška pri učitavanju slike");

            const data = await response.json();
            if (data?.user) {
                setUser(data.user);
            } else {
                const userResponse = await fetch(`${BACKEND_URL}/api/me`, {
                    credentials: "include",
                });
                const userData = await userResponse.json();
                setUser(userData.user ?? userData.session ?? null);
            }
            setImagePreview(null);
            setSelectedImage(null);
            alert("Slika uspješno učitana!");
        } catch (err) {
            alert("Greška: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (
            file &&
            (file.type === "image/jpeg" ||
                file.type === "image/jpg" ||
                file.type === "image/png")
        ) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            alert("Molimo odaberite JPG, JPEG ili PNG datoteku");
        }
    };

    return (
        <>
            <div className="basSveSetnje">
                <div className="sveSetnje">
                    <h2>Moje prošle šetnje:</h2>

                    {loading ? (
                        <p>Učitavanje...</p>
                    ) : prosleSetnje.length === 0 ? (
                        <div className="emptyState">
                            Još niste imali šetnju — rezervirajte jednu.
                        </div>
                    ) : (
                        <div className="ms-grid">
                            {prosleSetnje.map((setnja) => (
                                <div
                                    className="jednaSetnja ms-kartica"
                                    key={setnja.idRezervacija || setnja.datum}
                                >
                                    <h3 className="ms-naslov">Šetnja</h3>
                                    <div className="ms-meta">
                                        <p>
                                            Datum: {formatDatumHR(setnja.datum)}
                                            <br />
                                            Vrijeme: {formatVrijeme(setnja.vrijeme)}
                                        </p>
                                        <p>Recenzija: {setnja.recenzija}</p>
                                    </div>
                                    {setnja.status === 'odradeno' && (
                                        <button
                                            onClick={() => {
                                                const id = setnja.idRezervacija ?? setnja.idrezervacija ?? (setnja.idrezervacija?.toString && setnja.idrezervacija.toString());
                                                console.log('Opening review form for reservation id:', id, setnja);
                                                setrecenzija((r) => ({ ...r, idRezervacija: id }));
                                                setPrikaziFormu(true);
                                            }}
                                        >
                                            Ostavi recenziju
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {prikaziFormu && (
                        <form
                            onSubmit={handleSubmit}
                            className="formazarecenziju"
                        >
                            <input type="hidden" name="idRezervacija" value={recenzija.idRezervacija || ''} />
                            <label>Opis: </label>
                            <input
                                type="text"
                                id="tekst"
                                name="tekst"
                                maxLength={500}
                                value={recenzija.tekst}
                                onChange={spremi}
                            ></input>
                            <br></br>

                            <label>Ocjena: </label>
                            <input
                                type="number"
                                required
                                id="ocjena"
                                name="ocjena"
                                value={recenzija.ocjena}
                                max={5}
                                onChange={spremi}
                            ></input>
                            <br></br>

                            <div>
                                <label>Dodajte sliku: </label>
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    onChange={handleImageSelect}
                                    value={recenzija.fotografija}
                                />{" "}
                            </div>

                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    style={{
                                        width: "201px",
                                        marginTop: "10px",
                                    }}
                                />
                            )}

                            {selectedImage && (
                                <div>
                                    <button
                                        onClick={handleImageUpload}
                                        disabled={uploading}
                                    >
                                        Odaberi sliku
                                    </button>
                                </div>
                            )}

                            <div>
                                <button type="submit">Ostavi recenziju</button>
                                <button onClick={resetiraj}>Resetiraj</button>
                                <button onClick={odustani}>Odustani</button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="sveSetnje">
                    <h2>Moje buduće šetnje:</h2>

                    <div className="ms-grid">
                        {njegoveBuduceSetnje.map((setnja) => (
                            <div
                                className="jednaSetnja ms-kartica"
                                key={setnja.idrezervacija || setnja.datum}
                            >
                                <h3 className="ms-naslov">Šetnja</h3>
                                <div className="ms-meta">
                                    <p>
                                        Zakazana: {formatDatumHR(setnja.datum)} {formatVrijeme(setnja.vrijeme)}
                                    </p>
                                </div>
                                <div className="ms-actions">
                                    <button
                                        className="ms-otkazi"
                                        onClick={() =>
                                            izbrisi(setnja.idrezervacija)
                                        }
                                    >
                                        Otkaži
                                    </button>
                                    {(user && (user.uloga === 'vlasnik' || user.role === 'vlasnik')) && (
                                        <button
                                            className="ms-zavrsi"
                                            onClick={() => zavrsi(setnja.idrezervacija)}
                                        >
                                            Završi šetnju
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
