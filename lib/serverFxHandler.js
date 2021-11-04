'use strict';
const restifyErrors = require('restify-errors');

module.exports = function ServerFxHandler(options) {

    const server = options.server;

    function serverFunctionMiddleware(fxDefinition, preMiddleware) {
        let result = [];
        if (fxDefinition.preMiddleware){
            result.push(...fxDefinition.preMiddleware);
        }
        if (fxDefinition.acl) {
            // Make sure User is authenticated
            const isLoggedIn = function (req, res, next) {
                // Delayed resolution of the isLoggedIn middleware.
                if (server.registry.has('localUserMiddleware')) {
                    const middleware = server.registry.get('localUserMiddleware');
                    middleware.isLoggedInMiddleware()(req, res, next);
                } else {
                    next(new restifyErrors.ForbiddenError(`Server configuration error, 'localUserMiddleware' not found.`));
                }
            }
            result.push(isLoggedIn);

            // Make sure User is authorized
            if (fxDefinition.acl.groups) {
                const hasGroups = function (req, res, next) {
                    // Delayed resolution of the isLoggedIn middleware.
                    if (server.registry.has('localUserMiddleware')) {
                        const middleware = server.registry.get('localUserMiddleware');
                        middleware.groupMembershipMiddleware(fxDefinition.acl.groups)(req, res, next);
                    } else {
                        next(new restifyErrors.ForbiddenError(`Server configuration error, 'localUserMiddleware' not found.`));
                    }
                }
                result.push(hasGroups);
            }
        }
        result.push(...preMiddleware);
        return result;
    };

    function getWrapper(fxDefinition) {
        return function (req, res, next) {
            //TODO: some parameter checking... based on fx.params

            // Use call() to make sure we have the correct 'this'.
            const fxFunction = fxDefinition.function || function noop(server, req, res, next) {
                next(new restifyErrors.NotImplementedError(`TransomServerFunction function definition not provided.`));
            };
            fxFunction.call(this, server, req, res, next);
        }
    };

    return {
        serverFunctionMiddleware,
        getWrapper
    };
};