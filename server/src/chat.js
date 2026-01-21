import express from 'express'
import * as dotenv from "dotenv"
dotenv.config()

export const router = express.Router()

function checkIsAuthenticated(req, res, next) {
    if (req.session.user)
        return next();
    return res.status(401).json({ error: 'Not authenticated' });
}

// GET /api/chats
// TODO: Dohvatiti idkorisnik prijavljenog korisnika
// Dohvatiti sve rezervacije gdje je korisnik vlasnik ili šetač
//  Za svaku rezervaciju:
//  odrediti drugog sudionika chata
// mapirati podatke (idRezervacija, idSetnja, otherId, otherName, otherProfilFoto(ako je other setac), tipSetnja, datum, vrijeme)
// Sortirati chatove po datumu i vremenu, mislim da cak ne morate jer sam stavila da se sorta po vremenu pa sad da znate
//  Vratiti listu chatova kao JSON

router.get('/', checkIsAuthenticated, async (req, res) => {
    
});

// GET api/chats/:idrezervacija/messages 
//  Dohvatiti idRezervacija iz params
//  Dohvatiti idkorisnik prijavljenog korisnika
//  Provjeriti postoji li rezervacija
//  Provjeriti da je korisnik sudionik rezervacije
//  Dohvatiti sve poruke za rezervaciju
//  Sortirati poruke po vrijemeSlanja ASC
//  Vratiti poruke kao JSON
// trebat ces nac tocno kak se zovu polja u tablicama iz fronta u ChatWindow.jsx

// POST /api/chats/:idrezervacija/messages ---
//  Dohvatiti idRezervacija iz params
//  Dohvatiti tekst poruke iz body-ja
//  Dohvatiti idkorisnik prijavljenog korisnika
//  Provjeriti postoji li rezervacija
//  Provjeriti da je korisnik sudionik rezervacije
//  Spremiti poruku u bazu (vrijemeSlanja = NOW())
//  Vratiti kreiranu poruku kao JSON