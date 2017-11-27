'use strict';
const ServerFxHandler = require('./lib/serverFxHandler');

function TransomServerFx() {
// 	this.initialize = function (server, options) {
// 		server.registry.set(options.registryKey || 'transomServerFunctions', new ServerFxHandler(server, options));
// 	}
// }

// module.exports = new TransomServerFx();

// 'use strict';
// const ServerFxHandler = require('./serverFxHandler');
// const assert = require('assert');

// function TransomServerFunctions() {

	this.initialize = function (server, options) {
		const postMiddleware = options.postMiddleware || [];
		const preMiddleware = [function (req, res, next) {
			// Delayed resolution of the isLoggedIn middleware.
			return server.registry.get('isLoggedIn')(req, res, next);
		}, ...(options.preMiddleware || [])];

		createFunctions(server, preMiddleware, postMiddleware);
	}

	function createFunctions(server, preMiddleware, postMiddleware) {
		const serverFxHandler = new ServerFxHandler();
		const serverFunctions = server.registry.get('transom-config.definition.functions', {});

		Object.keys(serverFunctions).map(function (key) {
			const fx = serverFunctions[key];
			fx.methods = fx.methods || ['post'];

			const fxPreMiddleware = serverFxHandler.serverFunctionMiddleware(fx, preMiddleware);
			const wrappedFx = serverFxHandler.getWrapper(server, fx);

			const uriPrefix = server.registry.get('transom-config.definition.uri.prefix');
			
			fx.methods.forEach(function (method) {
				const urlPath = `${uriPrefix}/fx/${key}`;
				switch (method.toLowerCase()) {
					case "post":
						server.post(urlPath, fxPreMiddleware, wrappedFx, postMiddleware);
						break;
					case "delete":
						server.del(urlPath, fxPreMiddleware, wrappedFx, postMiddleware);
						break;
					case "get":
						server.get(urlPath, fxPreMiddleware, wrappedFx, postMiddleware);
						break;
					default:
						assert(false, `Function method '${method}' is not supported.`);
				}
			});
		});
	}
}

module.exports = new TransomServerFx();