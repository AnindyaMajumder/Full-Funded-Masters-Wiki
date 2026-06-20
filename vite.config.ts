import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const DATA_FILES = [
  'uk', 'europe', 'usa', 'japan', 'china',
  'australia', 'southkorea', 'taiwan', 'singapore', 'malaysia',
];

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    // Europe has 127 scholarships with rich text fields → its data chunk is ~800 kB
    // minified / ~220 kB gzip, which is unavoidable for this dataset size.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          for (const country of DATA_FILES) {
            if (id.includes(`/data/${country}.`)) return `data-${country}`;
          }
        },
      },
    },
  },
});
