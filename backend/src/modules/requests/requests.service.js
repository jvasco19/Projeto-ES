import { HttpError } from '../../utils/HttpError.js';
import * as repo from './requests.repository.js';

const CATEGORIES = ['reports', 'integrations', 'notifications', 'usability', 'performance', 'security'];

function optionalText(value){
    const text = typeof value === 'string' ? value.trim() : '';
    return text || null;
}

export async function create(productId, authorId, data = {}) {
    const title = data.title?.trim();
    const description = data.description?.trim();
    const category = data.category;

    if (!title) throw new HttpError(400, 'Indica um título', 'title');
    if (!description) throw new HttpError(400, 'Descreve o que precisas', 'description');
    if (!CATEGORIES.includes(category)) throw new HttpError(400, 'Escolhe uma categoria', 'category');

    const importance = data.importance ?? null;
    if (importance !== null && !(Number.isInteger(importance) && importance >= 1 && importance <= 5)) {
        throw new HttpError(400, 'A importancia tem de ser um número de 1 a 5', 'importance');
    }

    return repo.create({
        productId,
        authorId,
        title,
        description,
        category,
        currentWorkflow: optionalText(data.currentWorkflow),
        impact: optionalText(data.impact),
        importance,
    });
}

export async function listPublic(productId, search) {
    const text = typeof search === 'string' ? search.trim() : '';
    return repo.findPublic(productId, text || null);
}