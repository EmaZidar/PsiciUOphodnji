import "./Korisnici.css";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";

//TODO GUMB ZA BRISANJE + uloga

export default function Korisnici() {
    const [setaci, setSetaci] = useState([]);
    const [vlasnici, setvlasnici] = useState([]);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        // TODO
        // ovo su zasad sam setaci moramo i vlasnike ucigtavat iz baze
        const loadSetaci = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch("/api/setaci", {
                    method: "GET",
                    credentials: "include",
                });
                if (!response.ok)
                    throw new Error(`Server returned ${response.status}`);
                const data = await response.json();
                setSetaci(Array.isArray(data) ? data : (data?.setaci ?? []));
            } catch (err) {
                setError(err.message || "Greška pri dohvaćanju podataka");
                setSetaci([]);
            } finally {
                setLoading(false);
            }
        };

        loadSetaci();
    }, []);

    useEffect(() => {
        const loadvlasnici = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch("/api/vlasnici", {
                    method: "GET",
                    credentials: "include",
                });
                if (!response.ok)
                    throw new Error(`Server returned ${response.status}`);
                const data = await response.json();
                setvlasnici(
                    Array.isArray(data) ? data : (data?.vlasnici ?? []),
                );
                console.log("Podaci iz baze:", data[0]);
            } catch (err) {
                setError(err.message || "Greška pri dohvaćanju podataka");
                setvlasnici([]);
            } finally {
                setLoading(false);
            }
        };

        loadvlasnici();
    }, []);

    function jestelisigurni() {
        setShowDeleteConfirm(true);
    }

    const handleDeleteProfile = async (id) => {
        setDeleting(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/delete/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Greška pri brisanju profila",
                );
            }
        } catch (err) {
            alert("Greška: " + err.message);
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const svikorisnici = [{ ime: "snss", prezime: "dnnncvnf" }];
    return (
        <>
            <div className="admin-header">
                <h1>Upravljanje korisnicima</h1>
            </div>
            <div className="admin-header">
                <h2>Popis svih korisnika: </h2>
            </div>

            <div className="setaci-list">
                {loading && <p>Učitavanje korisnika...</p>}
                {!loading && error && <p className="error-message">{error}</p>}

                <h2>Šetači</h2>
                {!loading &&
                    !error &&
                    setaci.map((setac) => (
                        <article className="setac-card" key={setac.idkorisnik}>
                            <div className="setac-info">
                                <h2 className="setac-name">
                                    {setac.imekorisnik} {setac.prezkorisnik}{" "}
                                    (ID: {setac.idkorisnik} )
                                </h2>
                                <p>
                                    <span>
                                        Lokacija djelovanja:{" "}
                                        {setac.lokdjelovanja}
                                    </span>
                                </p>
                                <p>
                                    <span>Cijena: {setac.cijena} €/sat</span>
                                </p>
                                <p>
                                    <span>Ocjena: {setac.ocjena}/5 ⭐</span>
                                </p>
                                <p>
                                    <span>
                                        Tip članarine: {setac.tipclanarina}
                                    </span>
                                </p>
                            </div>

                            <button onClick={jestelisigurni}>Obriši ga</button>
                            {showDeleteConfirm && (
                                <div className="modal-overlay">
                                    <div className="modal-content">
                                        <h2>Potvrdi brisanje profila</h2>
                                        <p>
                                            Jeste li sigurni da želite obrisati
                                            korisnika?
                                        </p>

                                        <div className="modal-buttons">
                                            <button
                                                onClick={() =>
                                                    setShowDeleteConfirm(false)
                                                }
                                                className="modal-btn modal-btn-cancel"
                                            >
                                                {" "}
                                                Ne
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteProfile(
                                                        setac.idkorisnik,
                                                    )
                                                }
                                                className="modal-btn modal-btn-delete"
                                            >
                                                Da
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </article>
                    ))}

                <h2>Vlasnici</h2>
                {!loading &&
                    !error &&
                    vlasnici.map((vl) => (
                        <article className="setac-card" key={vl.idkorisnik}>
                            <div className="setac-info">
                                <h2 className="setac-name">
                                    {vl.imekorisnik} {vl.prezkorisnik} (ID:{" "}
                                    {vl.idkorisnik})
                                </h2>
                                <p>
                                    <span>
                                        Prima Obavijesti:{" "}
                                        {vl.primanjeobavijesti && "da"}{" "}
                                        {!vl.primanjeobavijesti && "ne"}{" "}
                                    </span>
                                </p>
                                <p>
                                    <span>Telefon: {vl.telefon}</span>
                                </p>
                            </div>

                            <button onClick={jestelisigurni}>Obriši ga</button>
                            {showDeleteConfirm && (
                                <div className="modal-overlay">
                                    <div className="modal-content">
                                        <h2>Potvrdi brisanje profila</h2>
                                        <p>
                                            Jeste li sigurni da želite obrisati
                                            korisnika?
                                        </p>

                                        <div className="modal-buttons">
                                            <button
                                                onClick={() =>
                                                    setShowDeleteConfirm(false)
                                                }
                                                className="modal-btn modal-btn-cancel"
                                            >
                                                {" "}
                                                Ne
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteProfile(
                                                        vl.idkorisnik,
                                                    )
                                                }
                                                className="modal-btn modal-btn-delete"
                                            >
                                                Da
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </article>
                    ))}
            </div>
        </>
    );
}
