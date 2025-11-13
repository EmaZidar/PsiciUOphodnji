import * as dotenv from "dotenv"
dotenv.config()
import express from "express"
import session from "express-session"
import fetch from "node-fetch"
import * as db from "./db.js"

// Test database connection on startup
db.testConnection()

const app = express()
app.use(express.json())

app.use(session({
  secret: 'Rainbow feline',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 4, // 4 hours session expiry
  }
}))

const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_ACCESS_TOKEN_URL = process.env.GOOGLE_ACCESS_TOKEN_URL

// FIX: Use normal URLs, not URL-encoded
const GOOGLE_CALLBACK_URL = "http://localhost:8000/google/callback"
const GOOGLE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
]

app.get("/login/auth", async (_req, res) => {
  const state = "some_state"
  
  // FIX: URL encode the scopes and callback URL when building the OAuth URL
  const encodedScopes = GOOGLE_OAUTH_SCOPES.map(scope => encodeURIComponent(scope)).join(" ")
  const encodedCallback = encodeURIComponent(GOOGLE_CALLBACK_URL)
  
  const GOOGLE_OAUTH_CONSENT_SCREEN_URL = 
    `${GOOGLE_OAUTH_URL}?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodedCallback}&` +
    `access_type=offline&` +
    `response_type=code&` +
    `state=${state}&` +
    `scope=${encodedScopes}`
  
  console.log("Redirecting to:", GOOGLE_OAUTH_CONSENT_SCREEN_URL)
  res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL)
})

app.get("/google/callback", async (req, res) => {
  console.log("Callback received:", req.query)
  const { code } = req.query

  const data = {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_CALLBACK_URL, // Use the variable
    grant_type: "authorization_code",
  }

  console.log("Exchanging code for token:", data)

  try {
    const response = await fetch(GOOGLE_ACCESS_TOKEN_URL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    })

    const access_token_data = await response.json()
    console.log("Token response:", access_token_data)
    
    const { id_token } = access_token_data

    // Verify and extract the information in the id token
    const token_info_response = await fetch(
      `${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`
    )
    const token_info_data = await token_info_response.json()
    const { email, name } = token_info_data

    req.session.user = { email: email, name: name }

    res.status(token_info_response.status).redirect('/register')
  } catch (error) {
    console.error("Error in callback:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.get("/testboard", (req, res) => {
  if (req.session.user)
    res.send(`Welcome back, ${req.session.user.name}`)
  else
    res.send('Access denied. Please log in first.')
})

const PORT = process.env.PORT || 8000
const start = async (port) => {
  app.listen(port, () => {
    console.log(`Server running on port: http://localhost:${port}`)
  })
}

start(PORT)