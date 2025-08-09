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
		client: {start:"_app/immutable/entry/start.CkF-D2CM.js",app:"_app/immutable/entry/app.w9v5VohO.js",imports:["_app/immutable/entry/start.CkF-D2CM.js","_app/immutable/chunks/Bb08B8iI.js","_app/immutable/chunks/CQGUKtNg.js","_app/immutable/entry/app.w9v5VohO.js","_app/immutable/chunks/CQGUKtNg.js","_app/immutable/chunks/IHki7fMi.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
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
