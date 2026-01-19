import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import session from "express-session";
import fetch from "node-fetch";
import * as db from "./db.js";
import cors from "cors";
import * as calendar from "./calendar.js";

db.testConnection();    

const app = express();
app.use(express.json());

// Trust Render's reverse proxy for secure cookies
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(cors({
    origin: [
        'http://localhost:5173',
        process.env.CLIENT_URL
    ],
    credentials: true
}));
console.log(`NODE_ENV = ${process.env.NODE_ENV}, isProduction = ${process.env.NODE_ENV === "production"}`)
app.use(
    session({
        secret: "Rainbow feline",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 4, // 4 sata
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
        },
    })
);

const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_ACCESS_TOKEN_URL = process.env.GOOGLE_ACCESS_TOKEN_URL;

const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:8000/google/callback";
const GOOGLE_OAUTH_SCOPES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
//  "https://www.googleapis.com/auth/calendar.events",
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

        const existingUser = await db.getUserWithEmail(email);
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


//TODO ADMIN TIP CLANARINE to mi treba nez jel to na kraju imamo tu ili ne
app.post('/api/register', (req, res) => {
  console.log("registering....")
  if (req.headers["content-type"] !== "application/json") {
    res.status(400).send('Expected form data')
    return
  }
  let requestForm = req.body

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

app.get('/api/users', async (req, res) => {
    try {
        const users = await db.getAllUsers();
        res.status(200).json(users);
    } catch (err) {
        console.error('Error in /api/users:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

function checkIsAuthenticated(req, res, next) {
    if (req.session.user)
        return next();
    return res.status(401).json({ error: 'Not authenticated' });
}

app.get('/api/me', checkIsAuthenticated, async (req, res) => {
    try {
        const sessionUser = req.session.user;
        const dbUser = await db.getUserWithEmail(sessionUser.email);
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

app.get('/api/setaci', async (req, res) => {
    try {
        const setaci = await db.getAllSetaci();
        if (setaci.length > 0)
            console.log(setaci[0])
        else console.log('Empty setaci :(')

        res.status(200).json(setaci)
    } catch (err) {
        console.error('Error in /api/setaci:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/vlasnici', async (req, res) => {
    try {
        const vlasnici = await db.getAllVlasnici();
        if (vlasnici.length > 0)
            console.log(vlasnici)
        else console.log('Nema vlasnika')
        res.status(200).json(vlasnici)
    } catch (err) {
        console.error('Error in /api/vlasnici:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/rezervacije', checkIsAuthenticated, async (req, res) => {
    try {
        const idKorisnik = req.session.user.idKorisnik;
        const { idSetnja, polaziste, vrijeme, datum, dodNapomene, status, nacinPlacanja } = req.body;
        const rezervacija = await db.createRezervacija(idSetnja, idKorisnik, polaziste, vrijeme, datum, dodNapomene, status, nacinPlacanja);
        res.status(201).json(rezervacija.rows[0]);
    } catch (err) {
        console.error('Error creating rezervacija:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//TODO PSI  ja imam fetch("http://localhost:8000/psi", i tamo saljem psa  tj zapravo 
// saljem objekt koji se zove "kojiPas" jer je u njemu svi atribut od psa ali  i idKorisnik jer bi rekla da bi trebali vi
//kad se stvori novi pas njemu napravit idPas pa sam poslala i idKorisnik ak bi doslo do problema ak se dva psa zovu isto
//ugl 

app.get('/api/setnje/:idkorisnik', async (req, res) => {
    try {
        const idkorisnik = parseInt(req.params.idkorisnik, 10);
        if (!idkorisnik) {
            return res.status(400).json({ error: 'Invalid korisnik ID' });
        }
        const setac = await db.getSetacWithId(idkorisnik);
        console.log('Result from getUserWithId:', setac);
        if (!setac) {
            return res.status(404).json({ error: 'Šetač nije pronađen' });
        }
        const setnje = await db.getDostupneSetnjeSetaca(idkorisnik);
        console.log('Dostupne šetnje for setac:', setnje);
        setac.setnje = setnje;
        res.status(200).json({ setac });
    } catch (err) {
        console.error('Error in /api/setnje/:idkorisnik:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



//TODO MOJE SETNJE   moja ideja je da vi filtirate koje setnje su prosle a koje bududce s nekim ono current_date u bazi i 
//da tako svaki put kad se ispisu setnje vi filtrirate koje se meni salju na  
//  fetch('/api/prosleSetnje/${idKorisnik}', {  a koje da mi se salju na /buduceSetnje/${idKorisnik} jer ja tako napravim 2 liste pa prek tog radim 
//al ak mislite da je lakse meni na frontu filtrirat mogu al nekak mi se cinilo lakse da sam napravite neki query bazi 
// setnja.datum-current_date>0 pa bi mi to bilo idealno i idkorisnik saljem id vlasnika log



// Kreiraj novu šetnju
app.post('/api/setnja', async (req, res) => {
    try {
        const { cijena, tipSetnja, trajanje, idKorisnik } = req.body;
        const setnja = await db.createSetnja(cijena, tipSetnja, trajanje, idKorisnik);
        res.status(201).json({ setnja });
    } catch (err) {
        console.error('Error creating setnja:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Ažuriraj šetnju
app.put('/api/setnje/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { cijena, tipsetnja, trajanje } = req.body;
        const setnja = await db.updateSetnja(id, cijena, tipsetnja, trajanje);
        res.json({ setnja });
    } catch (err) {
        console.error('Error updating setnja:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Obriši šetnju
app.delete('/api/setnje/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        await db.deleteSetnja(id);
        res.json({ message: 'Setnja deleted' });
    } catch (err) {
        console.error('Error deleting setnja:', err);
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

app.delete('/api/delete-profile', checkIsAuthenticated, async (req, res) => {
    try {
        const sessionUser = req.session.user;
        const dbUser = await db.getUserWithEmail(sessionUser.email);
        if (!dbUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const userId = dbUser.idkorisnik;
        console.log('Deleting user with ID:', userId);
        
        // OBRIŠI KORISNIKA
        await db.deleteUserWithId(userId);
        console.log('User deleted successfully');
        
        // OBRIŠI SESIJU
        return await new Promise((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) reject(err);
                else resolve(res.json({ message: 'Profile deleted successfully' }));
            });
        });
    } catch (err) {
        console.error('Error in /api/delete-profile:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 8000;
const start = async (port) => {
    app.listen(port, () => {
        console.log(`Server running on port: ${port}`);
    });
};

start(PORT);

export default app;