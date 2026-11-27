import { pool, query } from '../../db/pool.js';

async function transaction(work) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await work(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

// pedidos do produto com o autor e a data da ultima mudança de estado
export async function findRequests(productId, requestId = null) {
    const { rows } = await query(
        `SELECT r.id, r.title, r.description, r.status, r.category,
                r.is_public AS "isPublic", r.rejection_reason AS "rejectionReason",
                r.created_at AS "createdAt", u.name AS "authorName",
                COALESCE(
                    (SELECT MAX(c.changed_at) FROM request_status_changes c WHERE c.request_id = r.id),
                    r.created_at
                ) AS "statusChangedAt"
           FROM feature_requests r
           JOIN users u ON u.id = r.author_id
          WHERE r.product_id = $1 AND ($2::bigint IS NULL OR r.id = $2)
          ORDER BY r.created_at DESC, r.id DESC`,
        [productId, requestId]
    );
    return rows;
}

// dados minimos de um pedido do produto para as validacoes
export async function findRequest(productId, requestId) {
    const { rows } = await query(
        `SELECT id, title, description, status
           FROM feature_requests
          WHERE id = $1 AND product_id = $2`,
        [requestId, productId]
    );
    return rows[0] ?? null;
}

export async function findAttachments(requestIds) {
    const { rows } = await query(
        `SELECT request_id AS "requestId", id, file_name AS "fileName"
           FROM attachments
          WHERE request_id = ANY($1::bigint[])
          ORDER BY created_at, id`,
        [requestIds]
    );
    return rows;
}

export async function findTags(requestIds) {
    const { rows } = await query(
        `SELECT rt.request_id AS "requestId", t.name
           FROM request_tags rt
           JOIN tags t ON t.id = rt.tag_id
          WHERE rt.request_id = ANY($1::bigint[])
          ORDER BY t.name`,
        [requestIds]
    );
    return rows;
}

// versoes da mais recente para a mais antiga
export async function findVersions(requestIds) {
    const { rows } = await query(
        `SELECT v.request_id AS "requestId", v.version_number AS "version",
                v.title, v.description, v.created_at AS "createdAt", u.name AS "editedBy"
           FROM request_versions v
           JOIN users u ON u.id = v.edited_by
          WHERE v.request_id = ANY($1::bigint[])
          ORDER BY v.version_number DESC`,
        [requestIds]
    );
    return rows;
}

// muda o estado e regista a mudanca (para o historico e as notificacoes do cliente).
export async function changeStatus(requestId, fromStatus, toStatus, userId, rejectionReason = null) {
    return transaction(async (client) => {
        await client.query(
            `UPDATE feature_requests
                SET status = $1, rejection_reason = $2, updated_at = now()
              WHERE id = $3`,
            [toStatus, rejectionReason, requestId]
        );
        await client.query(
            `INSERT INTO request_status_changes (request_id, from_status, to_status, changed_by)
             VALUES ($1, $2, $3, $4)`,
            [requestId, fromStatus, toStatus, userId]
        );
    });
}

// atualiza descricao, categoria e visibilidade
export async function updateRequest(request, { description, category, isPublic }, userId) {
    return transaction(async (client) => {
        await client.query(
            `UPDATE feature_requests
                SET description = COALESCE($1, description),
                    category    = CASE WHEN $2::boolean THEN $3::request_category ELSE category END,
                    is_public   = COALESCE($4, is_public),
                    updated_at  = now()
              WHERE id = $5`,
            [description ?? null, category !== undefined, category ?? null, isPublic ?? null, request.id]
        );

        if (description !== undefined) {
            await client.query(
                `INSERT INTO request_versions (request_id, version_number, title, description, edited_by)
                 SELECT $1, COALESCE(MAX(version_number), 0) + 1, $2, $3, $4
                   FROM request_versions
                  WHERE request_id = $1`,
                [request.id, request.title, description, userId]
            );
        }
    });
}

// cria as etiquetas que ainda nao existem no produto e substitui as do pedido
export async function setTags(productId, requestId, names) {
    return transaction(async (client) => {
        await client.query(
            `INSERT INTO tags (product_id, name)
             SELECT $1, unnest($2::text[])
             ON CONFLICT (product_id, name) DO NOTHING`,
            [productId, names]
        );
        await client.query('DELETE FROM request_tags WHERE request_id = $1', [requestId]);
        await client.query(
            `INSERT INTO request_tags (request_id, tag_id)
             SELECT $1, id FROM tags WHERE product_id = $2 AND name = ANY($3::text[])`,
            [requestId, productId, names]
        );
    });
}