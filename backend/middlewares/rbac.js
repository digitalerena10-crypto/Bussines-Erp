const ApiError = require('../utils/ApiError');

/**
 * Role-Based Access Control Middleware
 * Checks if the authenticated user has the required permission(s)
 * 
 * Usage: authorize('manage_inventory') or authorize(['manage_inventory', 'view_reports'])
 * 
 * @param {string|string[]} requiredPermissions - Permission(s) required to access the route
 */
const authorize = (requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            console.log('[RBAC DEBUG] No user on request');
            return next(ApiError.unauthorized('Authentication required'));
        }

        console.log(`[RBAC DEBUG] User: ${req.user.email}, Role: ${req.user.role}, Required: ${requiredPermissions}`);

        const permissions = Array.isArray(requiredPermissions)
            ? requiredPermissions
            : [requiredPermissions];

        const userPermissions = req.user.permissions || [];

        // Super Admin bypasses all permission checks
        if (req.user.role === 'Super Admin') {
            return next();
        }

        const hasPermission = permissions.every((perm) =>
            userPermissions.includes(perm)
        );

        if (!hasPermission) {
            return next(
                ApiError.forbidden('You do not have permission to perform this action')
            );
        }

        next();
    };
};

module.exports = authorize;
