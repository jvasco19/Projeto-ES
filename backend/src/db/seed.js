import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from './pool.js'

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(here, '../../database/seeds');

async function seed() {
    const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        for (const file of files) {
            const sql = await readFile(path.join(dir, file), 'utf-8');
            await client.query(sql);
            console.log(`Seed aplicado: ${file}`);
        }
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`O seed falhou: ${err.message}`);
    } finally {
        client.release();
    }
}

try {
    await seed();
    console.log('Seed concluido');
} catch (err) {
    console.error(err.message);
    process.exitCode = 1;
} finally {
    await pool.end();
}