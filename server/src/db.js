import * as dotenv from "dotenv";

import { Pool } from "pg";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // MAKNUTI KAD SE DEPLOYA NA RENDER
    ssl: {
        rejectUnauthorized: false,
    },
});


export async function getUserWithEmail(email) {
    const res = await pool.query("SELECT * FROM korisnik WHERE email = $1", [
        email,
    ]);
    return res.rows[0];
}

export async function createUser(imeKorisnik, prezimeKorisnik, email, telefon) {
    const res = await pool.query(
        "INSERT INTO korisnik (imeKorisnik, prezKorisnik, email, telefon) VALUES ($1, $2, $3, $4) RETURNING *",
        [imeKorisnik, prezimeKorisnik, email, telefon]
    );
    return res;
}

export async function createSetac(tipClanarina, profilFoto, idKorisnik, lokDjelovanja) {
    const res = await pool.query(
        "INSERT INTO setac (tipClanarina, profilFoto, idKorisnik, lokDjelovanja) VALUES ($1, $2, $3, $4) RETURNING *",
        [tipClanarina, profilFoto, idKorisnik, lokDjelovanja]
    )
    return res
}

export async function createVlasnik(primanjeObavijesti, idKorisnik) {
    const res = await pool.query(
        "INSERT INTO vlasnik (primanjeObavijesti, idKorisnik) VALUES ($1, $2) RETURNING *",
        [primanjeObavijesti, idKorisnik]
    )
    return res
}

export async function checkIsSetac(idKorisnik) {
    const res = await pool.query("SELECT idKorisnik FROM setac WHERE idKorisnik = $1", [idKorisnik]);
    return res.rows.length !== 0;
}

export async function checkIsVlasnik(idKorisnik) {
    const res = await pool.query("SELECT idKorisnik FROM vlasnik WHERE idKorisnik = $1", [idKorisnik]);
    return res.rows.length !== 0;
}

export async function getUserWithRole(userId) {
    const userResult = await pool.query(
        "SELECT * FROM KORISNIK WHERE idKorisnik = $1",
        [userId]
    );

    if (userResult.rows.length === 0) {
        return null;
    }

    const user = userResult.rows[0];

    // Dohvati ulogu i dodatne podatke
    const [setacResult, vlasnikResult] = await Promise.all([
        pool.query("SELECT * FROM SETAC WHERE idKorisnik = $1", [userId]),
        pool.query("SELECT * FROM VLASNIK WHERE idKorisnik = $1", [userId]),
    ]);

    let role = "unassigned";
    let roleData = {};

    if (setacResult.rows.length > 0) {
        role = "setac";
        roleData = setacResult.rows[0];
    } else if (vlasnikResult.rows.length > 0) {
        role = "vlasnik";
        roleData = vlasnikResult.rows[0];
    }

    return {
        ...user,
        role,
        roleData,
    };
}

export async function getUserWithId(idKorisnik) {
    const res = await pool.query(
        "SELECT * FROM korisnik WHERE idKorisnik = $1",
        [idKorisnik]
    );
    return res.rows[0];
}

export async function patchUser(idKorisnik, ime, prezime, telefon, lokDjelovanja) {
    const fieldsToUpdate = [];
    const korisnikArgs = [idKorisnik];
    if (ime)     { fieldsToUpdate.push('imeKorisnik = $' + (korisnikArgs.length + 1));  korisnikArgs.push(ime); }
    if (prezime) { fieldsToUpdate.push('prezKorisnik = $' + (korisnikArgs.length + 1)); korisnikArgs.push(prezime); }
    if (telefon) { fieldsToUpdate.push('telefon = $' + (korisnikArgs.length + 1));      korisnikArgs.push(telefon); }
    
    let korisnikQuery = '';
    if (fieldsToUpdate.length > 0)
        korisnikQuery = `UPDATE korisnik
                SET ${fieldsToUpdate.join(',')}
                WHERE idKorisnik = $1;`;
    
    let lokacijaQuery = '';
    if (lokDjelovanja) {
        lokacijaQuery = `UPDATE setac
            SET lokDjelovanja = $2
            WHERE idKorisnik = $1;`;
    }

    if (korisnikQuery && lokacijaQuery) {
        await pool.query('BEGIN TRANSACTION');
        try {
            await pool.query(korisnikQuery, korisnikArgs);
            await pool.query(lokacijaQuery, [idKorisnik, lokDjelovanja]);
            await pool.query('COMMIT');
        } catch (err) {
            try {
                await pool.query('ROLLBACK');
            } catch (_) { /* Ignoriraj gresku ovdje */ console.error(_); }
            throw err;
        }
    } else if (korisnikQuery) {
        await pool.query(korisnikQuery, korisnikArgs);
    } else if (lokacijaQuery) {
        await pool.query(lokacijaQuery, [idKorisnik, lokDjelovanja]);
    }
}

