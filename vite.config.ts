import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import react from '@vitejs/plugin-react'


export default defineConfig({
    plugins: [react(), reactRefresh()],
    server: {
        // Configure dev server here
        port: 1234,
    },
    build: {
        // Configure build options here
        outDir: 'docs',
    },
});