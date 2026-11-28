import { query } from '../../db/pool.js';

// a data vai como texto AAAA-MM-DD para não mudar com o fuso horário
const FIELDS = `id, name, to_char(due_date, 'YYYY-MM-DD') AS "dueDate"`;

export async function findMilestones(productId) {
    const { rows } = await query(
        `SELECT ${FIELDS}
           FROM milestones
          WHERE product_id = $1
          ORDER BY due_date, id`,
        [productId]
    );
    return rows;
}

export async function findMilestone(productId, milestoneId) {
    const { rows } = await query(
        `SELECT ${FIELDS}
           FROM milestones
          WHERE id = $1 AND product_id = $2`,
        [milestoneId, productId]
    );
    return rows[0] ?? null;
}

export async function createMilestone(productId, name, dueDate) {
    const { rows } = await query(
        `INSERT INTO milestones (product_id, name, due_date)
         VALUES ($1, $2, $3)
         RETURNING ${FIELDS}`,
        [productId, name, dueDate]
    );
    return rows[0];
}

export async function updateMilestone(milestoneId, name, dueDate) {
    const { rows } = await query(
        `UPDATE milestones
            SET name = $1, due_date = $2
          WHERE id = $3
         RETURNING ${FIELDS}`,
        [name, dueDate, milestoneId]
    );
    return rows[0];
}

// as releases ligadas a esta milestone ficam sem milestone
export async function deleteMilestone(milestoneId) {
    await query('DELETE FROM milestones WHERE id = $1', [milestoneId]);
}