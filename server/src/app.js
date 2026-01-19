import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import session from "express-session";
import fetch from "node-fetch";
import * as db from "./db.js";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import * as calendar from "./calendar.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

db.testConnection();

const app = express();
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from public directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Samo JPG, JPEG i PNG slike su dozvoljene!'));
    }
});

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.use(
    session({
        secret: "Rainbow feline",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 4, // 4 sata
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        },
    })
);

const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_ACCESS_TOKEN_URL = process.env.GOOGLE_ACCESS_TOKEN_URL;

const GOOGLE_CALLBACK_URL = "http://localhost:8000/google/callback";
const GOOGLE_OAUTH_SCOPES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    'https://www.googleapis.com/auth/calendar.events',
];

app.get("/login/auth", async (_req, res) => {
    const state = "some_state";

    const encodedScopes = GOOGLE_OAUTH_SCOPES.map((scope) =>
        encodeURIComponent(scope)
    ).join(" ");
    const encodedCallback = encodeURIComponent(GOOGLE_CALLBACK_URL);

    const GOOGLE_OAUTH_CONSENT_SCREEN_URL =
        `${GOOGLE_OAUTH_URL}?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodedCallback}&` +
        `access_type=offline&` +
        `response_type=code&` +
        `state=${state}&` +
        `scope=${encodedScopes}`;

    console.log("Redirecting to:", GOOGLE_OAUTH_CONSENT_SCREEN_URL);
    res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL);
});

