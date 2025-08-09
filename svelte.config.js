import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto#environments
		// for more information about adapters. If your environment is not supported, or you
		// prefer a more specific adapter, please check https://kit.svelte.dev/docs/adapters.
		adapter: adapter()
	}
};

export default config;
