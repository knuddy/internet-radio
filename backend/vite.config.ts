import { defineConfig } from 'vite';
import { builtinModules } from 'node:module';

export default defineConfig({
  environments: {
    node: {
      resolve: {
        conditions: ['node'],
      }
    }
  },
  resolve: {
    tsconfigPaths: true
  },
  build: {
    target: 'node24',
    ssr: true,
    lib: {
      entry: {
        server: 'src/server.ts',
        worker: 'src/worker.ts',
        manage: 'src/manage.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
      ]
    },
    outDir: 'dist',
    emptyOutDir: true
  }
})