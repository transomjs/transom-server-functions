'use strict';
const restifyErrors = require('restify-errors');

module.exports = function ServerFxHandler() {
    
    function hasGroupMembership(fxGroups) {
        return function (req, res, next) {
            if (req.locals.user) {
                const userGroups = req.locals.user.groups || [];
                for (let i = 0; i < fxGroups.length; i++) {
                    if (userGroups.indexOf(fxGroups[i]) !== -1) {
                        return next();
                    }
                }
            }
            next(new restifyErrors.ForbiddenError('No execute permissions on endpoint'));
        }
    };

    function serverFunctionMiddleware(fxDefinition, preMiddleware) {
        let retval = preMiddleware;
        if (fxDefinition.acl && fxDefinition.acl.groups) {
            //make a copy of the original
            retval = [...preMiddleware, hasGroupMembership(fxDefinition.acl.groups)];
        }
        return retval;
    };

    function getWrapper(server, fxDefinition) {
        return function (req, res, next) {
            //TODO: some parameter checking... based on fx.params

            // Use call() to make sure we have the correct 'this'.
            fxDefinition.function.call(this, server, req, res, next);
        }
    };

    return {
        hasGroupMembership,
        serverFunctionMiddleware,
        getWrapper
    };
};