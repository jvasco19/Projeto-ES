import { query } from "../../db/pool.js";

export async function findByEmail(email){
    const { rows } = await query(
        'SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1',
        [email]
    );
    return rows[0];
}

export async function insert({name, email, passwordHash}) {
    const { rows } = await query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, created_at`,
        [name, email, passwordHash]
    );
    return rows[0];
}