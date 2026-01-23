import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./style.css";

// obavi reload stranice ako je ucitana iz bfcache (back-forward cache) da bi se prikazala ispravna poruka o isteku sesije
window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
        window.location.reload();
    }
});

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
        <App />
);