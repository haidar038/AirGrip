import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        include: ['simple-peer', 'buffer', 'process/browser'],
    },
    define: {
        global: 'globalThis',
        'process.env': {},
        'process.nextTick': ['globalThis', 'queueMicrotask'].join('.'),
        'process.browser': true,
    },
    resolve: {
        alias: {
            process: 'process/browser',
            stream: 'stream-browserify',
            util: 'util/',
            buffer: 'buffer/',
            Buffer: 'buffer/',
        },
    },
    build: {
        rollupOptions: {
            external: ['simple-peer'],
        },
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },
});
