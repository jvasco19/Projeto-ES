import { HttpError } from '../../utils/HttpError.js';
import * as repo from './milestones.repository.js';

// data no formato AAAA-MM-DD
function format(y, m, d) {
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// data de hoje (hora local do servidor)
function today() {
    const d = new Date();
    return format(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

// devolve a data como AAAA-MM-DD ou null se nao existir no calendario
function parseDate(value) {
    if (typeof value !== 'string') return null;
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
    return format(y, m, d);
}

export async function list(productId) {
    return repo.findMilestones(productId);
}

export async function create(productId, data = {}) {
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    if (!name) throw new HttpError(400, 'Indica o nome da milestone', 'name');

    const dueDate = parseDate(data.dueDate);
    if (!dueDate) throw new HttpError(400, 'Indica uma data de entrega válida', 'dueDate');
    if (dueDate < today()) throw new HttpError(400, 'A data de entrega já passou', 'dueDate');

    try {
        return await repo.createMilestone(productId, name, dueDate);
    } catch (err) {
        if (err.code === '23505') throw new HttpError(409, 'Já existe uma milestone com esse nome', 'name');
        throw err;
    }
}