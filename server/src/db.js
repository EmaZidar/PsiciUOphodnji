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
    const res = await pool.query( "SELECT * FROM users WHERE email = $1", [email]);
    return res.rows[0];
}

export async function createUser(firstName, lastName, email, phoneNumber) {
    const res = await pool.query(
        "INSERT INTO users (firstName, lastName, email, phoneNumber) VALUES ($1, $2, $3, $4) RETURNING *",
        [firstName, lastName, email, phoneNumber]
    );
    return res;
}

export async function getUserById(id) {
    const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return res.rows[0];
}

export async function testConnection() {
    try {
        const rows = await pool.query("SELECT NOW()");
        console.log("Database connected:", rows.rows[0]);
    } catch (err) {
        console.error("Database connection error:", err);
    }
};