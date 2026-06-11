import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // Every route is prerendered (see src/routes/+layout.ts); the generated worker
    // just serves those static assets on Cloudflare. Output -> .svelte-kit/cloudflare.
    adapter: adapter(),
    alias: {
      $data: 'src/data'
    }
  }
};

export default config;
