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

export async function findUserByEmail(email) {
    const res = await pool.query("SELECT * FROM korisnik WHERE email = $1", [
        email,
    ]);
    return res.rows[0];
}

export async function createUser(imeKorisnik, prezimeKorisnik, email, telefon) {
    const res = await pool.query(
        "INSERT INTO korisnik (imeKorisnik, prezimeKorisnik, email, telefon) VALUES ($1, $2, $3, $4) RETURNING *",
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
    const [adminResult, setacResult, vlasnikResult] = await Promise.all([
        pool.query("SELECT * FROM ADMINISTRATOR WHERE idKorisnik = $1", [
            userId,
        ]),
        pool.query("SELECT * FROM SETAC WHERE idKorisnik = $1", [userId]),
        pool.query("SELECT * FROM VLASNIK WHERE idKorisnik = $1", [userId]),
    ]);

    let role = "unassigned";
    let roleData = {};

    if (adminResult.rows.length > 0) {
        role = "admin";
        roleData = adminResult.rows[0];
    } else if (setacResult.rows.length > 0) {
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

export async function getUserById(idKorisnik) {
    const res = await pool.query(
        "SELECT * FROM korisnik WHERE idKorisnik = $1",
        [idKorisnik]
    );
    return res.rows[0];
}

export async function testConnection() {
    try {
        const rows = await pool.query("SELECT NOW()");
        console.log("Database connected:", rows.rows[0]);
    } catch (err) {
        console.error("Database connection error:", err);
    }
}
