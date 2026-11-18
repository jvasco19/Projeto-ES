import {pool, query} from '../../db/pool.js';

export async function create({productId, authorId, title, description, category, currentWorkflow, impact, importance}) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { rows } = await client.query(
            `INSERT INTO feature_requests
             (product_id, author_id, title, description, category, current_workflow, impact, importance)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, product_id as "productId", title, description, category, status,
                       current_workflow AS "currentWorkflow", impact, importance, created_at AS "createdAt"`,
            [productId, authorId, title, description, category, currentWorkflow, impact, importance]
        );
        const request = rows[0];

        await client.query(
            `INSERT INTO request_status_changes (request_id, from_status, to_status, changed_by)
             VALUES ($1, NULL, 'submitted', $2)`,
             [request.id, authorId]
        );

        await client.query(
            `INSERT INTO request_versions (request_id, version_number, title, description, edited_by)
             VALUES ($1, 1, $2, $3, $4)`,
            [request.id, title, description, authorId]
        );

        await client.query('COMMIT');
        return request;
    } catch (err){
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

// encontrar pedidos públicos
export async function findPublic(productId, search) {
    const { rows } = await query(
        `SELECT id, title, status, created_at AS "createdAt"
         FROM feature_requests
         WHERE product_id = $1
         AND is_public = true
         AND ($2::text IS NULL OR title ILIKE '%' || $2 || '%')
         ORDER BY created_at DESC
         LIMIT 20`,
         [productId, search]
    );
    return rows;
}