import React, { useEffect, useState } from "react";
import "./Psi.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

export default function Psi() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [psi, setpsi] = useState([]);

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

    useEffect(() => {
        const loadpsi = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${BACKEND_URL}/api/psi`, {
                    method: "GET",
                    credentials: "include",
                });
                if (!response.ok)
                    throw new Error(`Server returned ${response.status}`);
                const data = await response.json();
                const psiList = Array.isArray(data) ? data : (data?.psi ?? []);
                const normalizedPsi = psiList.map(p => ({
                    idPas: p.idpas,
                    imePas: p.imepas,
                    pasmina: p.pasmina,
                    starost: p.starost,
                    socijalizacija: p.socijalizacija,
                    zdravNapomene:  p.zdravnapomene,
                    razinaEnergije:  p.razinaenergije,
                    idKorisnik: p.idkorisnik
                }));
                setpsi(normalizedPsi);
            } catch (err) {
                setError(err.message || "Greška pri dohvaćanju podataka");
                setpsi([]);
            } finally {
                setLoading(false);
            }
        };

        loadpsi();
    }, []);

    const idKorisnik = user?.idkorisnik || "";
    const njegoviPsi = psi;

    const [prikaziFormu, setPrikaziFormu] = useState(false);

    const [pas, setPas] = useState({
        imePas: "",
        pasmina: "",
        starost: "",
        razinaEnergije: "",
        zdravNapomene: "",
        socijalizacija: "",
    });

    function spremi(e) {
        setPas({
            ...pas,
            [e.target.name]: e.target.value,
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const kojiPas = { ...pas, idKorisnik: idKorisnik };
        try {
            const response = await fetch(`${BACKEND_URL}/api/psi`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(kojiPas),
            });
            const data = await response.json();
            console.log("Created dog with ID:", data.idPas);
            if (data.pas) {
                const p = data.pas;
                const newPas = {
                    idPas:  p.idpas,
                    imePas:  p.imepas,
                    pasmina: p.pasmina,
                    starost: p.starost,
                    socijalizacija: p.socijalizacija,
                    zdravNapomene:  p.zdravnapomene,
                    razinaEnergije: p.razinaenergije,
                    idKorisnik: p.idkorisnik
                };
                setpsi(prevPsi => [...prevPsi, newPas]);
            }
            setPrikaziFormu(false);
            setPas({
                imePas: "",
                pasmina: "",
                starost: "",
                razinaEnergije: "",
                zdravNapomene: "",
                socijalizacija: "",
            });
        } catch (error) {
            console.error("Error creating dog:", error);
        }
    }

    function odustani() {
        setPrikaziFormu(false);
        setPas({
            imePas: "",
            pasmina: "",
            starost: "",
            razinaEnergije: "",
            zdravNapomene: "",
            socijalizacija: "",
        });
    }


    useEffect(() => {
        if (!prikaziFormu) return;
        const onKey = (e) => {
            if (e.key === "Escape") odustani();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [prikaziFormu]);

    function resetiraj(e) {
        e.preventDefault();
        setPas({
            imePas: "",
            pasmina: "",
            starost: "",
            razinaEnergije: "",
            zdravNapomene: "",
            socijalizacija: "",
        });
    }

    async function izbrisi(idPas) {
        console.log("brisem psa s idom:", idPas);
        try {
            await fetch(`${BACKEND_URL}/api/psi/${idPas}`, {
                method: "DELETE",
                credentials: "include",
            });
            setpsi(prevPsi => prevPsi.filter(p => p.idPas !== idPas));
        } catch (error) {
            console.error("Error deleting dog:", error);
        }
    }

    return (
        <div className="psiContainer">
          <div className="sviPsi">
            {njegoviPsi.map((pas) => (
                <div key={pas.idPas} className="jedanPas">
                    <h3 className="imePsa">{pas.imePas || "-"}</h3>
                    <p>Pasmina: {pas.pasmina || "-"}</p>
                    <p>Godine: {pas.starost || "-"}</p>
                    <p>
                        Socijalizacija sa psima: {pas.socijalizacija || "-"}
                    </p>
                    <p>Zdravstvene napomene: {pas.zdravNapomene || "-"}</p>
                    <p>Razina energije: {pas.razinaEnergije || "-"}</p>

                    <button onClick={() => izbrisi(pas.idPas)}>Izbriši psa</button>

                  </div>))}
              <div className="dodajP">
                    <button onClick={() => setPrikaziFormu(true)}>+</button>
         </div>
              </div>
         {prikaziFormu && (
            <div className="modalOverlay" onClick={odustani}>
                <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                    <form onSubmit={handleSubmit} className="dodajPsa">
            <div className="formField">
                <label>Ime psa:</label>
                <input type="text" id="imePas" name="imePas" required value={pas.imePas} maxLength={50} onChange={spremi} />
            </div>
            <div className="formField">
                <label>Pasmina:</label>
                <input type="text" id="pasmina" name="pasmina" required value={pas.pasmina} maxLength={50} onChange={spremi} />
            </div>
            <div className="formField">
                <label>Godine:</label>
                <input type="number" id="starost" required name="starost" value={pas.starost} min={0} max={20} onChange={spremi} />
            </div>
            <div className="formField">
                <label>Razina energije:</label>
                <input type="number" id="razinaEnergije" name="razinaEnergije" min={1} max={5} required value={pas.razinaEnergije} onChange={spremi} />
            </div>
            <div className="formField">
                <label>Socijalizacija:</label>
                <input type="number" id="socijalizacija" required name="socijalizacija" min={1} max={5} value={pas.socijalizacija} onChange={spremi} />
            </div>
            <div className="formField">
                <label>Zdravstvene napomene:</label>
                <input type="text" id="zdravNapomene" name="zdravNapomene" maxLength={500} value={pas.zdravNapomene} onChange={spremi} />
            </div>

                    <button type="submit">Dodaj psa</button>
                    <button type="button" onClick={resetiraj}>Resetiraj</button>
                    <button type="button" onClick={odustani}>Odustani</button>
                    </form>
                </div>
            </div>
        )}
        </div>
    );
}
