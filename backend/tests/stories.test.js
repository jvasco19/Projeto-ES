import { describe, it, expect, beforeAll } from 'vitest';
import { as, login, users } from './helpers.js';

describe('User Story e critérios de aceitação', () => {
    let pm, developer, customer;
    const story = '/api/products/1/features/11/story';
    const valid = { role: 'gestor comercial', goal: 'ver as comissões', benefit: 'pagar o valor certo' };

    beforeAll(async () => {
        pm = await login(users.productManager);
        developer = await login(users.developer);
        customer = await login(users.customer);
    });

    it('o developer vê o pedido de origem, a User Story e os critérios', async () => {
        const res = await as(developer).get('/api/products/1/features/3/story');
        expect(res.status).toBe(200);
        expect(res.body.request.authorName).toBeTruthy();
        expect(res.body.story).toBeTruthy();
        expect(res.body.criteria.length).toBe(3);
    });

    it('uma funcionalidade sem User Story devolve story a null', async () => {
        const res = await as(developer).get('/api/products/1/features/1/story');
        expect(res.status).toBe(200);
        expect(res.body.story).toBeNull();
    });

    it('papel, objetivo e benefício são obrigatórios', async () => {
        const res = await as(pm).post(story).send({ ...valid, benefit: '  ' });
        expect(res.status).toBe(400);
        expect(res.body.field).toBe('benefit');
    });

    it('cria a User Story e não deixa criar outra', async () => {
        const res = await as(pm).post(story).send(valid);
        expect(res.status).toBe(201);
        const again = await as(pm).post(story).send(valid);
        expect(again.status).toBe(409);
    });

    it('cria, edita e remove critérios de aceitação', async () => {
        const created = await as(pm).post(`${story}/criteria`).send({ text: 'Primeiro critério' });
        expect(created.status).toBe(201);
        const id = created.body.criteria[0].id;

        const edited = await as(pm).patch(`${story}/criteria/${id}`).send({ text: 'Critério editado' });
        expect(edited.body.criteria[0].text).toBe('Critério editado');

        const removed = await as(pm).delete(`${story}/criteria/${id}`);
        expect(removed.status).toBe(200);
        expect(removed.body.criteria.length).toBe(0);
    });

    it('um developer não altera a User Story', async () => {
        const res = await as(developer).post(`${story}/criteria`).send({ text: 'x' });
        expect(res.status).toBe(403);
    });

    it('um cliente não vê os requisitos internos', async () => {
        const res = await as(customer).get('/api/products/1/features/3/story');
        expect(res.status).toBe(403);
    });
});