export async function updateUserProfileImage(idKorisnik, imagePath) {
    const res = await pool.query(
        `UPDATE setac 
         SET profilFoto = $1
            WHERE idKorisnik = $2
            RETURNING *`,
        [imagePath, idKorisnik]
    );
    return res.rows[0];
}

export async function getProsleSetnjeVlasnika(idKorisnik) {
    const res = await pool.query(
        `SELECT r.idRezervacija, s.tipSetnja, s.cijena, s.trajanje, r.datum, r.vrijeme, r.status
            FROM rezervacija r
                JOIN setnja s ON r.idSetnja = s.idSetnja
            WHERE r.idKorisnik = $1 AND r.status = 'odradeno'`,
        [idKorisnik]
    );
    return res.rows;
}

export async function getBuduceSetnjeVlasnika(idKorisnik) {
    // ovo da vrati samo aktivne setnje za vlasnika
    // status = 'potvrdeno' ili 'placeno'
    const res = await pool.query(
        `SELECT r.idRezervacija, s.tipSetnja, s.cijena, s.trajanje, r.datum, r.vrijeme, r.status
            FROM rezervacija r
                JOIN setnja s ON r.idSetnja = s.idSetnja
            WHERE r.idKorisnik = $1 AND r.status IN ('potvrdeno', 'placeno')`,
        [idKorisnik]
    );
    return res.rows;
}

export async function getSetacWithId(idKorisnik) {
    const res = await pool.query(
        `SELECT k.idKorisnik, k.imeKorisnik, k.prezKorisnik, k.email, k.telefon, s.lokDjelovanja, s.tipClanarina, s.profilFoto
            FROM korisnik k
            JOIN setac s ON k.idKorisnik = s.idKorisnik
            WHERE k.idKorisnik = $1`,
        [idKorisnik]
    );
    return res.rows[0];
}

export async function getVlasnikWithId(idKorisnik) {
    const res = await pool.query(
        `SELECT k.idKorisnik, k.imeKorisnik, k.prezKorisnik, k.email, k.telefon, v.primanjeObavijesti
            FROM korisnik k
            JOIN vlasnik v ON k.idKorisnik = v.idKorisnik
            WHERE k.idKorisnik = $1`,
        [idKorisnik]
    );
    return res.rows[0];
}

export async function getAllUsers() {
    const res = await pool.query(
        `SELECT * FROM korisnik`
    );
    return res.rows;
}

export async function getDostupneSetnjeSetaca(idKorisnik) {
    const res = await pool.query(
        `SELECT * FROM setnja WHERE idKorisnik = $1 AND dostupnost = TRUE`,
        [idKorisnik]
    );
    return res.rows;
}

export async function getAllSetaci() {
    const res = await pool.query(
        `SELECT k.idKorisnik, k.imeKorisnik, k.prezKorisnik, s.lokDjelovanja, s.tipClanarina, 
                COALESCE(MIN(st.cijena), 0) AS cijena,
                COALESCE(AVG(r.ocjena), 0) AS ocjena
         FROM korisnik k
         JOIN setac s ON k.idKorisnik = s.idKorisnik
         LEFT JOIN setnja st ON s.idKorisnik = st.idKorisnik
         LEFT JOIN rezervacija rz ON st.idSetnja = rz.idSetnja
         LEFT JOIN recenzija r ON rz.idRezervacija = r.idRezervacija
         GROUP BY k.idKorisnik, k.imeKorisnik, k.prezKorisnik, s.lokDjelovanja, s.tipClanarina`
    );
    return res.rows;
}

