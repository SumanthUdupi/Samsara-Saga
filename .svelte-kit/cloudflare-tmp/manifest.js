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
		client: {start:"_app/immutable/entry/start.Ug4zlJvG.js",app:"_app/immutable/entry/app.DJSYJyG9.js",imports:["_app/immutable/entry/start.Ug4zlJvG.js","_app/immutable/chunks/CZ7LrbbC.js","_app/immutable/chunks/PytWL9k9.js","_app/immutable/entry/app.DJSYJyG9.js","_app/immutable/chunks/PytWL9k9.js","_app/immutable/chunks/IHki7fMi.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
