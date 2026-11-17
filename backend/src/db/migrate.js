import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from './pool.js'

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(here, '../../database/migrations');

async function migrate() {
    await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

    const { rows } = await pool.query('SELECT name FROM schema_migrations');
    const applied = new Set(rows.map((r) => r.name));
    const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files){
        if (applied.has(file)) continue;
        const sql = await readFile(path.join(dir, file), 'utf-8');
        const client = await pool.connect();

        try{
            await client.query('BEGIN');
            await client.query(sql);
            await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
            await client.query('COMMIT');
            console.log(`Ficheiro aplicado: ${file}`);
        } catch (err) {
            await client.query('ROLLBACK');
            throw new Error(`O ficheiro ${file} falhou: ${err.message}`);
        } finally {
            client.release();
        }
    }
}

try {
    await migrate();
    console.log('Migracoes em dia');
} catch (err) {
    console.error(err.message);
    process.exitCode = 1;
} finally {
    await pool.end();
}