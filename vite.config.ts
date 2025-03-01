import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      build: {
        rollupOptions: {
          input: {
            client: './src/client.ts',
            worker: './src/worker.ts'
          },
          output: {
            entryFileNames: 'static/[name].js',
          },
        },
      }
    }
  } else {
    return {
      plugins: [
        build(),
        devServer({
          entry: 'src/index.tsx',
        })
      ]
    }
  }
})
