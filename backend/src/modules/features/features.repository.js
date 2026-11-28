import { pool, query } from '../../db/pool.js';

export async function findBoard(productId) {
    const { rows } = await query(
        `SELECT f.id, f.title, f.status,
                f.story_points AS "storyPoints",
                f.team_id      AS "teamId",
                t.name         AS "teamName",
                f.assignee_id  AS "assigneeId",
                u.name         AS "assigneeName"
           FROM features f
           LEFT JOIN teams t ON t.id = f.team_id
           LEFT JOIN users u ON u.id = f.assignee_id
          WHERE f.product_id = $1
          ORDER BY f.status, f.backlog_position NULLS LAST, f.id`,
        [productId]
    );
    return rows;
}

export async function findUserTeamId(productId, userId) {
    const { rows } = await query(
        'SELECT team_id AS "teamId" FROM product_members WHERE product_id = $1 AND user_id = $2',
        [productId, userId]
    );
    return rows[0]?.teamId ?? null;
}

export async function findFeature(productId, featureId) {
    const { rows } = await query(
        `SELECT f.id, f.title, f.description, f.status,
                f.story_points AS "storyPoints",
                f.team_id      AS "teamId",
                t.name         AS "teamName",
                f.assignee_id  AS "assigneeId",
                u.name         AS "assigneeName",
                rel.name       AS "releaseName",
                rel.objective  AS "releaseObjective"
           FROM features f
           LEFT JOIN teams t ON t.id = f.team_id
           LEFT JOIN users u ON u.id = f.assignee_id
           LEFT JOIN releases rel ON rel.id = f.release_id
          WHERE f.id = $1 AND f.product_id = $2`,
        [featureId, productId]
    );
    return rows[0] ?? null;
}

export async function findStatusLog(featureId) {
    const { rows } = await query(
        `SELECT c.from_status AS "fromStatus",
                c.to_status   AS "status",
                c.changed_at  AS "changedAt",
                u.name        AS "changedBy"
           FROM feature_status_changes c
           JOIN users u ON u.id = c.changed_by
          WHERE c.feature_id = $1
          ORDER BY c.changed_at DESC, c.id DESC`,
        [featureId]
    );
    return rows;
}

export async function changeStatus(featureId, fromStatus, toStatus, userId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { rowCount } = await client.query(
            `UPDATE features
                SET status = $1, updated_at = now()
              WHERE id = $2 AND status = $3
             RETURNING id`,
            [toStatus, featureId, fromStatus]
        );

        if (rowCount === 0) {
            await client.query('ROLLBACK');
            return false;
        }

        await client.query(
            `INSERT INTO feature_status_changes (feature_id, from_status, to_status, changed_by)
             VALUES ($1, $2, $3, $4)`,
            [featureId, fromStatus, toStatus, userId]
        );

        await client.query('COMMIT');
        return true;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}