import { HttpError } from '../../utils/HttpError.js';
import * as repo from './features.repository.js';

const FLOW = ['todo', 'in_progress', 'in_review', 'done'];
const LABELS = { todo: 'Por fazer', in_progress: 'Em curso', in_review: 'Em revisão', done: 'Concluído' };

function parseId(value, field) {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new HttpError(400, 'Id inválido', field);
    }
    return id;
}

function allowedStatuses(status) {
    const index = FLOW.indexOf(status);
    return FLOW.filter((s, i) => Math.abs(i - index) === 1);
}

function nextStatus(status) {
    return FLOW[FLOW.indexOf(status) + 1] ?? null;
}

function canChange(role, myTeamId, feature) {
    return role === 'developer' && feature.teamId !== null && feature.teamId === myTeamId;
}

async function findFeatureOr404(productId, rawFeatureId) {
    const featureId = parseId(rawFeatureId, 'featureId');
    const feature = await repo.findFeature(productId, featureId);
    if (!feature) throw new HttpError(404, 'Funcionalidade não encontrada');
    return feature;
}

export async function board(productId, userId, role) {
    const myTeamId = await repo.findUserTeamId(productId, userId);
    const features = await repo.findBoard(productId);

    return {
        myTeamId,
        features: features.map((f) => ({
            id: f.id,
            title: f.title,
            status: f.status,
            storyPoints: f.storyPoints,
            teamId: f.teamId,
            teamName: f.teamName,
            assigneeId: f.assigneeId,
            assigneeName: f.assigneeName,
            canMove: canChange(role, myTeamId, f),
        })),
    };
}

export async function detail(productId, userId, role, rawFeatureId) {
    const feature = await findFeatureOr404(productId, rawFeatureId);
    const myTeamId = await repo.findUserTeamId(productId, userId);
    const statusLog = await repo.findStatusLog(feature.id);

    return {
        id: feature.id,
        title: feature.title,
        description: feature.description,
        status: feature.status,
        storyPoints: feature.storyPoints,
        teamId: feature.teamId,
        teamName: feature.teamName,
        assigneeId: feature.assigneeId,
        assigneeName: feature.assigneeName,
        nextStatus: nextStatus(feature.status),
        allowedStatuses: allowedStatuses(feature.status),
        canChangeStatus: canChange(role, myTeamId, feature),
        statusLog,
    };
}

export async function changeStatus(productId, userId, role, rawFeatureId, data = {}) {
    const status = data.status;
    if (!FLOW.includes(status)) throw new HttpError(400, 'Escolhe um estado válido', 'status');

    const feature = await findFeatureOr404(productId, rawFeatureId);

    const myTeamId = await repo.findUserTeamId(productId, userId);
    if (!canChange(role, myTeamId, feature)) {
        throw new HttpError(403, 'Esta funcionalidade está atribuída a outra equipa');
    }

    if (status === feature.status) {
        throw new HttpError(400, `A funcionalidade já está em "${LABELS[status]}"`, 'status');
    }

    const allowed = allowedStatuses(feature.status);
    if (!allowed.includes(status)) {
        const options = allowed.map((s) => `"${LABELS[s]}"`).join(' ou ');
        throw new HttpError(400, `De "${LABELS[feature.status]}" só podes passar para ${options}`, 'status');
    }

    const changed = await repo.changeStatus(feature.id, feature.status, status, userId);
    if (!changed) {
        throw new HttpError(409, 'O estado foi alterado por outra pessoa. Atualiza a página.');
    }

    return detail(productId, userId, role, feature.id);
}