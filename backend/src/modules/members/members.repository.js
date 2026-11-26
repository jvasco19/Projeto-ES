import { query } from '../../db/pool.js';

export async function findMembers(productId) {
    const { rows } = await query(
        `SELECT u.id, u.name, u.email, pm.role,
                pm.team_id   AS "teamId",
                t.name       AS "teamName",
                pm.joined_at AS "joinedAt"
           FROM product_members pm
           JOIN users u      ON u.id = pm.user_id
           LEFT JOIN teams t ON t.id = pm.team_id
          WHERE pm.product_id = $1 AND pm.role <> 'customer'
          ORDER BY u.name`,
        [productId]
    );
    return rows;
}

export async function findMember(productId, userId) {
    const { rows } = await query(
        `SELECT u.id, u.name, u.email, pm.role,
                pm.team_id   AS "teamId",
                t.name       AS "teamName",
                pm.joined_at AS "joinedAt"
           FROM product_members pm
           JOIN users u      ON u.id = pm.user_id
           LEFT JOIN teams t ON t.id = pm.team_id
          WHERE pm.product_id = $1 AND pm.user_id = $2 AND pm.role <> 'customer'`,
        [productId, userId]
    );
    return rows[0] ?? null;
}

export async function isMember(productId, userId) {
    const { rows } = await query(
        'SELECT 1 FROM product_members WHERE product_id = $1 AND user_id = $2',
        [productId, userId]
    );
    return rows.length > 0;
}

export async function findUserByEmail(email) {
    const { rows } = await query('SELECT id FROM users WHERE email = $1', [email]);
    return rows[0] ?? null;
}

export async function teamExists(productId, teamId) {
    const { rows } = await query(
        'SELECT 1 FROM teams WHERE id = $1 AND product_id = $2',
        [teamId, productId]
    );
    return rows.length > 0;
}

export async function countProductManagers(productId) {
    const { rows } = await query(
        `SELECT COUNT(*)::int AS total
           FROM product_members
          WHERE product_id = $1 AND role = 'product_manager'`,
        [productId]
    );
    return rows[0].total;
}

export async function insertMember(productId, userId, role, teamId) {
    await query(
        `INSERT INTO product_members (product_id, user_id, role, team_id)
         VALUES ($1, $2, $3, $4)`,
        [productId, userId, role, teamId]
    );
}

export async function updateMember(productId, userId, role, teamId) {
    await query(
        `UPDATE product_members
            SET role = $1, team_id = $2
          WHERE product_id = $3 AND user_id = $4`,
        [role, teamId, productId, userId]
    );
}

export async function deleteMember(productId, userId) {
    await query(
        'DELETE FROM product_members WHERE product_id = $1 AND user_id = $2',
        [productId, userId]
    );
}