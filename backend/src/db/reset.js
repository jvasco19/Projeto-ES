import 'dotenv/config'
import pg from 'pg'

// Apaga e recria a base de dados de testes. Só aceita bases de dados cujo nome acaba em _test
const url = new URL(process.env.DATABASE_URL ?? '');
const name = url.pathname.slice(1);

if (!name.endsWith('_test')) {
    console.error(`Recusado: "${name}" não é uma base de dados de testes (o nome tem de acabar em _test)`);
    process.exit(1);
}

// cria a base de dados de testes se ainda não existir
const server = new URL(url);
server.pathname = '/postgres';
const admin = new pg.Client({ connectionString: server.toString() });
await admin.connect();
const { rowCount } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
if (rowCount === 0) await admin.query(`CREATE DATABASE "${name}"`);
await admin.end();

// comeca sempre do zero (as migracoes e o seed correm a seguir)
const client = new pg.Client({ connectionString: url.toString() });
await client.connect();
await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
await client.end();
console.log(`Base de dados ${name} limpa`);