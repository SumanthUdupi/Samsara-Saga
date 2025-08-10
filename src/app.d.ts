import { D1Database } from '@cloudflare/workers-types';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			// Add your custom locals here
		}
		interface PageData {
			// Add your custom page data here
		}
		interface Platform {
			env: {
				DB: D1Database;
				GEMINI_API_KEY: string;
			};
			context: {
				waitUntil(promise: Promise<any>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
		interface Error {
			// Add your custom error type here
		}
	}
}

export {};