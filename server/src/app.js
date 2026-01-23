import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import session from "express-session";
import fetch from "node-fetch";
import * as db from "./db.js";
import * as imgDb from "./imgDb.js";
import multer from "multer"; 
import cors from "cors";
import * as calendar from "./calendar.js";

db.testConnection();
const imgContainer = await imgDb.initializeBlobStorage();

// Configure multer for file uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP allowed'));
        }
    }
});

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

// PATCH /api/me (zove se u Profile.jsx i podatciVlasnika.jsx)
// svrha: azuriranje osobnih podataka za oba korisnika
// vlasnik: ime, prezime, email, telefon, setac: ime, prezime, email, telefon, lokDjelovanja
// znaci ak je vlasnik u pitanju updatea se samo tablica KORISNIK, ak je setac onda se updatea KORISNIK i SETAC
// ako nije setac nego vlasnik lokdjelovanja se ignorira
// provjera: korisnik mora biti ulogiran
// korisnik se updateta samo ako ima neceg u bodyju (znaci npr ak promijeni samo mail, updatea se samo mail)
// slucaj setaca kad se updateaju 2 tablice treba rijesit transakcijom da se ne desi da se updatea samo jedna tablica (BEGIN -> COMMIT -> ROLLBACK)
// edge case: unique violation za email - treba vratiti 400 s porukom "Email je već u upotrebi"
app.patch('/api/me', checkIsAuthenticated, async (req, res) => {
    try {
        const idKorisnik = req.session.user.id;
        const { imekorisnik, prezkorisnik, email, telefon, lokdjelovanja } = req.body;
        db.patchUser(idKorisnik, imekorisnik, prezkorisnik, email, telefon, lokdjelovanja);
        return res.sendStatus(200);
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

app.post('/api/me/profile-image', checkIsAuthenticated, upload.single('profilfoto'), async (req, res) => {
    try {
        // Access the uploaded file via req.file
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        console.log('File received:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
        
        const sessionUser = req.session.user;
        const dbUser = await db.getUserWithEmail(sessionUser.email);
        if (!dbUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const userEmail = sessionUser.email.replace(/@/g, '_'); // Sanitize email for blob name
        const fileExtension = req.file.mimetype.split('/')[1]; // jpeg, png, webp
        const blobName = `${userEmail}-profile-${Date.now()}.${fileExtension}`;
        
        // Upload file buffer to Azure Blob Storage
        const uploadResult = await imgDb.uploadImage(blobName, imgContainer, req.file.buffer);
        
        console.log('Image uploaded successfully:', uploadResult.url);
        
        // TODO: Update database with photo URL
        const updateResult = await db.updateUserProfileImage(dbUser.idkorisnik, uploadResult.url);
        if (!updateResult) {
            return res.status(500).json({ error: 'Failed to update user profile image in database' });
        } else {
            console.log('Database updated with new profile image URL');
        }
        // Refresh user data
        const userId = dbUser.idkorisnik;
        const userWithRole = await db.getUserWithRole(userId);
        
        res.status(200).json({ 
            message: 'Image uploaded successfully',
            blobName: uploadResult.blobName,
            url: uploadResult.url,
            user: userWithRole
        });
    } catch (err) {
        console.error('Error in /api/me/profile-image:', err);
        res.status(500).json({ error: err.message || 'Internal server error' });
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
        const { idkorisnik } = await db.getUserWithEmail(req.session.user.email);
        const { idSetnja, polaziste, vrijeme, datum, dodNapomene, status, nacinPlacanja } = req.body;
        const rezervacija = await db.createRezervacija(idSetnja, idkorisnik, polaziste, vrijeme, datum, dodNapomene, status, nacinPlacanja);
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

// APIJI ZA NOTIFIKACIJE I PLAĆANJE
// odite na pageove di se zovu ovi apiji da vidite kontekst i da dodate ono VITE_BACKEND_URL ili sta vec treba jer nisam bila zihi kako
// ideja: odlucila sam implementirati na nacin da setac ili vlasnik vidi notifikacije tek kad klikne na ikonicu notifikacija u headeru jer mi se polling cini overkill za sad
// dakle kad korisnik klikne na ikonicu, frontend salje request na backend da dohvati notifikacije
// onda kad setac prihvati ili odbije rezervaciju, frontend salje request na backend da updatea status rezervacije
// znaci basically notifikacije su samo filtriranje po statusu rezervacije i vracanje tih rezervacija u frontend ovisno je li u pitanju vlasnik ili setac

//GET /api/setac/notifikacije (zove se u HeaderUlogiran.jsx)
// prvo sam zatrazila onaj api/me koji vrati usera sa ulogom (nadam se)
// provjera: korisnik mora biti ulogiran i mora biti setac
// backend mora vratiti array notifikacija za setaca - svaki objekt notifikacije treba imati:
// idRezervacija, tipSetnja, cijena, trajanje, imeKorisnik, prezKorisnik, datum, vrijeme, polaziste, dodNapomene
// to se dobije mergeanjem tablica KORISNIK, VLASNIK (jer mi trebaju ime i prezime vlasnika koji je napravio rezervaciju), REZERVACIJA, SETNJA
// bitna stvar!!! treba filtrirati samo one rezervacije koje su u statusu "na cekanju" jer su to notifikacije za setaca
app.get('/api/setac/notifikacije', checkIsAuthenticated, async (req, res) => {
    try {
        const { idkorisnik } = await db.getUserWithEmail(req.session.user.email);

        if (!await db.checkIsSetac(idkorisnik))
        if (!await db.checkIsSetac(idkorisnik))
            return res.status(403).json({ error: "Pristup dozvoljen samo setacima" });

        const notifications = await db.getSetacNotifikacije(idkorisnik);

        return res.status(200).json(notifications);
    } catch (err) {
        console.error('Error in /api/setac/notifikacije:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

function changeRezervacijaStatus(newStatus) {
    return async (req, res) => {
        try {
            const idRezervacija = req.params.idRezervacija;
            const { idkorisnik } = await db.getUserWithEmail(req.session.user.email);
        if (!await db.checkIsSetac(idkorisnik))
            return res.status(403).json({ error: "Pristup dozvoljen samo setacima" });

            const success = await db.changeRezervacijaStatus(idkorisnik, idRezervacija, newStatus);
            if (success)
                return res.sendStatus(204); // no content
            return res.status(404).json({ error: "Ne postoji takva rezervacija na čekanju" });
        } catch (err) {
            console.error(`Error in /api/rezervacija/*/${newStatus}`, err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

//PATCH /api/rezervacija/:idRezervacija/prihvati (zove se u HeaderUlogiran.jsx)
// provjera: korisnik mora biti ulogiran i mora biti setac, rezervacija mora postojati i mora biti u statusu "na cekanju"
// provjera: setac mora biti vlasnik te setnje na koju se odnosi rezervacija (rezervacija ima idSetnja, treba dohvatiti setnju i provjeriti idKorisnik setnje)
// ako sve prode, updateat rezervaciju da bude u statusu "potvrdeno"!!!!
app.patch('/api/rezervacija/:idRezervacija/prihvati', checkIsAuthenticated, changeRezervacijaStatus('potvrdeno'));

//PATCH /api/rezervacija/:idRezervacija/odbij (zove se u HeaderUlogiran.jsx)
// provjera: korisnik mora biti ulogiran i mora biti setac, rezervacija mora postojati i mora biti u statusu "na cekanju"
// provjera: setac mora biti vlasnik te setnje na koju se odnosi rezervacija (rezervacija ima idSetnja, treba dohvatiti setnju i provjeriti idKorisnik setnje)
// ako sve prode, updateat rezervaciju da bude u statusu "odbijeno"!!!!
app.patch('/api/rezervacija/:idRezervacija/odbij', checkIsAuthenticated, changeRezervacijaStatus('odbijeno'));

//GET /api/vlasnik/notifikacije (zove se u HeaderUlogiran.jsx)
// prvo sam zatrazila onaj api/me koji vrati usera sa ulogom (nadam se)
// provjera: korisnik mora biti ulogiran i mora biti vlasnik
// backend mora vratiti array notifikacija za vlasnika - svaki objekt notifikacije treba imati:
// idRezervacija, status, tipSetnja, cijena, trajanje, datum, vrijeme
// to se dobije mergeanjem tablica REZERVACIJA i SETNJA
// bitna stvar!!! treba filtrirati samo one rezervacije koje su u statusu "potvrdeno" I "odbijeno" jer su to notifikacije za vlasnika
app.get('/api/vlasnik/notifikacije', checkIsAuthenticated, async (req, res) => {
    try {
        const { idkorisnik } = await db.getUserWithEmail(req.session.user.email);

        if (!await db.checkIsVlasnik(idkorisnik))
            return res.status(403).json({ error: "Pristup dozvoljen samo vlasnicima" });

        const notifications = await db.getVlasnikNotifikacije(idkorisnik);

        return res.status(200).json(notifications);
    } catch (err) {
        console.error('Error in /api/vlasnik/notifikacije:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//GET /api/rezervacije/:idRezervacija (zove se u Placanje.jsx)
// sluzi da se dohvati detalje rezervacije za prikaz na stranici placanja
// provjera: korisnik mora biti ulogiran i mora biti vlasnik i mora biti vlasnik te rezervacije (postoji idKorisnik u REZERVACIJA)
// backend vraca detalje rezervacije (array): idRezervacija, datum, vrijeme, polaziste, nacinPlacanja, status
// to se sve dobije iz tablice REZERVACIJA
app.get('/api/rezervacije/:idRezervacija', async (req, res) => {
    try {
        const idRezervacija = req.params.idRezervacija;
        const { idkorisnik } = await db.getUserWithEmail(req.session.user.email);

        if (!await db.checkIsVlasnik(idkorisnik))
            return res.status(403).json({ error: "Pristup dozvoljen samo vlasnicima" });

        const rezervacija = await db.getRezervacija(idkorisnik, idRezervacija);

        if (!rezervacija)
            return res.status(404).json({ error: "Ne postoji takva rezervacija kod trenutnog vlasnika" });
        return res.status(200).json(rezervacija);
    } catch (err) {
        console.error('Error in /api/rezervacije/*', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//PATCH /api/rezervacije/:idRezervacija/placanje (zove se u Placanje.jsx)
// sluzi da se updatea rezervacija kao placena
// provjera: korisnik mora biti ulogiran i mora biti vlasnik i mora biti vlasnik te rezervacije (postoji idKorisnik u REZERVACIJA)
// provjera: rezervacija mora biti u statusu "potvrdeno", nacinPlacanja mora biti "kreditna kartica"
// ako sve prode, updateat rezervaciju da bude u statusu "placeno"
app.patch('/api/rezervacije/:idRezervacija/placanje', async (req, res) => {
    try {
        const idRezervacija = req.params.idRezervacija;
        const { idkorisnik } = await db.getUserWithEmail(req.session.user.email);

        if (!await db.checkIsVlasnik(idkorisnik))
            return res.status(403).json({ error: "Pristup dozvoljen samo vlasnicima" });

        const success = await db.platiRezervaciju(idkorisnik, idRezervacija);
        if (success)
            return res.sendStatus(204); // no content
        return res.status(404).json({ error: "Ne postoji takva rezervacija na čekanju" });
    } catch (err) {
        console.error('Error in /api/rezervacije/*/placanje', err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

const PORT = process.env.PORT || 8000;
const start = async (port) => {
    app.listen(port, () => {
        console.log(`Server running on port: ${port}`);
    });
};

start(PORT);

export default app;


//APIJI ZA UREDIVANJE OSOBNIH PODATAKA VLASNIKA I SETACA
// + UPLOAD PROFILNE SLIKE + PRIKAZ SREDNJE OCJENE I BROJA RECENZIJA ZA SETACA

// provjerite jel sam dobro stavila ovaj BACKEND_URL u fetchove

// GET /api/setaci/${user.idkorisnik}/rating-summary (zove se u Profile.jsx i Reviews.jsx (kasnije))
// svrha: dohvatiti srednju ocjenu i broj recenzija za setaca
// provjera: korisnik mora biti ulogiran i mora biti setac
// backend treba vratiti objekt: {ukocjena: float, brojrecenzija: int}
// edge case: ako setac nema recenzija, ukocjena treba biti null, brojrecenzija treba biti 0
// tu se mora neki veliki merge tablica napravit: SETAC, SETNJA, REZERVACIJA, RECENZIJA tak da se moze doc do ocjena
// znaci treba se izracunat prosjek ocjena iz recenzija za sve setnje tog setaca i prebrojat koliko taj setac ima recenzija i poslat nam u response

// POST /api/me/profile-image (zove se u Profile.jsx)
// svrha: setac uploada novu profilnu sliku -> front salje multipart/form-data s fieldom "profilfoto" (File - vrsta Bloba)
// provjera: korisnik mora biti ulogiran i mora bit setac, idkorisnik se dobije iz sessiona
// dozvoljeni mime: image/jpeg, image/png, image/jpg
// backend treba spremiti sliku u object storage i dobiti URL/key koji se sprema u bazu
// napomena za URL: ak se vraca puni url front moze direkt prikazat a ak se vraca relativna putanja front mora znat prefiks
// backend treba updateat putanju profilne slike u tablici SETAC za tog korisnika
// frontend ocekuje da se odmah osvjezi user
// sad cu tu copy pasteat TODO koji mi je chatgpt dao jer ne znam kak se to treba raditi tocno pa ak vam treba helper
//TODO koraci:
//Pročitati datoteku iz requesta (multer memory storage ili stream).
//Generirati jedinstveni key npr: profile-images/{idKorisnik}/{timestamp}-{random}.{ext}
//Upload u object storage bucket (S3/MinIO/Azure Blob… ovisi što koristite):
    //postaviti Content-Type na mime filea
    //opcionalno Cache-Control (npr. public, max-age=31536000 ako su verzionirani keyevi)
//Spremiti rezultat:
    //ili public URL (npr. https://.../bucket/...)
    //ili key + vi ga kasnije mapirate na URL
//Ako imate staru sliku: opcionalno obrisati stari objekt u storage-u (da se ne gomila).
//DB update
    //Upisati novu putanju u tablicu šetača (ili gdje već držite profilnu):
    //Paziti da ovo radi samo za šetače (ako vlasnici nemaju profilnu ili drugačije).
