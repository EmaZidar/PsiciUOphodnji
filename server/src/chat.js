import express from 'express'
import * as dotenv from "dotenv"
import * as db from "./db.js";
dotenv.config()

import { StreamChat } from 'stream-chat';

const chatClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY,
    process.env.STREAM_SECRET_KEY,
);

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
    try {
        let chatParticipants
        if (req.session.user.role === 'vlasnik')
            chatParticipants = await db.getChatParticipantsForVlasnik(req.session.user.id);
        else if (req.session.user.role === 'setac')
            chatParticipants = await db.getChatParticipantsForSetac(req.session.user.id);
        else
            return res.status(401).json({ error: 'Invalid user role' });

        return chatParticipants;
    } catch (err) {
        console.error('Error in /api/chats', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

async function getChatChannel(req, res, next) {
    const idRezervacija = req.params.idRezervacija;
    const myKorisnikId = req.session.user.id;

    let otherKorisnikId;
    try {
        if (req.session.user.role === 'setac')
            otherKorisnikId = await db.getOtherChatParticipantIdForSetac(idRezervacija, myKorisnikId);
        else if (req.session.user.role === 'vlasnik')
            otherKorisnikId = await db.getOtherChatParticipantIdForVlasnik(idRezervacija, myKorisnikId);
        else
            return res.status(401).json({ error: 'Invalid user role' });
        
        if (!otherKorisnikId)
            return res.status(404).json({ error: 'Ne postoji takva rezervacija' });

        const channel = chatClient.channel('messaging', {
            members: [myKorisnikId, otherKorisnikId]
        });

        await channel.create();

        req.chatChannel = channel;

    } catch (err) {
        console.error('Error in fetching chat channel', err);
        return res.status(500).json({ error: 'Internal server error' });
    }

    return next();
}

// GET api/chats/:idrezervacija/messages 
//  Dohvatiti idRezervacija iz params
//  Dohvatiti idkorisnik prijavljenog korisnika
//  Provjeriti postoji li rezervacija
//  Provjeriti da je korisnik sudionik rezervacije
//  Dohvatiti sve poruke za rezervaciju
//  Sortirati poruke po vrijemeSlanja ASC
//  Vratiti poruke kao JSON
// trebat ces nac tocno kak se zovu polja u tablicama iz fronta u ChatWindow.jsx
router.get('/:idRezervacija/messages', getChatChannel, async (req, res) => {
    const defaultMessageCountToLoad = 50;
    
    const result = await req.chatChannel.query({
        messages: defaultMessageCountToLoad
    });

    const formattedMessages = result.messages.map(m => ({
        vrijemeslanja: m.created_at,
        posiljatelj: m.user,
        tekst: m.text,
    }));

    return res.status(200).json(formattedMessages);
});

// POST /api/chats/:idrezervacija/messages ---
//  Dohvatiti idRezervacija iz params
//  Dohvatiti tekst poruke iz body-ja
//  Dohvatiti idkorisnik prijavljenog korisnika
//  Provjeriti postoji li rezervacija
//  Provjeriti da je korisnik sudionik rezervacije
//  Spremiti poruku u bazu (vrijemeSlanja = NOW())
//  Vratiti kreiranu poruku kao JSON
router.post('/:idRezervacije/messages', getChatChannel, async (req, res) => {
    await req.chatChannel.sendMessage({
        text: req.body.tekst,
        user_id: req.session.user.id,
    });

    return res.sendStatus(204); // no body
});