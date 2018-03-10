'use strict';
const ServerFxHandler = require('./lib/serverFxHandler');
const debug = require('debug')('transom:serverfunctions');
const assert = require('assert');

function TransomServerFx() {

	this.initialize = function (server, options) {
		const postMiddleware = options.postMiddleware || [];
		const preMiddleware = options.preMiddleware || [];

		const serverFxHandler = new ServerFxHandler({server});
		const serverFunctions = server.registry.get('transom-config.definition.functions', {});
		const uriPrefix = server.registry.get('transom-config.definition.uri.prefix');

		Object.keys(serverFunctions).map(function (key) {
			const fx = serverFunctions[key];
			fx.methods = fx.methods || ['post'];

			// Add Authentication and Authorization middleware from localUserMiddleware.
			const fxPreMiddleware = serverFxHandler.serverFunctionMiddleware(fx, preMiddleware);

			// Use a wrapper to inject 'server' into the request handler function.
			const wrappedFx = serverFxHandler.getWrapper(fx);
			const urlPath = `${uriPrefix}/fx/${key}`;

			fx.methods.forEach(function (method) {
				debug(`TransomServerFunctions adding route: (${method}) ${urlPath}`);
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
					debug(`TransomServerFunction method '${method}' is not supported.`);
					assert(false, `TransomServerFunction method '${method}' is not supported.`);
				}
			});
		});
	}

	this.preStart = function (server, options) {
		const serverFunctions = server.registry.get('transom-config.definition.functions', {});

		// Lastly, make sure that the groups referenced in the acl properties are seeded in the security plugin.
		if (server.registry.has('transomLocalUserClient')) {
			const localUserClient = server.registry.get('transomLocalUserClient');

			// Collect a complete list of all the Acl group codes.
			const groups = [];
			Object.keys(serverFunctions).forEach(function (key) {
				const acl = serverFunctions[key].acl || {};
				if (acl.groups) {
					if (typeof acl.create === 'string') {
						acl.groups = [acl.groups];
					}
					groups.push(...acl.groups);
				}
			});

			// Build a list of distinct group codes.
			const distinctGroups = {};
			groups.map(function (group) {
				group = group.toLowerCase().trim();
				distinctGroups[group] = true;
			});

			debug(`TransomServerFunctions seeding groups [${groups.join(',')}]`);
			localUserClient.setGroups(server, distinctGroups);
		}
	}
}

module.exports = new TransomServerFx();