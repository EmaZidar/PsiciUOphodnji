import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import session from "express-session";
import fetch from "node-fetch";
import * as db from "./db.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Test database connection on startup
db.testConnection();

const app = express();
app.use(express.json());

app.use(cors())

app.use(
    session({          'Access-Control-Allow-Origin': '*',

        secret: "Rainbow feline",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 4, // 4 hours session expiry
        },
    })
);

const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_ACCESS_TOKEN_URL = process.env.GOOGLE_ACCESS_TOKEN_URL;

// Use configured callback URL in production, fallback to localhost for dev
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "https://psiciuophodnji.onrender.com:8000/google/callback";
const GOOGLE_OAUTH_SCOPES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
];

app.get("/login/auth", async (_req, res) => {
    const state = "some_state";

    // FIX: URL encode the scopes and callback URL when building the OAuth URL
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
        redirect_uri: GOOGLE_CALLBACK_URL, // Use the variable
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

        // Verify and extract the information in the id token
        const token_info_response = await fetch(
            `${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`
        );
        const token_info_data = await token_info_response.json();
        const { email, name } = token_info_data;

        req.session.user = { email: email, name: name };

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
            //Dohvati ulogu korisnika preko id-a
            const userId = existingUser.id;
            const userWithRole = await db.getUserWithRole(userId);
            res.redirect(`${clientUrl}/?role=${encodeURIComponent(userWithRole)}`);
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

const PORT = process.env.PORT || 8000;
const start = async (port) => {
    app.listen(port, () => {
        console.log(`Server running on port: http://localhost:${port}`);
    });
};

// Serve built frontend (if present)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

try {
    app.use(express.static(clientDistPath));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/google') || req.path.startsWith('/login') || req.path.startsWith('/favicon.ico')) return next();
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
} catch (err) {
    console.log('Client dist not found, skipping static serving');
}

start(PORT);
