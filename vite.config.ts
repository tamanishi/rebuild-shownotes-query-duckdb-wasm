import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      plugins: [
        tailwindcss(),
      ],
      build: {
        rollupOptions: {
          input: {
            client: './src/client.ts',
            worker: './src/worker.ts',
            css: './src/style.css',
          },
          output: {
            entryFileNames: 'static/[name].js',
            assetFileNames: (assetInfo) => {
              if (assetInfo.name?.endsWith('.css')) {
                return 'static/style.css'
              }
              if (assetInfo.name?.endsWith('.parquet')) {
                return null
              }
              return 'assets/[name][extname]'
            }
          },
        },
      },
      publicDir: false
    }
  } else if (mode === 'development') {
    return {
      plugins: [
        tailwindcss(),
        build(),
        devServer({
          entry: 'src/index.tsx',
        })
      ],
      publicDir: 'public'
    }
  } else if (mode === 'production') {
    return {
      plugins: [
        tailwindcss(),
        build(),
      ],
      publicDir: false
    }
  }
})
