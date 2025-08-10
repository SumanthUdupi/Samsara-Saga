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
		client: {start:"_app/immutable/entry/start.C9geNk02.js",app:"_app/immutable/entry/app.R_KI7I-l.js",imports:["_app/immutable/entry/start.C9geNk02.js","_app/immutable/chunks/BUDw6LdB.js","_app/immutable/chunks/Dd9lyJPl.js","_app/immutable/entry/app.R_KI7I-l.js","_app/immutable/chunks/Dd9lyJPl.js","_app/immutable/chunks/IHki7fMi.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/action",
				pattern: /^\/api\/action\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/action/_server.ts.js'))
			},
			{
				id: "/api/converse/[npcId]",
				pattern: /^\/api\/converse\/([^/]+?)\/?$/,
				params: [{"name":"npcId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/converse/_npcId_/_server.ts.js'))
			},
			{
				id: "/api/craft",
				pattern: /^\/api\/craft\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/craft/_server.ts.js'))
			},
			{
				id: "/api/create-character",
				pattern: /^\/api\/create-character\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/create-character/_server.ts.js'))
			},
			{
				id: "/api/recipes",
				pattern: /^\/api\/recipes\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/recipes/_server.ts.js'))
			},
			{
				id: "/game",
				pattern: /^\/game\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
