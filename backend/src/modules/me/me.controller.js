import { listMyRequests, getMyRequest, listMyNotifications } from "./me.services.js";

export async function listRequests(req, res) {
    const requests = await listMyRequests(req.user.id);
    res.json(requests);
}

export async function getRequest(req, res) {
    const request = await getMyRequest(req.user.id, req.params.id);
    res.json(request);
}

export async function notifications(req, res) {
    const list = await listMyNotifications(req.user.id);
    res.json(list);
}