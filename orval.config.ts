import { defineConfig } from 'orval';

export default defineConfig({
  cartaisy: {
    input: {
      target: 'https://cartaisy-backend-production.up.railway.app/api-docs.json',
    },
    output: {
      mode: 'tags-split',
      target: './lib/api/generated',
      client: 'fetch',
      clean: true,
      prettier: true,
      baseUrl: 'https://cartaisy-backend-production.up.railway.app/api/v1',
      override: {
        mutator: {
          path: './lib/api/mutator/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