export async function createRezervacija(idSetnja, idKorisnik, polaziste, vrijeme, datum, dodNapomene, status, nacinPlacanja) {
    const res = await pool.query(
        `INSERT INTO rezervacija (idSetnja, idKorisnik, polaziste, vrijeme, datum, dodNapomene, status, nacinPlacanja)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
        [idSetnja, idKorisnik, polaziste, vrijeme, datum, dodNapomene, status, nacinPlacanja]
    );
    return res;
}
export async function getAllVlasnici() {
    const res = await pool.query(
        `SELECT k.idKorisnik, k.imeKorisnik, k.prezKorisnik, k.telefon, v.primanjeObavijesti
         FROM korisnik k
            JOIN vlasnik v ON k.idKorisnik = v.idKorisnik`
    );
    return res.rows;
}
// TODO: Implementirati sprema profilne slike
// Funkcija treba:
// 1. Provjeri je li korisnik setac ili vlasnik
// 2. UPDATE odgovarajuću tablicu (setac ili vlasnik) SET profilFoto = imagePath WHERE idKorisnik = userId
// 3. Vrati { success: true }
// 
// export async function updateUserProfileImage(userId, imagePath) {
//     // implementacija...
// }

export async function deleteUserWithId(idKorisnik) {
    const res = await pool.query(
        "DELETE FROM korisnik WHERE idKorisnik = $1 RETURNING *",
        [idKorisnik]
    );
    return res.rows[0];
}

export async function createPas(imePas, pasmina, socijalizacija, razinaEnergije,starost, zdravNapomene, idKorisnik) {
    const res = await pool.query(
        `INSERT INTO pas (imePas, pasmina, socijalizacija, razinaEnergije, starost, zdravNapomene, idKorisnik)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
        [imePas, pasmina, socijalizacija, razinaEnergije, starost, zdravNapomene, idKorisnik]
    );
    return res.rows[0];
}

export async function deletePas(idPas) {
    const res = await pool.query(
        `DELETE FROM pas WHERE idPas = $1`,
        [idPas]
    );
    return res;
}

export async function getPsiByKorisnikId(idKorisnik) {
    const res = await pool.query(
        `SELECT * FROM pas WHERE idKorisnik = $1`,
        [idKorisnik]
    );
    return res.rows;
}


export async function createSetnja(cijena, tipSetnja, trajanje, idKorisnik) {
    const res = await pool.query(
        `INSERT INTO setnja (cijena, tipSetnja, trajanje, dostupnost, idKorisnik)
         VALUES ($1, $2, $3, TRUE, $4)
         RETURNING *`,
        [cijena, tipSetnja, trajanje, idKorisnik]
    );
    return res.rows[0];
}

export async function updateSetnja(idSetnja, cijena, tipSetnja, trajanje) {
    const res = await pool.query(
        `UPDATE setnja 
         SET cijena = $1, tipSetnja = $2, trajanje = $3
         WHERE idSetnja = $4
         RETURNING *`,
        [cijena, tipSetnja, trajanje, idSetnja]
    );
    return res.rows[0];
}

export async function deleteSetnja(idSetnja) {
    const res = await pool.query(
        `DELETE FROM setnja WHERE idSetnja = $1`,
        [idSetnja]
    );
    return res;
}

export async function getAverageRating(idKorisnik) {
    const res = await pool.query(
        `SELECT AVG(ocjena) as avgOcjena, COUNT(ocjena) as cntOcjena
            FROM (SELECT idSetnja FROM setnja WHERE idKorisnik = $1) as s
                NATURAL JOIN rezervacija
                NATURAL JOIN recenzija`,
        [idKorisnik]
    );
    const avgOcjena = res.rows[0].avgocjena;
    const cntOcjena = res.rows[0].cntocjena;
    return [avgOcjena !== null ? +avgOcjena : null, +cntOcjena];
}

export async function getAllRatings(idKorisnik) {
    const res = await pool.query(
        `SELECT idrecenzija, ocjena, tekst, fotografija, imekorisnik, prezkorisnik
            FROM (SELECT idSetnja FROM setnja WHERE idKorisnik = $1) as s
                NATURAL JOIN rezervacija
                NATURAL JOIN recenzija
                JOIN korisnik k ON k.idKorisnik = $1`,
        [idKorisnik]
    );
    return res.rows;
}

export async function deleteRezervacija(idRezervacija) {
    const res = await pool.query(
        `DELETE FROM rezervacija WHERE idRezervacija = $1`,
        [idRezervacija]
    );
    return res;
}

