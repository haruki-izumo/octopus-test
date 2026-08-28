import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export const nextjsConfig = defineConfig({
    plugins: [react()],
    resolve: {
        tsconfigPaths: true,
    },
    test: {
        environment: 'jsdom',
        include: ['src/**/*.test.{ts,tsx}'],
        passWithNoTests: true,
        setupFiles: [fileURLToPath(new URL('./setup.ts', import.meta.url))],
    },
})
