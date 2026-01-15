import express from 'express'
import { google } from 'googleapis'
import * as dotenv from "dotenv"
dotenv.config()

export const router = express.Router()

function newAuthClient() {
    return new google.auth.OAuth2({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: 'localhost:5173/calendar',
    })
}

router.get('/', async (req, res) => {
    const token = req.session.user?.token

    if (!token) {
        res.redirect('/login/auth')
        return
    }

    const client = newAuthClient()
    client.setCredentials(token)
    const calendar = google.calendar({version: 'v3', auth: client})

    const result = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    })
    res.json(result.data.items)
})
