import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        restoreMocks: true,
        clearMocks: true,
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            '/api': 'http://localhost:8081',
        },
    },
    preview: {
        host: '0.0.0.0',
        port: 4173,
        proxy: {
            '/api': 'http://localhost:8081',
        },
    },
});