app.get("/google/callback", async (req, res) => {
    console.log("Callback received:", req.query);
    const { code } = req.query;

    const data = {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
    };

    console.log("Exchanging code for token:", data);

    try {
        const response = await fetch(GOOGLE_ACCESS_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const access_token_data = await response.json();
        console.log("Token response:", access_token_data);

        const { id_token } = access_token_data;

        const token_info_response = await fetch(
            `${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`
        );
        const token_info_data = await token_info_response.json();
        const { email, name } = token_info_data;

        req.session.user = { email: email, name: name, token: access_token_data };

        const existingUser = await db.findUserByEmail(email);
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

        if (!existingUser) {
            console.log("User doesn't exist");
            // Ako user ne postoji salje email i name u front za daljnju obradu
            res.redirect(
                `${clientUrl}/register?email=${encodeURIComponent(
                    email
                )}&name=${encodeURIComponent(name)}`
            );
        } else {
            // Dohvati ulogu korisnika preko id
            const userId = existingUser.idkorisnik ?? existingUser.idKorisnik ?? existingUser.id ?? existingUser.id_korisnik;
            const userWithRole = await db.getUserWithRole(userId);
            const role = userWithRole?.role ?? "unassigned";
            req.session.user = userWithRole;
            res.redirect(`${clientUrl}/main?role=${encodeURIComponent(role)}`);
        }
    } catch (error) {
        console.error("Error in callback:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/api/register', (req, res) => {
  console.log("registering....")
  if (req.headers["content-type"] !== "application/json") {
    res.status(400).send('Expected form data')
    return
  }
  let requestForm = req.body
  /*try {
    requestForm = JSON.parse(req.body)
  } catch (syntaxError) {
    console.log('Syntax error in form data: %s', req.body)
    res.sendStatus(400).send('Syntax error in form data')
    return
  }*/

  const isSetac = requestForm.uloga === "setac"
  if (!isSetac && requestForm.uloga !== "vlasnik") {
    res.sendStatus(400).send('Nevalidna uloga')
    console.log('nevaldna uloga')
    return
  }

  // TODO treba provjeriti jos ostale parametre valjaju li

  db.createUser(
    requestForm.ime,
    requestForm.prezime,
    requestForm.email,
    requestForm.telefon,
  ).then(user => {
    console.log('Created user:', user)
    const idKorisnik = user.rows[0].idkorisnik // TODO treba vidjet jel postoji lol
    console.log('id korisnik:', idKorisnik)
    if (isSetac)
      db.createSetac(requestForm.tipClanarina, requestForm.profilFoto, idKorisnik, requestForm.lokDjelovanja)
    else
      db.createVlasnik(requestForm.primanjeObavijesti, idKorisnik)
  })

  res.sendStatus(200)
})

app.get('/api/me', async (req, res) => {
    try {
        if (!req.session?.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const sessionUser = req.session.user;
        const dbUser = await db.findUserByEmail(sessionUser.email);
        if (!dbUser) {
            console.log('/api/me - no DB user, session:', sessionUser);
            return res.json({ session: sessionUser, user: null });
        }

        const userId = dbUser.idkorisnik ?? dbUser.idKorisnik ?? dbUser.id ?? dbUser.id_korisnik;
        const userWithRole = await db.getUserWithRole(userId);
        console.log('/api/me - returning userWithRole:', userWithRole);

        res.json({ session: sessionUser, user: userWithRole });
    } catch (err) {
        console.error('Error in /api/me:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/*
    TODO: Ocjene i recenzije (pojednostavljeno)

    Trenutna dev implementacija koristi memorijski niz i privremene rute:
        - GET  /api/reviews?user=<id>  -> vraća recenzije za korisnika
        - POST /api/reviews            -> dodaje recenziju

    Što napraviti za produkciju (sažeto):
        1) Dodati tablicu `reviews` ili Mongoose model (polja: user, author, authorName, rating, text, createdAt).
        2) Implementirati rute i kontrolere (GET list, POST create, opc. DELETE/get).
        3) Validirati/sanitizirati input (rating 1..5, limit teksta, XSS sanitizacija).
        4) Zahtijevati autentikaciju za POST/DELETE i postaviti `author` sa servera.
        5) Dodati agregat/endpoint za `avg` i `count` (ili računati u queryu).

*/

// Simple in-memory reviews store for local development.
// Production should use a DB model and proper controllers (see above TODO).
const _inMemoryReviews = [];

// GET /api/reviews?user=<id>
app.get('/api/reviews', (req, res) => {
    try {
        const userId = req.query.user;
        if (!userId) return res.json({ reviews: [] });
        const list = _inMemoryReviews.filter(r => String(r.user) === String(userId)).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
        return res.json({ reviews: list });
    } catch (e) {
        console.error('GET /api/reviews error', e);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/reviews
app.post('/api/reviews', (req, res) => {
    try {
        const { user, rating, text } = req.body || {};
        if (!user || typeof rating === 'undefined') return res.status(400).json({ error: 'Missing fields' });
        const num = Number(rating);
        if (Number.isNaN(num) || num < 0 || num > 5) return res.status(400).json({ error: 'rating out of range' });
        if (text && String(text).length > 2000) return res.status(400).json({ error: 'text too long' });

        // derive author from session if available
        const authorId = req.session?.user?.idkorisnik || req.session?.user?.id || null;
        const authorName = req.session?.user?.imeKorisnik || req.session?.user?.name || req.session?.user?.email || 'Anon';

        const newReview = {
            _id: 'r' + Date.now() + '-' + Math.floor(Math.random()*10000),
            user: String(user),
            author: authorId,
            authorName,
            rating: num,
            text: text || '',
            createdAt: new Date().toISOString()
        };

        _inMemoryReviews.push(newReview);
        return res.status(201).json(newReview);
    } catch (e) {
        console.error('POST /api/reviews error', e);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.use('/api/calendar', calendar.router)

// TODO: Implementirati endpoint za upload profilne slike
// POST /api/upload-profile-image
// - Primiti file iz req.file (multer je već konfiguriran)
// - Spremi putanju /uploads/... u DB (koristiti db.updateUserProfileImage())
// - Vrati updated user kao JSON
// - Klijent će tada prikazati novu sliku
//
// Frontend je spreman i čeka ovaj endpoint
// Multer je već konfiguriran na serveru

// TODO: Implementirati endpoint za brisanje profila
// DELETE /api/delete-profile
// - Provjeri je li korisnik ulogiran (req.session?.user)
// - Dohvati korisnika iz baze po email-u
// - Obriši sve podatke povezane s tim korisnikom:
//   * Obriši iz korisnik tablice
//   * Obriši iz setac/vlasnik/administrator tablica (ovisno o ulozi)
// - Uništi sesiju (req.session.destroy())
// - Vrati 200 sa porukom ili 500 ako greška
//
// Frontend prikazuje modal s "Jeste li sigurni?" i gumbi "Da" i "Ne"
// Nakon brisanja korisnik se preusmjerava na početnu stranicu

const PORT = process.env.PORT || 8000;
const start = async (port) => {
    app.listen(port, () => {
        console.log(`Server running on port: http://localhost:${port}`);
    });
};

start(PORT);
