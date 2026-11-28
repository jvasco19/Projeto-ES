import { describe, it, expect, beforeAll } from 'vitest';
import { as, login, users } from './helpers.js';

describe('Pedidos dos clientes', () => {
    let customer, otherCustomer, productManager;

    beforeAll(async () => {
        customer = await login(users.customer);
        otherCustomer = await login(users.otherCustomer);
        productManager = await login(users.productManager);
    });

    it('um cliente submete um pedido', async () => {
        const res = await as(customer).post('/api/products/1/requests')
            .send({ title: 'Pedido de teste', description: 'Descrição', category: 'reports' });
        expect(res.status).toBe(201);
        expect(res.body.status).toBe('submitted');
    });

    it('o título é obrigatório', async () => {
        const res = await as(customer).post('/api/products/1/requests')
            .send({ title: '', description: 'Descrição', category: 'reports' });
        expect(res.status).toBe(400);
        expect(res.body.field).toBe('title');
    });

    it('a categoria é obrigatória', async () => {
        const res = await as(customer).post('/api/products/1/requests')
            .send({ title: 'Sem categoria', description: 'Descrição' });
        expect(res.status).toBe(400);
        expect(res.body.field).toBe('category');
    });

    it('só os clientes submetem pedidos', async () => {
        const res = await as(productManager).post('/api/products/1/requests')
            .send({ title: 'x', description: 'x', category: 'reports' });
        expect(res.status).toBe(403);
    });

    it('a pesquisa de pedidos públicos encontra pelo título', async () => {
        const res = await as(customer).get('/api/products/1/requests/public?search=relat');
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('o cliente vê os seus pedidos e o detalhe com o percurso de estados', async () => {
        const list = await as(customer).get('/api/me/requests');
        expect(list.status).toBe(200);
        const detail = await as(customer).get('/api/me/requests/6');
        expect(detail.status).toBe(200);
        expect(Array.isArray(detail.body.timeline)).toBe(true);
    });

    it('um cliente não vê o pedido de outro cliente', async () => {
        const res = await as(otherCustomer).get('/api/me/requests/6');
        expect(res.status).toBe(403);
    });
});