import {query} from '../../db/pool.js';

export async function findRequestsByAuthor(userID) {
    const { rows } = await query(
        `SELECT r.id, r.title, r.status, r.product_id AS "productId",
        p.name AS "productName", r.created_at AS "createdAt"
        FROM feature_requests r
        JOIN products p ON p.id = r.product_id
        WHERE r.author_id = $1
        ORDER BY r.created_at DESC, r.id DESC`,
        [userID]
    );
    return rows;
}

export async function findRequestById(requestID) {
    const { rows } = await query(
        `SELECT r.id, r.author_id AS "authorId", r.title, r.description, r.status, r.category,
        r.rejection_reason AS "rejectionReason", r.product_id AS "productId",
        p.name AS "productName", r.created_at AS "createdAt", rel.name AS "release"
        FROM feature_requests r
        JOIN products p ON p.id = r.product_id
        LEFT JOIN features f ON f.request_id = r.id
        LEFT JOIN releases rel ON rel.id = f.release_id
        WHERE r.id = $1`,
        [requestID]
    );
    return rows[0] ?? null;
}

export async function findAttachmentsByRequest(requestID) {
    const { rows } = await query(
        `SELECT id, file_name AS "fileName"
        FROM attachments
        WHERE request_id = $1
        ORDER BY created_at, id`,
        [requestID]
    );
    return rows;
}

export async function findStatusChangesByRequest(requestID) {
    const { rows } = await query(
        `SELECT to_status AS "status",
        changed_at AS "changedAt"
        FROM request_status_changes
        WHERE request_id = $1
        ORDER BY changed_at, id`,
        [requestID]
    );
    return rows;
}

export async function findNotificationsForAuthor(userID) {
    const { rows } = await query(
        `SELECT c.id, c.request_id AS "requestId", r.title AS "requestTitle",
        c.to_status AS "status", c.changed_at AS "createdAt"
        FROM request_status_changes c
        JOIN feature_requests r ON r.id = c.request_id
        WHERE r.author_id = $1 AND c.changed_by <> $1
        ORDER BY c.changed_at DESC, c.id DESC
        LIMIT 50`,
        [userID]
    );
    return rows;
}