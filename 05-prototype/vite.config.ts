import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()], server: { port: 5173, proxy: { '/api': 'http://127.0.0.1:3001' } }, build: { outDir: 'dist' }, test: { maxWorkers: 2, include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'] } } as any);
