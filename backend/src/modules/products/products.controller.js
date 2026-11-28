import * as service from './products.service.js';

export async function create(req, res) {
    const product = await service.create(req.user.id, req.body);
    res.status(201).json(product);
}