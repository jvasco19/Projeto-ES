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
        `SELECT f.id, f.title, f.description, f.status, f.impact, f.effort,
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

const BACKLOG_SELECT = `
    SELECT f.id, f.title, f.status, f.impact, f.effort, f.priority,
           f.story_points     AS "storyPoints",
           f.backlog_position AS "position",
           f.team_id          AS "teamId",
           t.name             AS "teamName",
           f.assignee_id      AS "assigneeId",
           u.name             AS "assigneeName",
           r.name             AS "releaseName",
           EXISTS (SELECT 1 FROM user_stories us WHERE us.feature_id = f.id) AS "hasStory"
      FROM features f
      LEFT JOIN teams t    ON t.id = f.team_id
      LEFT JOIN users u    ON u.id = f.assignee_id
      LEFT JOIN releases r ON r.id = f.release_id`;

export async function findBacklog(productId) {
    const { rows } = await query(
        `${BACKLOG_SELECT}
          WHERE f.product_id = $1
          ORDER BY f.backlog_position NULLS LAST, f.id`,
        [productId]
    );
    return rows;
}

export async function findBacklogItem(productId, featureId) {
    const { rows } = await query(
        `${BACKLOG_SELECT}
          WHERE f.product_id = $1 AND f.id = $2`,
        [productId, featureId]
    );
    return rows[0] ?? null;
}

export async function findBacklogIds(productId) {
    const { rows } = await query(
        'SELECT id FROM features WHERE product_id = $1 ORDER BY backlog_position NULLS LAST, id',
        [productId]
    );
    return rows.map((row) => row.id);
}

async function writeOrder(client, ids) {
    for (let i = 0; i < ids.length; i++) {
        await client.query('UPDATE features SET backlog_position = $1 WHERE id = $2', [i + 1, ids[i]]);
    }
}

export async function insertFeature(productId, title, description, userId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(
            `INSERT INTO features (product_id, title, description, backlog_position)
             VALUES ($1, $2, $3,
                     (SELECT COALESCE(MAX(backlog_position), 0) + 1 FROM features WHERE product_id = $1))
             RETURNING id`,
            [productId, title, description]
        );
        const featureId = rows[0].id;
        await client.query(
            `INSERT INTO feature_status_changes (feature_id, from_status, to_status, changed_by)
             VALUES ($1, NULL, 'todo', $2)`,
            [featureId, userId]
        );
        await client.query('COMMIT');
        return featureId;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export async function updatePriority(productId, featureId, impact, effort) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            'UPDATE features SET impact = $1, effort = $2, updated_at = now() WHERE id = $3',
            [impact, effort, featureId]
        );
        const { rows } = await client.query(
            `SELECT id FROM features
              WHERE product_id = $1
              ORDER BY priority DESC NULLS LAST, backlog_position NULLS LAST, id`,
            [productId]
        );
        await writeOrder(client, rows.map((row) => row.id));
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export async function saveBacklogOrder(ids) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await writeOrder(client, ids);
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}