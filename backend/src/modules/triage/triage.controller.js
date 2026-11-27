import * as service from './triage.service.js';

export async function list(req, res) {
    const requests = await service.list(req.member.productId);
    res.json(requests);
}

export async function review(req, res) {
    const request = await service.review(req.member.productId, req.params.requestId, req.user.id);
    res.json(request);
}

export async function update(req, res) {
    const request = await service.update(req.member.productId, req.params.requestId, req.user.id, req.body);
    res.json(request);
}

export async function setTags(req, res) {
    const request = await service.setTags(req.member.productId, req.params.requestId, req.body);
    res.json(request);
}

export async function approve(req, res) {
    const request = await service.approve(req.member.productId, req.params.requestId, req.user.id);
    res.json(request);
}

export async function reject(req, res) {
    const request = await service.reject(req.member.productId, req.params.requestId, req.user.id, req.body);
    res.json(request);
}