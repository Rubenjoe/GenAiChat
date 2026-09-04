const manifest = (() => {
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
		client: {start:"_app/immutable/entry/start.3ovKdvQM.js",app:"_app/immutable/entry/app.Diyvkrm4.js",imports:["_app/immutable/entry/start.3ovKdvQM.js","_app/immutable/chunks/C2u59Ty-.js","_app/immutable/chunks/DZH2DxBD.js","_app/immutable/chunks/DO4jZ8-K.js","_app/immutable/entry/app.Diyvkrm4.js","_app/immutable/chunks/DZH2DxBD.js","_app/immutable/chunks/DO4jZ8-K.js","_app/immutable/chunks/DrSR3CVL.js","_app/immutable/chunks/CnXt9nDf.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-CSL1qC8W.js')),
			__memo(() => import('./chunks/1-Dbm9L0GN.js')),
			__memo(() => import('./chunks/2-CQ_Bz8hd.js').then(function (n) { return n.a0; }))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/[...catchall]",
				pattern: /^(?:\/([^]*))?\/?$/,
				params: [{"name":"catchall","optional":false,"rest":true,"chained":true}],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
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

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
