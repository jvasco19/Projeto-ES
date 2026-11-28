import { execSync } from 'node:child_process';

// corre uma vez antes de todos os testes (base de dados de testes limpa, com as migrações e o seed)
export default function setup() {
    if (!process.env.TEST_DATABASE_URL) {
        throw new Error('Falta TEST_DATABASE_URL');
    }
    execSync('npm run db:reset', {
        env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
        stdio: 'inherit',
    });
}