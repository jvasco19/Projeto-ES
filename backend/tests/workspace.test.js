import { describe, it, expect, beforeAll } from 'vitest';
import { as, login, users, dayFromToday } from './helpers.js';

describe('Espaço de trabalho: produtos, equipas e milestones', () => {
    let projectManager, productManager, developer, customer;

    beforeAll(async () => {
        projectManager = await login(users.projectManager);
        productManager = await login(users.productManager);
        developer = await login(users.developer);
        customer = await login(users.customer);
    });

    it('quem cria um produto fica como Project Manager', async () => {
        const res = await as(developer).post('/api/products').send({ name: 'Produto Teste' });
        expect(res.status).toBe(201);
        expect(res.body.role).toBe('project_manager');
        const me = await as(developer).get('/api/auth/me');
        expect(me.body.products.some((p) => p.id === res.body.id && p.role === 'project_manager')).toBe(true);
    });

    it('o produto precisa de nome', async () => {
        const res = await as(developer).post('/api/products').send({ name: '' });
        expect(res.status).toBe(400);
        expect(res.body.field).toBe('name');
    });

    it('o Project Manager cria equipas e muda papéis', async () => {
        const team = await as(projectManager).post('/api/products/1/teams').send({ name: 'Equipa Teste', capacity: 20 });
        expect(team.status).toBe(201);
        const member = await as(projectManager).patch('/api/products/1/members/2').send({ role: 'developer' });
        expect(member.status).toBe(200);
    });

    it('cria, edita e apaga milestones', async () => {
        const created = await as(projectManager).post('/api/products/1/milestones')
            .send({ name: 'Milestone Teste', dueDate: dayFromToday(30) });
        expect(created.status).toBe(201);
        const id = created.body.id;

        const edited = await as(projectManager).patch(`/api/products/1/milestones/${id}`).send({ dueDate: dayFromToday(40) });
        expect(edited.body.dueDate).toBe(dayFromToday(40));

        const removed = await as(projectManager).delete(`/api/products/1/milestones/${id}`);
        expect(removed.status).toBe(204);
    });

    it('não aceita datas de entrega que já passaram', async () => {
        const res = await as(projectManager).post('/api/products/1/milestones')
            .send({ name: 'Passada', dueDate: dayFromToday(-1) });
        expect(res.status).toBe(400);
        expect(res.body.field).toBe('dueDate');
    });

    it('não aceita datas que não existem', async () => {
        const res = await as(projectManager).post('/api/products/1/milestones')
            .send({ name: 'Inexistente', dueDate: '2027-02-30' });
        expect(res.status).toBe(400);
    });

    it.each([
        ['developer', () => developer],
        ['Product Manager', () => productManager],
    ])('um %s vê mas não configura o espaço de trabalho', async (_, token) => {
        expect((await as(token()).get('/api/products/1/teams')).status).toBe(200);
        expect((await as(token()).post('/api/products/1/teams').send({ name: 'X' })).status).toBe(403);
        expect((await as(token()).post('/api/products/1/members').send({ email: users.otherCustomer, role: 'developer' })).status).toBe(403);
        expect((await as(token()).post('/api/products/1/milestones').send({ name: 'Y', dueDate: dayFromToday(5) })).status).toBe(403);
    });

    it('um cliente não vê as milestones', async () => {
        const res = await as(customer).get('/api/products/1/milestones');
        expect(res.status).toBe(403);
    });
});