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

// encontrar pedidos públicos com o número de votos e se o utilizador votou em cada um
export async function findPublic(productId, search, userId) {
    const { rows } = await query(
        `SELECT r.id, r.title, r.status, r.created_at AS "createdAt",
                (SELECT COUNT(*) FROM request_votes v WHERE v.request_id = r.id)::int AS "votes",
                EXISTS (SELECT 1 FROM request_votes v WHERE v.request_id = r.id AND v.user_id = $3) AS "votedByMe"
         FROM feature_requests r
         WHERE r.product_id = $1
         AND r.is_public = true
         AND ($2::text IS NULL OR r.title ILIKE '%' || $2 || '%')
         ORDER BY r.created_at DESC
         LIMIT 20`,
         [productId, search, userId]
    );
    return rows;
}

// autor de um pedido ou null se nao exisitr
export async function findRequestAuthor(requestId) {
    const { rows } = await query(
        'SELECT author_id AS "authorId" FROM feature_requests WHERE id = $1',
        [requestId]
    ) ;
    return rows[0]?.authorId ?? null;
}

// guarda os dados do anexo
export async function insertAttachment({ requestId, fileName, mimeType, sizeBytes, storagePath, uploadedBy }) {
    const { rows } = await query(
        `INSERT INTO attachments (request_id, file_name, mime_type, size_bytes, storage_path, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, file_name AS "fileName"`,
        [requestId, fileName, mimeType, sizeBytes, storagePath, uploadedBy]
    );
    return rows[0];
}

// Anexo com o pedido a que pertence
export async function findAttachmentById(attachmentId) {
    const { rows } = await query(
        `SELECT a.file_name AS "fileName", a.mime_type AS "mimeType", a.storage_path AS "storagePath",
                r.author_id AS "authorId", r.product_id AS "productId"
           FROM attachments a
           JOIN feature_requests r ON r.id = a.request_id
          WHERE a.id = $1`,
        [attachmentId]
    );
    return rows[0] ?? null;
}

// Pedido público do produto ou null se não existir ou for de outro produto ou for privado
export async function findPublicRequest(productId, requestId) {
    const { rows } = await query(
        `SELECT id, author_id AS "authorId"
         FROM feature_requests
         WHERE id = $1 AND product_id = $2 AND is_public = true`,
        [requestId, productId]
    );
    return rows[0] ?? null;
}

// regista o voto se o utilizador já tiver votado não faz nada
export async function insertVote(requestId, userId) {
    await query(
        `INSERT INTO request_votes (request_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (request_id, user_id) DO NOTHING`,
        [requestId, userId]
    );
}

// retira o voto se o utilizador não tiver votado não faz nada
export async function deleteVote(requestId, userId) {
    await query(
        'DELETE FROM request_votes WHERE request_id = $1 AND user_id = $2',
        [requestId, userId]
    );
}

// número de votos do pedido
export async function countVotes(requestId) {
    const { rows } = await query(
        `SELECT COUNT(*)::int AS total
           FROM request_votes
          WHERE request_id = $1`,
        [requestId]
    );
    return rows[0].total;
}

// Papel do utilizador no produto ou null se não for membro
export async function findMemberRole(productId, userId) {
    const { rows } = await query(
        'SELECT role FROM product_members WHERE product_id = $1 AND user_id = $2',
        [productId, userId]
    );
    return rows[0]?.role ?? null;
}