export async function getSetacNotifikacije(idKorisnik) {
    const res = await pool.query(
        `SELECT r.idRezervacija, s.tipSetnja, s.cijena, s.trajanje, k.imeKorisnik, k.prezKorisnik, r.datum, r.vrijeme, r.polaziste, r.dodNapomene
            FROM rezervacija r
                JOIN setnja s ON r.idSetnja = s.idSetnja
                JOIN korisnik k ON r.idKorisnik = k.idKorisnik
            WHERE s.idKorisnik = $1 AND r.status = 'na cekanju'`,
        [idKorisnik]
    );
    return res.rows;
}

export async function changeRezervacijaStatus(idKorisnik, idRezervacija, newStatus) {
    const res = await pool.query(
        `UPDATE rezervacija r
            SET status = $3
            WHERE r.idRezervacija = $1
                AND r.status = 'na cekanju'
                AND EXISTS (SELECT * FROM setnja s WHERE s.idSetnja = r.idSetnja AND s.idKorisnik = $2)
            RETURNING idRezervacija`,
        [idRezervacija, idKorisnik, newStatus]
    );
    return res.rows.length !== 0;
}

// ovo je nova funkcija za vlasnika da moze oznacit rezervaciju kao odradenu
// vidite jesam li dobro napisala
export async function changeRezervacijaStatusVlasnik(idKorisnik, idRezervacija, newStatus) {
    const res = await pool.query(
        `UPDATE rezervacija r
            SET status = $3
            WHERE r.idRezervacija = $1
                AND r.idKorisnik = $2
                AND (r.status = 'potvrdeno' OR r.status = 'placeno')
            RETURNING idRezervacija`,
        [idRezervacija, idKorisnik, newStatus]
    );
    return res.rows.length !== 0;
}

export async function getVlasnikNotifikacije(idKorisnik) {
    const res = await pool.query(
        `SELECT idRezervacija, status, tipSetnja, cijena, trajanje, datum, vrijeme
            FROM rezervacija r
                JOIN setnja s ON s.idSetnja = r.idSetnja
            WHERE r.idKorisnik = $1 AND (r.status = 'potvrdeno' OR r.status = 'odbijeno')`,
        [idKorisnik]
    );
    return res.rows;
}

export async function getRezervacija(idKorisnik, idRezervacija) {
    const res = await pool.query(
        `SELECT idRezervacija, datum, vrijeme, polaziste, nacinPlacanja, status, setnja.tipSetnja, setnja.cijena, setnja.trajanje, dodNapomene
            FROM rezervacija join setnja on rezervacija.idSetnja = setnja.idSetnja
            WHERE idRezervacija = $1 AND rezervacija.idKorisnik = $2`,
        [idKorisnik, idRezervacija]
    );
    return res.rows[0];
}

export async function getSetnjeSetaca(idKorisnik) {
    // ovo da vrati samo aktivne setnje za setaca
    // status = potvrdeno ili placeno
    const res = await pool.query(
        `SELECT s.idSetnja, r.datum, r.vrijeme, r.polaziste, s.tipSetnja, s.trajanje, s.cijena, r.dodNapomene,
                r.idKorisnik, k.imeKorisnik, k.prezKorisnik, r.status, r.idRezervacija
            FROM setnja s
                JOIN rezervacija r ON s.idSetnja = r.idSetnja
                JOIN korisnik k ON r.idKorisnik = k.idKorisnik
            WHERE s.idKorisnik = $1 AND (r.status = 'placeno' OR r.status = 'potvrdeno')
            ORDER BY r.datum, r.vrijeme`,
        [idKorisnik]
    );
    return res.rows;
}

// ovo da vrati samo prosle (odradene) setnje za setaca
// status = odradeno
export async function getProsleSetnjeSetaca(idKorisnik) {
    const res = await pool.query(
        `SELECT s.idSetnja, r.datum, r.vrijeme, r.polaziste, s.tipSetnja, s.trajanje, s.cijena, r.dodNapomene,
                r.idKorisnik, k.imeKorisnik, k.prezKorisnik, r.status, r.idRezervacija
            FROM setnja s
                JOIN rezervacija r ON s.idSetnja = r.idSetnja
                JOIN korisnik k ON r.idKorisnik = k.idKorisnik
            WHERE s.idKorisnik = $1 AND r.status = 'odradeno'
            ORDER BY r.datum DESC, r.vrijeme`,
        [idKorisnik]
    );
    return res.rows;
}

