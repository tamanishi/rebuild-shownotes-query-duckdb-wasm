import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
        coverage: {
            enabled: true,
            provider: 'v8',
            include: [
                'src/likeEscape.ts',
                'src/highlight.ts',
                'src/aggregateEpisodes.ts',
            ],
            thresholds: {
                lines: 100,
                functions: 100,
                branches: 100,
                statements: 100,
            },
        },
    },
})
