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

describe('Votos em pedidos públicos', () => {
    let customer, otherCustomer, productManager, votesBefore;
    const vote = '/api/products/1/requests/8/vote';

    async function findRequest8(token) {
        const res = await as(token).get('/api/products/1/requests/public?search=chave');
        return res.body.find((r) => String(r.id) === '8');
    }

    beforeAll(async () => {
        customer = await login(users.customer);
        otherCustomer = await login(users.otherCustomer);
        productManager = await login(users.productManager);
        votesBefore = (await findRequest8(customer)).votes;
    });

    it('um cliente vota num pedido público de outro cliente', async () => {
        const res = await as(customer).post(vote);
        expect(res.status).toBe(200);
        expect(res.body.votes).toBe(votesBefore + 1);
        expect(res.body.votedByMe).toBe(true);
    });

    it('votar outra vez não conta um segundo voto', async () => {
        const res = await as(customer).post(vote);
        expect(res.status).toBe(200);
        expect(res.body.votes).toBe(votesBefore + 1);
    });

    it('a pesquisa mostra os votos e se o cliente votou', async () => {
        const mine = await findRequest8(customer);
        expect(mine.votes).toBe(votesBefore + 1);
        expect(mine.votedByMe).toBe(true);

        const other = await findRequest8(otherCustomer);
        expect(other.votedByMe).toBe(false);
    });

    it('quem votou é notificado quando o estado do pedido muda', async () => {
        await as(productManager).post('/api/products/1/triage/8/review');

        const res = await as(customer).get('/api/me/notifications');
        const notification = res.body.find((n) => String(n.requestId) === '8');
        expect(notification.reason).toBe('vote');
        expect(notification.status).toBe('in_review');
        expect(notification.link).toBe('/me/products/1');
    });

    it('um cliente retira o voto', async () => {
        const res = await as(customer).delete(vote);
        expect(res.status).toBe(200);
        expect(res.body.votes).toBe(votesBefore);
        expect(res.body.votedByMe).toBe(false);
    });

    it('retirar um voto que não existe não dá erro', async () => {
        const res = await as(customer).delete(vote);
        expect(res.status).toBe(200);
        expect(res.body.votes).toBe(votesBefore);
    });

    it('um cliente não vota no próprio pedido', async () => {
        const res = await as(customer).post('/api/products/1/requests/6/vote');
        expect(res.status).toBe(409);
    });

    it('não é possível votar num pedido privado', async () => {
        const res = await as(customer).post('/api/products/1/requests/12/vote');
        expect(res.status).toBe(404);
    });

    it('o id do pedido tem de ser um número', async () => {
        const res = await as(customer).post('/api/products/1/requests/abc/vote');
        expect(res.status).toBe(400);
        expect(res.body.field).toBe('requestId');
    });

    it('só os clientes votam', async () => {
        const res = await as(productManager).post(vote);
        expect(res.status).toBe(403);
    });
});