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

// devolve a data como AAAA-MM-DD, ou null se não existir no calendário (ex.: 2027-02-30)
function parseDate(value) {
    if (typeof value !== 'string') return null;
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
    return format(y, m, d);
}

function parseName(value) {
    const name = typeof value === 'string' ? value.trim() : '';
    if (!name) throw new HttpError(400, 'Indica o nome da milestone', 'name');
    return name;
}

// a data de entrega tem de ser válida e não pode já ter passado
function parseDueDate(value) {
    const dueDate = parseDate(value);
    if (!dueDate) throw new HttpError(400, 'Indica uma data de entrega válida', 'dueDate');
    if (dueDate < today()) throw new HttpError(400, 'A data de entrega já passou', 'dueDate');
    return dueDate;
}

function parseId(value) {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id <= 0) throw new HttpError(400, 'Id inválido', 'milestoneId');
    return id;
}

async function findMilestoneOr404(productId, rawId) {
    const milestone = await repo.findMilestone(productId, parseId(rawId));
    if (!milestone) throw new HttpError(404, 'Milestone não encontrada');
    return milestone;
}

// o nome é único em cada produto
async function save(work) {
    try {
        return await work();
    } catch (err) {
        if (err.code === '23505') throw new HttpError(409, 'Já existe uma milestone com esse nome', 'name');
        throw err;
    }
}

export async function list(productId) {
    return repo.findMilestones(productId);
}

export async function create(productId, data = {}) {
    const name = parseName(data.name);
    const dueDate = parseDueDate(data.dueDate);
    return save(() => repo.createMilestone(productId, name, dueDate));
}

// os campos que não forem enviados mantêm o valor atual
export async function update(productId, rawId, data = {}) {
    const milestone = await findMilestoneOr404(productId, rawId);
    const name = data.name !== undefined ? parseName(data.name) : milestone.name;

    const sameDate = data.dueDate === undefined || parseDate(data.dueDate) === milestone.dueDate;
    const dueDate = sameDate ? milestone.dueDate : parseDueDate(data.dueDate);
    return save(() => repo.updateMilestone(milestone.id, name, dueDate));
}

export async function remove(productId, rawId) {
    const milestone = await findMilestoneOr404(productId, rawId);
    await repo.deleteMilestone(milestone.id);
}