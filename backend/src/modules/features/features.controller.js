import * as service from './features.service.js';

export async function board(req, res) {
    const result = await service.board(req.member.productId, req.user.id, req.member.role);
    res.json(result);
}

export async function detail(req, res) {
    const feature = await service.detail(req.member.productId, req.user.id, req.member.role, req.params.featureId);
    res.json(feature);
}

export async function changeStatus(req, res) {
    const feature = await service.changeStatus(
        req.member.productId, req.user.id, req.member.role, req.params.featureId, req.body
    );
    res.json(feature);
}

export async function backlog(req, res) {
    const list = await service.backlog(req.member.productId);
    res.json(list);
}

export async function create(req, res) {
    const feature = await service.create(req.member.productId, req.user.id, req.body);
    res.status(201).json(feature);
}

export async function changePriority(req, res) {
    const list = await service.changePriority(req.member.productId, req.params.featureId, req.body);
    res.json(list);
}

export async function changePosition(req, res) {
    const list = await service.changePosition(req.member.productId, req.params.featureId, req.body);
    res.json(list);
}