import { query } from "../../db/pool.js";

// funcionalidade do produto com o pedido de origem (se existir)
export async function findFeature(productId, featureId) {
    const { rows } = await query(
        `SELECT f.id, f.request_id AS "requestId", r.title AS "requestTitle", r.status AS "requestStatus"
         FROM features f
         LEFT JOIN feature_requests r ON r.id = f.request_id
         WHERE f.id = $1 AND f.product_id = $2`,
        [featureId, productId]
    );
    return rows[0] ?? null;
}

export async function findStory(featureId) {
    const { rows } = await query(
        `SELECT s.id, s.role, s.goal, s.benefit, s.state, s.ai_generated AS "aiGenerated",
                u.name AS "createdBy", s.created_at   AS "createdAt", s.updated_at   AS "updatedAt"
         FROM user_stories s
         JOIN users u ON u.id = s.created_by
         WHERE s.feature_id = $1`,
        [featureId]
    );
    return rows[0] ?? null;
}

export async function findCriteria(storyId) {
    const { rows } = await query(
        `SELECT id, position, text
         FROM acceptance_criteria
         WHERE story_id = $1
         ORDER BY position, id`,
        [storyId]
    );
    return rows;
}

export async function createStory(featureId, { role, goal, benefit }, userId) {
    await query(
        `INSERT INTO user_stories (feature_id, role, goal, benefit, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [featureId, role, goal, benefit, userId]
    );
}

export async function updateStory(storyId, { role, goal, benefit }) {
    await query(
        `UPDATE user_stories
            SET role = $1, goal = $2, benefit = $3, updated_at = now()
          WHERE id = $4`,
        [role, goal, benefit, storyId]
    );
}

export async function addCriterion(storyId, text, userId) {
    await query(
        `INSERT INTO acceptance_criteria (story_id, position, text, created_by)
         SELECT $1, COALESCE(MAX(position), 0) + 1, $2, $3
           FROM acceptance_criteria
          WHERE story_id = $1`,
        [storyId, text, userId]
    );
}

export async function updateCriterion(storyId, criterionId, text) {
    const { rowCount } = await query(
        `UPDATE acceptance_criteria
            SET text = $1, updated_at = now()
          WHERE id = $2 AND story_id = $3`,
        [text, criterionId, storyId]
    );
    return rowCount > 0;
}

export async function removeCriterion(storyId, criterionId) {
    const { rowCount } = await query(
        'DELETE FROM acceptance_criteria WHERE id = $1 AND story_id = $2',
        [criterionId, storyId]
    );
    return rowCount > 0;
}