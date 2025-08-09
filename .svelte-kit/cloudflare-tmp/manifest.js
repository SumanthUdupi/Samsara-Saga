export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.CbRP2I62.js",app:"_app/immutable/entry/app.Cevr-K47.js",imports:["_app/immutable/entry/start.CbRP2I62.js","_app/immutable/chunks/2_W7JxVb.js","_app/immutable/chunks/CQGUKtNg.js","_app/immutable/entry/app.Cevr-K47.js","_app/immutable/chunks/CQGUKtNg.js","_app/immutable/chunks/IHki7fMi.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

export const prerendered = new Set([]);

export const base_path = "";
