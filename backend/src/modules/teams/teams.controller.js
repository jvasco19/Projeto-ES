import * as service from './teams.service.js';

export async function list(req, res) {
    const teams = await service.list(req.member.productId);
    res.json(teams);
}

export async function create(req, res) {
    const team = await service.create(req.member.productId, req.body);
    res.status(201).json(team);
}

export async function update(req, res) {
    const team = await service.update(req.member.productId, req.params.teamId, req.body);
    res.json(team);
}

export async function remove(req, res) {
    await service.remove(req.member.productId, req.params.teamId);
    res.status(204).end();
}