import { HttpError } from '../../utils/HttpError.js';
import * as repo from './teams.repository.js';

function parseId(value, field) {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new HttpError(400, 'Id inválido', field);
    }
    return id;
}

function parseName(value) {
    const name = typeof value === 'string' ? value.trim() : '';
    if (!name) throw new HttpError(400, 'Indica o nome da equipa', 'name');
    return name;
}

function parseCapacity(value) {
    if (!Number.isInteger(value) || value < 0) {
        throw new HttpError(400, 'A capacidade tem de ser um número inteiro igual ou maior que 0', 'capacity');
    }
    return value;
}

async function findTeamOr404(productId, rawTeamId) {
    const teamId = parseId(rawTeamId, 'teamId');
    const team = await repo.findTeam(productId, teamId);
    if (!team) throw new HttpError(404, 'Equipa não encontrada');
    return team;
}

export async function list(productId) {
    const teams = await repo.findTeams(productId);
    const members = await repo.findTeamMembers(productId);

    return teams.map((team) => ({
        id: team.id,
        name: team.name,
        capacity: team.capacity,
        load: team.load,
        members: members
            .filter((m) => m.teamId === team.id)
            .map((m) => ({ id: m.id, name: m.name, role: m.role })),
    }));
}

export async function create(productId, data = {}) {
    const name = parseName(data.name);
    const capacity = data.capacity === undefined ? 0 : parseCapacity(data.capacity);

    try {
        return await repo.insertTeam(productId, name, capacity);
    } catch (err) {
        if (err.code === '23505') throw new HttpError(409, 'Já existe uma equipa com esse nome', 'name');
        throw err;
    }
}

export async function update(productId, rawTeamId, data = {}) {
    const team = await findTeamOr404(productId, rawTeamId);

    const name = data.name === undefined ? team.name : parseName(data.name);
    const capacity = data.capacity === undefined ? team.capacity : parseCapacity(data.capacity);

    try {
        return await repo.updateTeam(team.id, name, capacity);
    } catch (err) {
        if (err.code === '23505') throw new HttpError(409, 'Já existe uma equipa com esse nome', 'name');
        throw err;
    }
}

export async function remove(productId, rawTeamId) {
    const team = await findTeamOr404(productId, rawTeamId);
    await repo.deleteTeam(team.id);
}