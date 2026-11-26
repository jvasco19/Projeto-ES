import { query } from '../../db/pool.js';

export async function findTeams(productId) {
    const { rows } = await query(
        `SELECT t.id, t.name, t.capacity,
                COALESCE(
                    (SELECT SUM(f.story_points)
                       FROM features f
                      WHERE f.team_id = t.id AND f.status <> 'done'),
                    0
                )::int AS "load"
           FROM teams t
          WHERE t.product_id = $1
          ORDER BY t.name`,
        [productId]
    );
    return rows;
}

export async function findTeamMembers(productId) {
    const { rows } = await query(
        `SELECT pm.team_id AS "teamId", u.id, u.name, pm.role
           FROM product_members pm
           JOIN users u ON u.id = pm.user_id
          WHERE pm.product_id = $1 AND pm.team_id IS NOT NULL
          ORDER BY u.name`,
        [productId]
    );
    return rows;
}

export async function findTeam(productId, teamId) {
    const { rows } = await query(
        `SELECT id, name, capacity
           FROM teams
          WHERE id = $1 AND product_id = $2`,
        [teamId, productId]
    );
    return rows[0] ?? null;
}

export async function insertTeam(productId, name, capacity) {
    const { rows } = await query(
        `INSERT INTO teams (product_id, name, capacity)
         VALUES ($1, $2, $3)
         RETURNING id, name, capacity`,
        [productId, name, capacity]
    );
    return rows[0];
}

export async function updateTeam(teamId, name, capacity) {
    const { rows } = await query(
        `UPDATE teams
            SET name = $1, capacity = $2
          WHERE id = $3
         RETURNING id, name, capacity`,
        [name, capacity, teamId]
    );
    return rows[0];
}

export async function deleteTeam(teamId) {
    await query('DELETE FROM teams WHERE id = $1', [teamId]);
}