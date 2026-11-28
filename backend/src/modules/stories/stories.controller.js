import * as service from './stories.service.js';

export async function get(req, res) {
    const result = await service.get(req.member.productId, req.params.featureId);
    res.json(result);
}

export async function create(req, res) {
    const result = await service.create(req.member.productId, req.params.featureId, req.user.id, req.body);
    res.status(201).json(result);
}

export async function update(req, res) {
    const result = await service.update(req.member.productId, req.params.featureId, req.body);
    res.json(result);
}

export async function addCriterion(req, res) {
    const result = await service.addCriterion(req.member.productId, req.params.featureId, req.user.id, req.body);
    res.status(201).json(result);
}

export async function updateCriterion(req, res) {
    const result = await service.updateCriterion(
        req.member.productId, req.params.featureId, req.params.criterionId, req.body
    );
    res.json(result);
}

export async function removeCriterion(req, res) {
    const result = await service.removeCriterion(req.member.productId, req.params.featureId, req.params.criterionId);
    res.json(result);
}