import * as service from './requests.service.js';

export async function create(req, res) {
    const request = await service.create(req.member.productId, req.user.id, req.body);
    res.status(201).json(request);
}

export async function listPublic(req, res) {
    const requests = await service.listPublic(req.member.productId, req.query.search);
    res.json(requests);
}

export async function addAttachment(req, res) {
    const attachment = await service.addAttachment(req.user.id, req.requestId, req.file);
    res.status(201).json(attachment);
}

export async function getAttachment(req, res) {
    const { filePath, fileName, mimeType } = await service.getAttachment(req.user.id, req.params.attachmentId);
    if (mimeType) res.type(mimeType);
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(filePath);
}