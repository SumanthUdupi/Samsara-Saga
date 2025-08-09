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
		client: {start:"_app/immutable/entry/start.D14CW-HP.js",app:"_app/immutable/entry/app.HLn9t-Ex.js",imports:["_app/immutable/entry/start.D14CW-HP.js","_app/immutable/chunks/Csjds7es.js","_app/immutable/chunks/CrWdrbl6.js","_app/immutable/chunks/CLgi0tk0.js","_app/immutable/entry/app.HLn9t-Ex.js","_app/immutable/chunks/CLgi0tk0.js","_app/immutable/chunks/CrWdrbl6.js","_app/immutable/chunks/DsnmJJEf.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
