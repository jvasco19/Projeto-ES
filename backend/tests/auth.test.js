import { describe, it, expect } from 'vitest';
import { api, as, login, users } from './helpers.js';

describe('Autenticação', () => {
    it('regista uma conta nova e devolve o token', async () => {
        const res = await api.post('/api/auth/register')
            .send({ name: 'Conta Teste', email: 'conta.teste@exemplo.pt', password: 'password123' });
        expect(res.status).toBe(201);
        expect(res.body.token).toBeTruthy();
    });

    it('não regista duas contas com o mesmo email', async () => {
        const res = await api.post('/api/auth/register')
            .send({ name: 'Outra', email: users.customer, password: 'password123' });
        expect(res.status).toBe(409);
        expect(res.body.field).toBe('email');
    });

    it('recusa palavras-passe curtas', async () => {
        const res = await api.post('/api/auth/register')
            .send({ name: 'Curta', email: 'curta@exemplo.pt', password: '123' });
        expect(res.status).toBe(400);
        expect(res.body.field).toBe('password');
    });

    it('recusa login com a palavra-passe errada', async () => {
        const res = await api.post('/api/auth/login').send({ email: users.customer, password: 'errada123' });
        expect(res.status).toBe(401);
    });

    it('devolve o utilizador e os produtos dele', async () => {
        const res = await as(await login(users.productManager)).get('/api/auth/me');
        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe(users.productManager);
        expect(res.body.products.length).toBeGreaterThan(0);
    });

    it('recusa pedidos sem sessão', async () => {
        const res = await api.get('/api/me/requests');
        expect(res.status).toBe(401);
    });
});