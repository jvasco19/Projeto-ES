import { pool } from '../../db/pool.js';

export async function createWithOwner({ name, description, linkToken }, userId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(
            `INSERT INTO products (name, description, color, link_token)
             VALUES ($1, $2, 'stream', $3)
             RETURNING id, name, description, color, link_token AS "linkToken"`,
            [name, description, linkToken]
        );
        await client.query(
            `INSERT INTO product_members (product_id, user_id, role)
             VALUES ($1, $2, 'project_manager')`,
            [rows[0].id, userId]
        );
        await client.query('COMMIT');
        return { ...rows[0], role: 'project_manager' };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}