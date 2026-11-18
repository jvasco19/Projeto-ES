import * as service from './requests.service.js';

export async function create(req, res) {
    const request = await service.create(req.member.productId, req.user.id, req.body);
    res.status(201).json(request);
}

export async function listPublic(req, res) {
    const requests = await service.listPublic(req.member.productId, req.query.search);
    res.json(requests);
}