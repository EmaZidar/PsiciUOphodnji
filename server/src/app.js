import * as dotenv from "dotenv"

dotenv.config()

import express from "express"

import fetch from "node-fetch"

const app = express()

app.use(express.json())

const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID

const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

const GOOGLE_ACCESS_TOKEN_URL = process.env.GOOGLE_ACCESS_TOKEN_URL

const GOOGLE_CALLBACK_URL = "http%3A//localhost:8000/google/callback"

const GOOGLE_OAUTH_SCOPES = [

"https%3A//www.googleapis.com/auth/userinfo.email",

"https%3A//www.googleapis.com/auth/userinfo.profile",

]

app.get("/login", async (_req, res) => {
  const state = "some_state"
  const scopes = GOOGLE_OAUTH_SCOPES.join(" ")
  const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&state=${state}&scope=${scopes}`
  res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL)
})

// Provide an alias endpoint that the Vite dev server proxies to: /login/auth
app.get("/login/auth", async (_req, res) => {
  const state = "some_state"
  const scopes = GOOGLE_OAUTH_SCOPES.join(" ")
  const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&state=${state}&scope=${scopes}`
  res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL)
})

app.get("/google/callback", async (req, res) => {
  console.log(req.query)

  const { code } = req.query

  const data = {
    code,

    client_id: GOOGLE_CLIENT_ID,

    client_secret: GOOGLE_CLIENT_SECRET,

    redirect_uri: "http://localhost:8000/google/callback",

    grant_type: "authorization_code",
  }

  console.log(data)

  // exchange authorization code for access token & id_token

  const response = await fetch(GOOGLE_ACCESS_TOKEN_URL, {
    method: "POST",

    body: JSON.stringify(data),
  })

  const access_token_data = await response.json()

  const { id_token } = access_token_data

  console.log(id_token)

  // verify and extract the information in the id token

  const token_info_response = await fetch(
    `${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`
  )

  const token_info_data = await token_info_response.json()

  const { email, name } = token_info_data;
  /*let user = await User.findOne({ email }).select("-password");
  if (!user) {
    user = await User.create({ email, name});
  }
  const token = user.generateToken();*/

  // Create a short server-side session (HTTP-only cookie) and redirect
  // the user back to the client registration options page where they
  // can pick their role. Avoid returning tokens in the URL.
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

  // Optionally set an HTTP-only cookie with minimal data (e.g. id_token)
  // so the client can verify the user by calling the server (GET /me).
  // Keep cookies short-lived in production and set `secure: true` under HTTPS.
  try {
    res.cookie('session', id_token, { httpOnly: true, secure: false, maxAge: 1000 * 60 * 5 }); // 5 minutes
  } catch (e) {
    // If cookie cannot be set for any reason, fall back to redirect without cookie.
    console.warn('Could not set cookie:', e.message || e);
  }

  // Redirect to the client page that shows role selection
  return res.redirect(`${CLIENT_URL}/registration-options`);
})

// Minimal endpoint to accept role selection from the client.
// In a real app, read the session or token to identify the user and persist the role in DB.
app.post('/api/user/role', (req, res) => {
  try {
    const { role } = req.body || {}
    console.log('Received role selection:', role)
    // TODO: persist the role for the authenticated user
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Failed to save role:', err)
    return res.status(500).json({ error: 'Failed to save role' })
  }
})

// TODO treba promijeniti port da slusa na 80 (za http) i/ili 443 (za https)
// korisno: https://stackoverflow.com/a/11745114
const PORT = process.env.PORT || 3000

const start = async (port) => {
  app.listen(port, () => {
    console.log(`Server running on port: http://localhost:${port}`)
  })
}

start(PORT)
