import * as service from './members.service.js';

export async function list(req, res) {
    const members = await service.list(req.member.productId);
    res.json(members);
}

export async function invite(req, res) {
    const member = await service.invite(req.member.productId, req.body);
    res.status(201).json(member);
}

export async function update(req, res) {
    const member = await service.update(req.member.productId, req.params.userId, req.body);
    res.json(member);
}

export async function remove(req, res) {
    await service.remove(req.member.productId, req.params.userId);
    res.status(204).end();
}