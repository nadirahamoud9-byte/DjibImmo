import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        tailwindcss(),
        react(),
    ],
//     server: {
//     cors: {
//         origin: 'http://192.168.100.137:8000',
//         methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//         allowedHeaders: ['Content-Type', 'Authorization'],
//     },
//     host: true,
//     port: 5173,
//     strictPort: true,
//     hmr: {
//         host: '192.168.100.137',
//         protocol: 'ws',
//         port: 5173,
//     },
// },
});
