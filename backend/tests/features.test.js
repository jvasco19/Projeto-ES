import { describe, it, expect, beforeAll } from 'vitest';
import { as, login, users } from './helpers.js';

describe('Estados das funcionalidades', () => {
    let developer;

    beforeAll(async () => {
        developer = await login(users.developer);
    });

    it('o board devolve as funcionalidades do produto', async () => {
        const res = await as(developer).get('/api/products/1/board');
        expect(res.status).toBe(200);
        expect(res.body.features.length).toBeGreaterThan(0);
    });

    it('passa ao estado seguinte e regista o autor', async () => {
        const res = await as(developer).patch('/api/products/1/features/2/status').send({ status: 'in_review' });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('in_review');
        expect(res.body.statusLog[0].changedBy).toBe('Rui Matos');
    });

    it('não deixa saltar estados', async () => {
        const res = await as(developer).patch('/api/products/1/features/1/status').send({ status: 'todo' });
        expect(res.status).toBe(400);
    });

    it('não muda o estado de uma funcionalidade de outra equipa', async () => {
        const res = await as(developer).patch('/api/products/1/features/5/status').send({ status: 'in_progress' });
        expect(res.status).toBe(403);
    });

    it('o detalhe traz a release e o objetivo', async () => {
        const res = await as(developer).get('/api/products/1/features/3');
        expect(res.status).toBe(200);
        expect(res.body.releaseName).toBe('v3.0');
        expect(res.body.releaseObjective).toBeTruthy();
    });
});