import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import react from '@vitejs/plugin-react'
import * as path from "path";
import { fileURLToPath } from 'url'

console.log(import.meta.url)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

export default defineConfig({
    plugins: [react(), reactRefresh()],
    resolve: {
        alias: {
            // "@assets": path.resolve(__dirname, "public"),
        },
    },

    server: {
        // Configure dev server here
        port: 1234,
    },
    build: {
        // Configure build options here
        outDir: 'docs',
        assetsInlineLimit: 10,
    },
});