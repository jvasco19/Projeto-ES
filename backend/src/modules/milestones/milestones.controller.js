import * as service from './milestones.service.js';

export async function list(req, res) {
    const milestones = await service.list(req.member.productId);
    res.json(milestones);
}

export async function create(req, res) {
    const milestone = await service.create(req.member.productId, req.body);
    res.status(201).json(milestone);
}