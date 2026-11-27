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