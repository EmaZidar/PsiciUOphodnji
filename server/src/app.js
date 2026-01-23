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
import * as chat from "./chat.js";

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
// ovo kao prevencija cachea za api zahtjeve
const noCache = (req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
};

// da nema starog sessiona kad se salje api zahtjev
app.use('/api', noCache);
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

    res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL);
});

app.get("/google/callback", async (req, res) => {
    const { code } = req.query;

    const data = {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
    };

    try {
        const response = await fetch(GOOGLE_ACCESS_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const access_token_data = await response.json();

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
            req.session.user.id = userId;
            req.session.user.role = role;
            res.redirect(`${clientUrl}/main?role=${encodeURIComponent(role)}`);
        }
    } catch (error) {
        console.error("Error in callback:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


//TODO ADMIN TIP CLANARINE to mi treba nez jel to na kraju imamo tu ili ne
app.post('/api/register', async (req, res) => {
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

    const user = await db.createUser(
        requestForm.ime,
        requestForm.prezime,
        requestForm.email,
        requestForm.telefon,
    );
    console.log('Created user:', user)
    const idKorisnik = user.rows[0].idkorisnik // TODO treba vidjet jel postoji lol
    console.log('id korisnik:', idKorisnik)
    req.session.user.id = idKorisnik;
    req.session.user.role = isSetac ? 'setac' : 'vlasnik';
    if (isSetac)
        db.createSetac(requestForm.tipClanarina, requestForm.profilFoto, idKorisnik, requestForm.lokDjelovanja)
    else
        db.createVlasnik(requestForm.primanjeObavijesti, idKorisnik)

    res.sendStatus(200)
})

app.get('/api/users', async (_req, res) => {
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

app.delete('/api/delete/:idKorisnik', async (req, res) => {
    try {
        const idKorisnik = parseInt(req.params.idKorisnik, 10);
        await db.deleteUserWithId(idKorisnik);
        res.json({ message: `Korisnik ${idKorisnik} deleted` });
    } catch (err) {
        console.error('Error deleting korisnik:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/me', checkIsAuthenticated, async (req, res) => {
    try {
        const sessionUser = req.session.user;
        const dbUser = await db.getUserWithEmail(sessionUser.email);
        if (!dbUser) {
            console.log('/api/me - no DB user, session:', sessionUser);
            return res.json({ session: sessionUser, user: null });
        }

        const userId = dbUser.idkorisnik ?? dbUser.idKorisnik;
        const userWithRole = await db.getUserWithRole(userId);
        //console.log('/api/me - returning userWithRole:', userWithRole);

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

// Logout endpoint: destroy session and clear cookie
app.post('/api/logout', (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session on logout:', err);
                return res.status(500).json({ error: 'Failed to logout' });
            }
            res.clearCookie('connect.sid');
            return res.status(200).json({ message: 'Logged out' });
        });
    } catch (err) {
        console.error('Error in /api/logout:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/api/setaci', async (_req, res) => {
    try {
        const setaci = await db.getAllSetaci();
        res.status(200).json(setaci)
    } catch (err) {
        console.error('Error in /api/setaci:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/me/profile-image (zove se u Profile.jsx)
// svrha: setac uploada novu profilnu sliku -> front salje multipart/form-data s fieldom "profilfoto" (File - vrsta Bloba)
// provjera: korisnik mora biti ulogiran i mora bit setac, idkorisnik se dobije iz sessiona
// dozvoljeni mime: image/jpeg, image/png, image/jpg
// backend treba spremiti sliku u object storage i dobiti URL/key koji se sprema u bazu
// napomena za URL: ak se vraca puni url front moze direkt prikazat a ak se vraca relativna putanja front mora znat prefiks
// backend treba updateat putanju profilne slike u tablici SETAC za tog korisnika
// frontend ocekuje da se odmah osvjezi user
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
        res.status(200).json(vlasnici)
    } catch (err) {
        console.error('Error in /api/vlasnici:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/rezervacije', checkIsAuthenticated, async (req, res) => {
    try {
        const idkorisnik = req.session.user.id;
        const { idSetnja, polaziste, vrijeme, datum, dodNapomene, status, nacinPlacanja } = req.body;
        const rezervacija = await db.createRezervacija(idSetnja, idkorisnik, polaziste, vrijeme, datum, dodNapomene, status, nacinPlacanja);
        res.status(201).json(rezervacija.rows[0]);
    } catch (err) {
        console.error('Error creating rezervacija:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/api/psi', async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.email) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        const dbUser = await db.getUserWithEmail(req.session.user.email);
        if (!dbUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const idkorisnik = dbUser.idkorisnik;
        const { imePas, pasmina, socijalizacija, razinaEnergije, starost, zdravNapomene } = req.body;
        
        console.log('Creating pas with data:', { imePas, pasmina, socijalizacija, razinaEnergije, starost, zdravNapomene, idkorisnik });
        
        const pas = await db.createPas( 
            imePas,
            pasmina,
            parseInt(socijalizacija, 10),
            parseInt(razinaEnergije, 10),
            parseInt(starost, 10),
            zdravNapomene,
            idkorisnik
        );
        
        console.log('Created pas:', pas);
        const idPas = pas?.idPas ?? pas?.idpas;
        res.status(201).json({ idPas, pas });
    } catch (err) {
        console.error('Error creating pas:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/psi/:idPas', async (req, res) => {
    try {
        const idPas = parseInt(req.params.idPas, 10);
        await db.deletePas(idPas);
        res.json({ message: 'Pas deleted' });
    } catch (err) {
        console.error('Error deleting pas:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/psi', async (req, res) => {
    try {
        const { idkorisnik } = await db.getUserWithEmail(req.session.user.email).catch(() => {
            throw new Error('User not found')
            });
        const psi = await db.getPsiByKorisnikId(idkorisnik);
        console.log('Svi psi korisnika:', psi); 
        res.status(200).json(psi);
    } catch (err) {
        console.error('Error in /api/psi:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
        

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

app.get('/api/prosleSetnje/:idkorisnik', async (req, res) => {
    try {
        const idKorisnik = parseInt(req.params.idkorisnik, 10);
        const prosleSetnje = await db.getProsleSetnjeVlasnika(idKorisnik);
        res.status(200).json(prosleSetnje);
    } catch (err) {
        console.error('Error in /api/prosleSetnje/:idkorisnik:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/buduceSetnje/:idkorisnik', async (req, res) => {
    try {
        const idKorisnik = parseInt(req.params.idkorisnik, 10);
        const buduceSetnje = await db.getBuduceSetnjeVlasnika(idKorisnik);
        res.status(200).json(buduceSetnje);
    } catch (err) {
        console.error('Error in /api/buduceSetnje/:idkorisnik:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

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


app.use('/api/calendar', calendar.router)


app.delete('/api/delete-profile', checkIsAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
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

app.delete('/api/delete/rezervacija/:idRezervacija', async (req, res) => {
    try {
        const idRezervacija = parseInt(req.params.idRezervacija, 10);
        await db.deleteRezervacija(idRezervacija);
        console.log(`Rezervacija ${idRezervacija} deleted`);
        res.json({ message: 'Rezervacija deleted' });
    } catch (err) {
        console.error('Error deleting rezervacija:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

function checkIsSetac(req, res, next) {
    if (req.session.user?.role === 'setac')
        return next();
    return res.status(403).json({ error: 'Pristup dozvoljen samo setacima' });
}

function checkIsVlasnik(req, res, next) {
    if (req.session.user?.role === 'vlasnik')
        return next();
    return res.status(403).json({ error: 'Pristup dozvoljen samo vlasnicima' });
}

app.get('/api/setac/notifikacije', checkIsAuthenticated, checkIsSetac, async (req, res) => {
    try {
        const notifications = await db.getSetacNotifikacije(req.session.user.id);

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
            const idkorisnik = req.session.user.id;

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
app.patch('/api/rezervacija/:idRezervacija/prihvati', checkIsAuthenticated, checkIsSetac, changeRezervacijaStatus('potvrdeno'));

//PATCH /api/rezervacija/:idRezervacija/odbij (zove se u HeaderUlogiran.jsx)
// provjera: korisnik mora biti ulogiran i mora biti setac, rezervacija mora postojati i mora biti u statusu "na cekanju"
// provjera: setac mora biti vlasnik te setnje na koju se odnosi rezervacija (rezervacija ima idSetnja, treba dohvatiti setnju i provjeriti idKorisnik setnje)
// ako sve prode, updateat rezervaciju da bude u statusu "odbijeno"!!!!
app.patch('/api/rezervacija/:idRezervacija/odbij', checkIsAuthenticated, checkIsSetac, changeRezervacijaStatus('odbijeno'));

//GET /api/vlasnik/notifikacije (zove se u HeaderUlogiran.jsx)
// prvo sam zatrazila onaj api/me koji vrati usera sa ulogom (nadam se)
// provjera: korisnik mora biti ulogiran i mora biti vlasnik
// backend mora vratiti array notifikacija za vlasnika - svaki objekt notifikacije treba imati:
// idRezervacija, status, tipSetnja, cijena, trajanje, datum, vrijeme
// to se dobije mergeanjem tablica REZERVACIJA i SETNJA
// bitna stvar!!! treba filtrirati samo one rezervacije koje su u statusu "potvrdeno" I "odbijeno" jer su to notifikacije za vlasnika
app.get('/api/vlasnik/notifikacije', checkIsAuthenticated, checkIsVlasnik, async (req, res) => {
    try {
        const notifications = await db.getVlasnikNotifikacije(req.session.user.id);

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
app.get('/api/rezervacije/:idRezervacija', checkIsAuthenticated, checkIsVlasnik, async (req, res) => {
    try {
        const idRezervacija = req.params.idRezervacija;
        const idkorisnik = req.session.user.id;

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
app.patch('/api/rezervacije/:idRezervacija/placanje', checkIsAuthenticated, checkIsVlasnik, async (req, res) => {
    try {
        const idRezervacija = req.params.idRezervacija;
        const idkorisnik = req.session.user.id;

        const success = await db.platiRezervaciju(idkorisnik, idRezervacija);
        if (success)
            return res.sendStatus(204); // no content
        return res.status(404).json({ error: "Ne postoji takva rezervacija na čekanju" });
    } catch (err) {
        console.error('Error in /api/rezervacije/*/placanje', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// API – setnje-setaca
// setac na svom home pageu (UlogiranSetac) treba vidjeti sve setnje koje ga cekaju u buducnosti
// pogledajte SetnjeSetacu.jsx da vidite kako frontend salje request i sta ocekuje kao odgovor
// mislim da sam sve navela tu al za svaki slucaj 
// koraci na backendu:
// provjeriti je li korisnik ulogiran i je li setac, ID SETACA (nisam ziher) 
// dohvatiti sve setnje za tog setaca:
//    - tablica SETNJA -> idKorisnik = ulogirani setac
//    - filtrirati samo one gdje postoji rezervacija u tablici REZERVACIJA
//      koja je u statusu ("placeno") ILI ("potvrdeno" + da je nacin placanja "gotovina")
//    - datum rezervacije >= danas (buduce setnje)
//    - spajati s tablicom KORISNIK (VLASNIK) da dobijemo imekorisnik i prezKorisnik vlasnika
//    - spajati s tablicom REZERVACIJA da dobijemo polaziste, datum, vrijeme, nacinPlacanja i dodNapomene
// sortirati po datumu i vremenu (uzlazno)

app.get('/api/setnje-setaca', async (req, res) => {
    try {
        const { idkorisnik } = await db.getUserWithEmail(req.session.user.email);

        if (!await db.checkIsSetac(idkorisnik))
            return res.status(403).json({ error: "Pristup dozvoljen samo setacima" });
        const setnje = await db.getSetnjeSetaca(idkorisnik);

        return res.status(200).json(setnje);
    } catch (err) {
        console.error('Error in /api/setnje-setaca:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// TODO /vlasnik/:id endpoint za dohvat vlasnika i njegovih pasa
// /api/vlasnik/:id
// Iz tablica KORISNIK i VLASNIK trebam dohvatiti podatke o vlasniku ime, prezime, email, telefon
// Iz tablice PAS trebam dohvatiti sve pse tog vlasnika, znaci sve ono sto on opisuje za psa svog
// idpas, imepas, pasmina, starost, socijalizacija, razinaenergije, zdravnapomene
// sorturati pse po imenu psa ili idu redom kako su uneseni
app.get('/api/vlasnik/:idkorisnik', async (req, res) => {
    try {
        const idKorisnik = parseInt(req.params.idkorisnik, 10);
        const vlasnik = await db.getVlasnikWithId(idKorisnik);
        if (!vlasnik) {
            return res.status(404).json({ error: 'Vlasnik nije pronađen' });
        }
        const psi = await db.getPsiByKorisnikId(idKorisnik);
        vlasnik.psi = psi;
        res.status(200).json({ vlasnik });
    } catch (err) {
        console.error('Error in /api/vlasnik/:id:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.use('/api/chats', chat.router);


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

// GET /api/setaci/:idkorisnik/rating-summary (zove se u Profile.jsx i Reviews.jsx (kasnije))
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



// PATCH /api/me (zove se u Profile.jsx i podatciVlasnika.jsx)
// svrha: azuriranje osobnih podataka za oba korisnika
// vlasnik: ime, prezime, email, telefon, setac: ime, prezime, email, telefon, lokDjelovanja
// znaci ak je vlasnik u pitanju updatea se samo tablica KORISNIK, ak je setac onda se updatea KORISNIK i SETAC
// ako nije setac nego vlasnik lokdjelovanja se ignorira
// provjera: korisnik mora biti ulogiran
// korisnik se updateta samo ako ima neceg u bodyju (znaci npr ak promijeni samo mail, updatea se samo mail)
// slucaj setaca kad se updateaju 2 tablice treba rijesit transakcijom da se ne desi da se updatea samo jedna tablica (BEGIN -> COMMIT -> ROLLBACK)
// edge case: unique violation za email - treba vratiti 400 s porukom "Email je već u upotrebi"



// API ZA RECENZIJE
// provjerite jel sam dobro stavila ovaj BACKEND_URL u fetch

// GET /api/setaci/:idkorisnik/recenzije (zove se u Reviews.jsx)
// svrha: dohvatiti sve recenzije za setaca s idkorisnik
// nema neke provjere
// backend treba vratiti array recenzija pod imenom "recenzije" - svaki objekt recenzije treba imati:
// idrecenzija, ocjena, tekst (ako ga ima), fotografija (ako je ima), imekorisnik, prezkorisnik (ime i prezime vlasnika koji je ostavio recenziju)
// to se dobije mergeanjem tablica SETAC, SETNJA, REZERVACIJA, RECENZIJA, VLASNIK, KORISNIK
// edge case: ako setac nema recenzija, treba vratiti prazan array
