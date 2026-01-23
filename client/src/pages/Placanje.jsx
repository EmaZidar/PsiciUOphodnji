import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderUlogiran from "../components/HeaderUlogiran";
import Footer from "../components/Footer";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import "./Placanje.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const initialOptions = {
    "client-id": "test",
    "disable-funding": "card,credit",
    "buyer-country": "US",
    currency: "EUR",
    "data-page-type": "product-details",
    components: "buttons",
    "data-sdk-integration-source": "developer-studio",
};

function formatDatumHR(datum) {
    if (!datum) return "";

    const d = new Date(datum);

    const dan = String(d.getDate()).padStart(2, "0");
    const mjesec = String(d.getMonth() + 1).padStart(2, "0");
    const godina = d.getFullYear();

    return `${dan}.${mjesec}.${godina}.`;
}

function formatVrijeme(vrijeme) {
    if (!vrijeme) return "";

    return vrijeme.slice(0, 5);
}

export default function Placanje() {
    const navigate = useNavigate();
    const { idrezervacija } = useParams();

    const [rezervacija, setRezervacija] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paid, setPaid] = useState(false);

    /* dohvat rezervacije */
    useEffect(() => {
        async function fetchRezervacija() {
            try {
                const res = await fetch(`${BACKEND_URL}/api/rezervacije/${idrezervacija}`, {
                    credentials: "include",
                });
                if (!res.ok) throw new Error(`Server vratio ${res.status}`);
                const data = await res.json();
                setRezervacija(data);

                if (data.status === "placeno") {
                    setPaid(true);
                }
            } catch (err) {
                setError("Ne mogu dohvatiti rezervaciju.");
            } finally {
                setLoading(false);
            }
        }
        fetchRezervacija();
    }, [idrezervacija]);

    const karticnoPlacanje = rezervacija?.nacinplacanja === "kreditna kartica";

    return (
        <>
            <HeaderUlogiran />

            <div className="placanje-container">
                <h2>Plaćanje</h2>

                <div className="placanje-card">
                    {loading ? (
                        <p>Učitavanje...</p>
                    ) : error ? (
                        <p className="placanje-error">{error}</p>
                    ) : (
                        <>
                            <p>
                                <strong>Datum:</strong>{" "}
                                {formatDatumHR(rezervacija.datum)}
                            </p>
                            <p>
                                <strong>Vrijeme:</strong>{" "}
                                {formatVrijeme(rezervacija.vrijeme)}
                            </p>
                            <p>
                                <strong>Polazište:</strong>{" "}
                                {rezervacija.polaziste}
                            </p>
                            <p>
                                <strong>Način plaćanja:</strong>{" "}
                                {rezervacija.nacinplacanja}
                            </p>
                            <p>
                                <strong>Status:</strong> {rezervacija.status}
                            </p>
                            <p>
                                <strong>Tip šetnje:</strong>{" "}
                                {rezervacija.tipsetnja}
                            </p>
                            <p>
                                <strong>Trajanje:</strong>{" "}
                                {rezervacija.trajanje} minuta
                            </p>
                            {rezervacija.dodnapomene && (
                                <p>
                                    <strong>Dodatne napomene:</strong>{" "}
                                    {rezervacija.dodnapomene}
                                </p>
                            )}
                            <p>
                                <strong>Cijena:</strong> {rezervacija.cijena} EUR
                            </p>
                            <div id="paypal-button-container"></div>
                        </>
                    )}
                </div>

                {!loading && !error && rezervacija && (
                    <div className="placanje-card">
                        {paid && (
                            <div className="placanje-success">
                                <p>
                                    <strong>Plaćeno!</strong>
                                </p>
                                <button
                                    onClick={() => navigate("/main")}
                                    className="placanje-btn primary"
                                >
                                    Povratak
                                </button>
                            </div>
                        )}

                        {!paid && karticnoPlacanje && (
                            <PayPalScriptProvider options={initialOptions}>
                                <PayPalButtons
                                    style={{
                                        shape: "rect",
                                        layout: "vertical",
                                        color: "gold",
                                        label: "paypal",
                                    }}
                                    onApprove={async (data, actions) => {
                                        try {

                                        } catch (error) {
                                            console.error(error);
                                            setMessage(
                                                `Sorry, your transaction could not be processed...${error}`,
                                            );
                                        }
                                    }}
                                />
                            </PayPalScriptProvider>
                        )}

                        {!paid && !karticnoPlacanje && (
                            <div className="placanje-info">
                                <p>
                                    <strong>Plaćanje gotovinom</strong>
                                </p>
                                <p>
                                    Plaćanje se vrši gotovinom nakon odrađene
                                    šetnje.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}
