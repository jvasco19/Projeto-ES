import { HttpError } from '../../utils/HttpError.js';
import * as repo from './stories.repository.js';

const APPROVED = ['approved', 'planned', 'delivered'];
const STORY_FIELDS = { role: 'o papel', goal: 'o objetivo', benefit: 'o benefício' };

function parseId(value, field) {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id <= 0) throw new HttpError(400, 'Id inválido', field);
    return id;
}

function requiredText(value, field, label) {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text) throw new HttpError(400, `Preenche ${label}`, field);
    if (text.length > 500) throw new HttpError(400, 'Texto demasiado longo (máximo 500 caracteres)', field);
    return text;
}

// funcionalidade do produto e a sua User Story
async function load(productId, rawFeatureId, needStory = true) {
    const feature = await repo.findFeature(productId, parseId(rawFeatureId, 'featureId'));
    if (!feature) throw new HttpError(404, 'Funcionalidade não encontrada');

    const story = await repo.findStory(feature.id);
    if (needStory && !story) throw new HttpError(404, 'Esta funcionalidade ainda não tem User Story');
    return { feature, story };
}

async function result(feature) {
    const story = await repo.findStory(feature.id);
    return {
        request: feature.requestId
            ? {
                id: feature.requestId,
                title: feature.requestTitle,
                description: feature.requestDescription,
                status: feature.requestStatus,
                authorName: feature.requestAuthorName,
                createdAt: feature.requestCreatedAt,
            }
            : null,
        story,
        criteria: story ? await repo.findCriteria(story.id) : [],
    };
}

export async function get(productId, rawFeatureId) {
    const { feature } = await load(productId, rawFeatureId, false);
    return result(feature);
}

export async function create(productId, rawFeatureId, userId, data = {}) {
    const { feature, story } = await load(productId, rawFeatureId, false);
    if (story) throw new HttpError(409, 'Esta funcionalidade já tem User Story');

    // se a funcionalidade veio de um pedido, o pedido tem de estar aprovado
    if (feature.requestId && !APPROVED.includes(feature.requestStatus)) {
        throw new HttpError(409, 'O pedido tem de estar aprovado para criar a User Story');
    }

    // papel, objetivo e beneficio sao obrigatorios
    const values = {};
    for (const [field, label] of Object.entries(STORY_FIELDS)) {
        values[field] = requiredText(data[field], field, label);
    }

    await repo.createStory(feature.id, values, userId);
    return result(feature);
}

export async function update(productId, rawFeatureId, data = {}) {
    const { feature, story } = await load(productId, rawFeatureId);

    // so altera os campos enviados
    const values = { ...story };
    for (const [field, label] of Object.entries(STORY_FIELDS)) {
        if (data[field] !== undefined) values[field] = requiredText(data[field], field, label);
    }

    await repo.updateStory(story.id, values);
    return result(feature);
}

export async function addCriterion(productId, rawFeatureId, userId, data = {}) {
    const { feature, story } = await load(productId, rawFeatureId);
    await repo.addCriterion(story.id, requiredText(data.text, 'text', 'o critério'), userId);
    return result(feature);
}

export async function updateCriterion(productId, rawFeatureId, rawCriterionId, data = {}) {
    const { feature, story } = await load(productId, rawFeatureId);
    const text = requiredText(data.text, 'text', 'o critério');

    const updated = await repo.updateCriterion(story.id, parseId(rawCriterionId, 'criterionId'), text);
    if (!updated) throw new HttpError(404, 'Critério não encontrado');
    return result(feature);
}

export async function removeCriterion(productId, rawFeatureId, rawCriterionId) {
    const { feature, story } = await load(productId, rawFeatureId);

    const removed = await repo.removeCriterion(story.id, parseId(rawCriterionId, 'criterionId'));
    if (!removed) throw new HttpError(404, 'Critério não encontrado');
    return result(feature);
}