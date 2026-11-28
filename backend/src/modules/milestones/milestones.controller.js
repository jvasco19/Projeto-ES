import * as service from './milestones.service.js';

export async function list(req, res) {
    const milestones = await service.list(req.member.productId);
    res.json(milestones);
}

export async function create(req, res) {
    const milestone = await service.create(req.member.productId, req.body);
    res.status(201).json(milestone);
}

export async function update(req, res) {
    const milestone = await service.update(req.member.productId, req.params.milestoneId, req.body);
    res.json(milestone);
}

export async function remove(req, res) {
    await service.remove(req.member.productId, req.params.milestoneId);
    res.status(204).end();
}