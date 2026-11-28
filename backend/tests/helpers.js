import request from 'supertest';
import { app } from '../src/app.js';

export const api = request(app);

// utilizadores do seed
export const users = {
    productManager: 'ines.carvalho@exemplo.pt',
    projectManager: 'tiago.ferreira@exemplo.pt',
    developer: 'rui.matos@exemplo.pt',
    otherTeamDeveloper: 'miguel.santos@exemplo.pt',
    customer: 'marta.lopes@exemplo.pt',
    otherCustomer: 'joao.pires@exemplo.pt',
};

export async function login(email) {
    const res = await api.post('/api/auth/login').send({ email, password: 'password123' });
    return res.body.token;
}

// pedido autenticado: as(token).get('/api/...')
export function as(token) {
    const auth = (req) => req.set('Authorization', `Bearer ${token}`);
    return {
        get: (url) => auth(api.get(url)),
        post: (url) => auth(api.post(url)),
        put: (url) => auth(api.put(url)),
        patch: (url) => auth(api.patch(url)),
        delete: (url) => auth(api.delete(url)),
    };
}

// data relativa a hoje no formato AAAA-MM-DD
export function dayFromToday(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}