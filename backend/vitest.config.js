import 'dotenv/config';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globalSetup: './tests/setup.js',
        // os ficheiros de testes partilham a mesma base de dados
        fileParallelism: false,
        // a API usa a base de dados de testes
        env: { DATABASE_URL: process.env.TEST_DATABASE_URL ?? '' },
    },
});