export async function createRecenzija(idRezervacija, ocjena, tekst, fotografija) {
    const res = await pool.query(
        `INSERT INTO recenzija (idRezervacija, ocjena, tekst, fotografija)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
        [idRezervacija, ocjena, tekst, fotografija]
    );
    return res.rows[0];
}

// provjera: korisnik mora biti ulogiran i mora biti vlasnik i mora biti vlasnik te rezervacije (postoji idKorisnik u REZERVACIJA)
// provjera: rezervacija mora biti u statusu "potvrdeno", nacinPlacanja mora biti "kreditna kartica"
// ako sve prode, updateat rezervaciju da bude u statusu "placeno"
export async function platiRezervaciju(idKorisnik, idRezervacija) {
    const res = await pool.query(
        `UPDATE rezervacija r
            SET status = 'placeno'
            WHERE r.idRezervacija = $1
                AND r.idKorisnik = $2
                AND r.status = 'potvrdeno'
                AND r.nacinPlacanja = 'kreditna kartica'
            RETURNING idRezervacija`,
        [idRezervacija, idKorisnik]
    );
    return res.rows.length !== 0;
}

export async function getChatParticipantsForVlasnik(idKorisnik) {
    const res = await pool.query(
        `SELECT idRezervacija, s.idSetnja, st.idKorisnik as otherId, (imeKorisnik || ' ' || prezKorisnik) as otherName, tipSetnja, datum, vrijeme
            FROM rezervacija r
                JOIN setnja s ON s.idSetnja = r.idSetnja
                JOIN setac st ON st.idKorisnik = s.idKorisnik
                JOIN korisnik k ON st.idKorisnik = k.idKorisnik
            WHERE r.idKorisnik = $1`,
        [idKorisnik]
    )
    return res.rows;
}

export async function getChatParticipantsForSetac(idKorisnik) {
    const res = await pool.query(
        `SELECT idRezervacija, s.idSetnja, k.idKorisnik as otherId, (imeKorisnik || ' ' || prezKorisnik) as otherName, tipSetnja, datum, vrijeme
            FROM rezervacija r
                JOIN setnja s ON s.idSetnja = r.idSetnja
                JOIN korisnik k ON r.idKorisnik = k.idKorisnik
            WHERE s.idKorisnik = $1`,
        [idKorisnik]
    )
    return res.rows;
}

export async function getOtherChatParticipantIdForSetac(idRezervacija, idKorisnik) {
    const res = await pool.query(
        `SELECT r.idKorisnik
            FROM rezervacija r
                JOIN setnja s ON s.idSetnja = r.idSetnja
            WHERE r.idRezervacija = $1 AND s.idKorisnik = $2`,
        [idRezervacija, idKorisnik]
    );
    return res.rows.length > 0 ? res.rows[0].idkorisnik : undefined;
}

export async function getOtherChatParticipantIdForVlasnik(idRezervacija, idKorisnik) {
    const res = await pool.query(
        `SELECT s.idKorisnik
            FROM rezervacija r
                JOIN setnja s ON s.idSetnja = r.idSetnja
            WHERE r.idRezervacija = $1 AND r.idKorisnik = $2`,
        [idRezervacija, idKorisnik]
    );
    return res.rows.length > 0 ? res.rows[0].idkorisnik : undefined;
}

export async function getMjesecnaClanarina() {
    const res = await pool.query("SELECT iznos FROM clanarina WHERE clanarina = 'cijenaMjClanarina'");
    return +res.rows[0].iznos;
}

export async function getGodisnjaClanarina() {
    const res = await pool.query("SELECT iznos FROM clanarina WHERE clanarina = 'cijenaGodClanarina'");
    return +res.rows[0].iznos;
}

export async function setMjesecnaClanarina(iznos) {
    await pool.query("UPDATE clanarina SET iznos = $1 WHERE clanarina = 'cijenaMjClanarina'", [iznos]);
}

export async function setGodisnjaClanarina(iznos) {
    await pool.query("UPDATE clanarina SET iznos = $1 WHERE clanarina = 'cijenaGodClanarina'", [iznos]);
}

export async function testConnection() {
    try {
        const rows = await pool.query("SELECT * FROM korisnik");
        console.log("Database connected:", rows.rows.length, "rows in korisnik table");
    } catch (err) {
        console.error("Database connection error:", err);
    }
}
