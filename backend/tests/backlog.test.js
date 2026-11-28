import { describe, it, expect, beforeAll } from 'vitest';
import { api, as, login, users } from './helpers.js';

describe('Product Backlog', () => {
    let pm, developer, customer;
    const backlog = '/api/products/1/backlog';
    const feature = (id) => `/api/products/1/features/${id}`;
    const ids = (list) => list.map((f) => Number(f.id));
    const byId = (list, id) => list.find((f) => Number(f.id) === id);

    beforeAll(async () => {
        pm = await login(users.productManager);
        developer = await login(users.developer);
        customer = await login(users.customer);
    });

    describe('Ver o backlog', () => {
        it('o Product Manager vê o backlog pela ordem das posições', async () => {
            const res = await as(pm).get(backlog);
            expect(res.status).toBe(200);
            expect(res.body[0].title).toBe('Exportação de relatórios para Excel');
            expect(res.body[0].position).toBe(1);
            expect(res.body[0].priority).toBe(27);
            expect(res.body.at(-1).position).toBeNull();
        });

        it('indica se a funcionalidade já tem User Story', async () => {
            const res = await as(pm).get(backlog);
            expect(byId(res.body, 3).hasStory).toBe(true);
            expect(byId(res.body, 10).hasStory).toBe(false);
        });

        it('um developer também vê o backlog', async () => {
            const res = await as(developer).get(backlog);
            expect(res.status).toBe(200);
        });

        it('um cliente não vê o backlog', async () => {
            const res = await as(customer).get(backlog);
            expect(res.status).toBe(403);
        });

        it('sem sessão não vê o backlog', async () => {
            const res = await api.get(backlog);
            expect(res.status).toBe(401);
        });
    });

    describe('Adicionar ao backlog', () => {
        it('adiciona a funcionalidade no fim do backlog', async () => {
            const before = await as(pm).get(backlog);
            const last = Math.max(...before.body.map((f) => f.position ?? 0));
            const res = await as(pm).post('/api/products/1/features').send({ title: 'Exportar para PDF', description: 'Exportar os relatórios em PDF' });
            expect(res.status).toBe(201);
            expect(res.body.title).toBe('Exportar para PDF');
            expect(res.body.status).toBe('todo');
            expect(res.body.position).toBe(last + 1);
            expect(res.body.priority).toBeNull();
            expect(res.body.hasStory).toBe(false);
            const after = await as(pm).get(backlog);
            expect(after.body.length).toBe(before.body.length + 1);
        });

        it('limpa os espaços do título e guarda a descrição vazia como null', async () => {
            const res = await as(pm).post('/api/products/1/features').send({ title: '  Exportar para CSV  ', description: '   ' });
            expect(res.status).toBe(201);
            expect(res.body.title).toBe('Exportar para CSV');
            const detail = await as(pm).get(feature(res.body.id));
            expect(detail.body.description).toBeNull();
        });

        it('sem título mostra um erro a pedir o título e não cria a funcionalidade', async () => {
            const before = await as(pm).get(backlog);
            const res = await as(pm).post('/api/products/1/features').send({ description: 'Sem título' });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Indica o título da funcionalidade');
            expect(res.body.field).toBe('title');
            const after = await as(pm).get(backlog);
            expect(after.body.length).toBe(before.body.length);
        });

        it('um título só com espaços também é recusado', async () => {
            const res = await as(pm).post('/api/products/1/features').send({ title: '   ' });
            expect(res.status).toBe(400);
            expect(res.body.field).toBe('title');
        });

        it('um developer não adiciona funcionalidades', async () => {
            const res = await as(developer).post('/api/products/1/features').send({ title: 'Não pode' });
            expect(res.status).toBe(403);
        });
    });

    describe('Alterar a prioridade', () => {
        it('atualiza a prioridade e reordena o backlog', async () => {
            const res = await as(pm).patch(`${feature(10)}/priority`).send({ impact: 10, effort: 1 });
            expect(res.status).toBe(200);
            expect(Number(res.body[0].id)).toBe(10);
            expect(res.body[0].priority).toBe(100);
            res.body.forEach((f, i) => expect(f.position).toBe(i + 1));
        });

        it('só com o esforço mantém o impacto e ordena pela prioridade', async () => {
            const res = await as(pm).patch(`${feature(10)}/priority`).send({ effort: 5 });
            expect(res.status).toBe(200);
            const changed = byId(res.body, 10);
            expect(changed.impact).toBe(10);
            expect(changed.effort).toBe(5);
            expect(changed.priority).toBe(20);
            const priorities = res.body.map((f) => f.priority).filter((p) => p !== null);
            expect(priorities).toEqual([...priorities].sort((a, b) => b - a));
        });

        it('um valor fora de 1 a 10 mostra um erro e a prioridade mantém-se', async () => {
            const res = await as(pm).patch(`${feature(10)}/priority`).send({ impact: 11 });
            expect(res.status).toBe(400);
            expect(res.body.field).toBe('impact');
            const after = await as(pm).get(backlog);
            expect(byId(after.body, 10).priority).toBe(20);
        });

        it('valores que não são números inteiros mostram um erro e a prioridade mantém-se', async () => {
            const text = await as(pm).patch(`${feature(10)}/priority`).send({ impact: 'abc' });
            expect(text.status).toBe(400);
            expect(text.body.field).toBe('impact');
            const decimal = await as(pm).patch(`${feature(10)}/priority`).send({ effort: 2.5 });
            expect(decimal.status).toBe(400);
            expect(decimal.body.field).toBe('effort');
            const zero = await as(pm).patch(`${feature(10)}/priority`).send({ effort: 0 });
            expect(zero.status).toBe(400);
            const after = byId((await as(pm).get(backlog)).body, 10);
            expect(after.impact).toBe(10);
            expect(after.effort).toBe(5);
            expect(after.priority).toBe(20);
        });

        it('sem impacto nem esforço mostra um erro', async () => {
            const res = await as(pm).patch(`${feature(10)}/priority`).send({});
            expect(res.status).toBe(400);
        });

        it('um developer não muda a prioridade', async () => {
            const res = await as(developer).patch(`${feature(10)}/priority`).send({ impact: 5 });
            expect(res.status).toBe(403);
        });

        it('uma funcionalidade que não existe dá 404 e um id inválido dá 400', async () => {
            const missing = await as(pm).patch(`${feature(9999)}/priority`).send({ impact: 5 });
            expect(missing.status).toBe(404);
            const invalid = await as(pm).patch(`${feature('abc')}/priority`).send({ impact: 5 });
            expect(invalid.status).toBe(400);
            expect(invalid.body.field).toBe('featureId');
        });
    });

    describe('Mudar a posição à mão', () => {
        it('move a funcionalidade para o topo e as outras descem uma posição', async () => {
            const before = await as(pm).get(backlog);
            const others = ids(before.body).filter((id) => id !== 13);
            const res = await as(pm).patch(`${feature(13)}/position`).send({ position: 1 });
            expect(res.status).toBe(200);
            expect(ids(res.body)).toEqual([13, ...others]);
        });

        it('uma posição maior que o backlog põe a funcionalidade no fim', async () => {
            const res = await as(pm).patch(`${feature(13)}/position`).send({ position: 999 });
            expect(res.status).toBe(200);
            expect(Number(res.body.at(-1).id)).toBe(13);
        });

        it('a nova ordem fica guardada', async () => {
            const moved = await as(pm).patch(`${feature(13)}/position`).send({ position: 2 });
            const res = await as(pm).get(backlog);
            expect(ids(res.body)).toEqual(ids(moved.body));
            expect(Number(res.body[1].id)).toBe(13);
        });

        it('uma posição inválida mostra um erro', async () => {
            const zero = await as(pm).patch(`${feature(13)}/position`).send({ position: 0 });
            expect(zero.status).toBe(400);
            expect(zero.body.field).toBe('position');
            const text = await as(pm).patch(`${feature(13)}/position`).send({ position: '2' });
            expect(text.status).toBe(400);
        });

        it('um developer não muda a posição', async () => {
            const res = await as(developer).patch(`${feature(13)}/position`).send({ position: 1 });
            expect(res.status).toBe(403);
        });
    });
});