import { describe, it, expect, beforeAll } from 'vitest';
import { as, login, users } from './helpers.js';

describe('Análise de pedidos', () => {
    let pm, developer, customer, requestId;
    const base = '/api/products/1/triage';

    beforeAll(async () => {
        pm = await login(users.productManager);
        developer = await login(users.developer);
        customer = await login(users.customer);
        
        // pedido novo para ter a versao 1 da descricao
        const created = await as(customer).post('/api/products/1/requests')
            .send({ title: 'Pedido para analisar', description: 'Descrição original', category: 'reports' });
        requestId = created.body.id;
    });

    it('o Product Manager vê os pedidos do produto', async () => {
        const res = await as(pm).get(base);
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('abrir um pedido submetido passa-o a em análise', async () => {
        const res = await as(pm).post(`${base}/${requestId}/review`);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('in_review');
    });

    it('guarda a categoria e mantém a versão anterior da descrição', async () => {
        const res = await as(pm).patch(`${base}/${requestId}`).send({ category: 'security', description: 'Descrição nova' });
        expect(res.status).toBe(200);
        expect(res.body.category).toBe('security');
        expect(res.body.versions.length).toBe(1);
    });

    it('guarda as etiquetas sem repetidas', async () => {
        const res = await as(pm).put(`${base}/${requestId}/tags`).send({ tags: ['login', 'login', 'segurança'] });
        expect(res.status).toBe(200);
        expect(res.body.tags.length).toBe(2);
    });

    it('não rejeita sem motivo', async () => {
        const res = await as(pm).post(`${base}/${requestId}/reject`).send({ reason: '' });
        expect(res.status).toBe(400);
        expect(res.body.field).toBe('reason');
    });

    it('rejeita com motivo e o cliente vê o motivo', async () => {
        const res = await as(pm).post(`${base}/6/reject`).send({ reason: 'Fora do âmbito' });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('rejected');
        const mine = await as(customer).get('/api/me/requests/6');
        expect(mine.body.rejectionReason).toBe('Fora do âmbito');
    });

    it('aprova um pedido em análise', async () => {
        const res = await as(pm).post(`${base}/7/approve`);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('approved');
    });

    it('não aprova um pedido que não está em análise', async () => {
        const res = await as(pm).post(`${base}/10/approve`);
        expect(res.status).toBe(409);
    });

    it('um developer não acede à análise de pedidos', async () => {
        const res = await as(developer).get(base);
        expect(res.status).toBe(403);
    });
});