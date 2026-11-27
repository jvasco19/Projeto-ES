import { HttpError } from '../../utils/HttpError.js';
import * as repo from './members.repository.js';

const TEAM_ROLES = ['product_manager', 'project_manager', 'developer'];

function parseId(value, field) {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new HttpError(400, 'Id inválido', field);
    }
    return id;
}

function parseRole(value) {
    if (!TEAM_ROLES.includes(value)) throw new HttpError(400, 'Escolhe um papel válido', 'role');
    return value;
}

async function parseTeamId(productId, value) {
    if (value === null || value === undefined) return null;

    const teamId = parseId(value, 'teamId');
    if (!(await repo.teamExists(productId, teamId))) {
        throw new HttpError(400, 'Equipa inválida', 'teamId');
    }
    return teamId;
}

async function findMemberOr404(productId, rawUserId) {
    const userId = parseId(rawUserId, 'userId');
    const member = await repo.findMember(productId, userId);
    if (!member) throw new HttpError(404, 'Membro não encontrado');
    return member;
}

async function ensureNotLastProductManager(productId) {
    const total = await repo.countProductManagers(productId);
    if (total <= 1) {
        throw new HttpError(409, 'O produto tem de ter pelo menos um Product Manager');
    }
}

export async function list(productId) {
    return repo.findMembers(productId);
}

export async function invite(productId, data = {}) {
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
    if (!email) throw new HttpError(400, 'Indica o email da pessoa', 'email');

    const role = parseRole(data.role);
    const teamId = await parseTeamId(productId, data.teamId);

    const user = await repo.findUserByEmail(email);
    if (!user) throw new HttpError(404, 'Não existe nenhuma conta com esse email', 'email');

    if (await repo.isMember(productId, user.id)) {
        throw new HttpError(409, 'Esta pessoa já é membro do produto', 'email');
    }

    await repo.insertMember(productId, user.id, role, teamId);
    return repo.findMember(productId, user.id);
}

export async function update(productId, rawUserId, data = {}) {
    const member = await findMemberOr404(productId, rawUserId);

    const role = data.role === undefined ? member.role : parseRole(data.role);
    const teamId = data.teamId === undefined ? member.teamId : await parseTeamId(productId, data.teamId);

    if (member.role === 'product_manager' && role !== 'product_manager') {
        await ensureNotLastProductManager(productId);
    }

    await repo.updateMember(productId, member.id, role, teamId);
    return repo.findMember(productId, member.id);
}

export async function remove(productId, rawUserId) {
    const member = await findMemberOr404(productId, rawUserId);

    if (member.role === 'product_manager') {
        await ensureNotLastProductManager(productId);
    }

    await repo.deleteMember(productId, member.id);
}