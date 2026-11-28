import { query } from '../../db/pool.js';

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

export async function createMilestone(productId, name, dueDate) {
    const { rows } = await query(
        `INSERT INTO milestones (product_id, name, due_date)
         VALUES ($1, $2, $3)
         RETURNING ${FIELDS}`,
        [productId, name, dueDate]
    );
    return rows[0];
}