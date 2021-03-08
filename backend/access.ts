import { permissionsList } from './schemas/fields';
import { ListAccessArgs } from './types';

export function isSignedIn({ session }: ListAccessArgs) {
    return !!session;
}

const generatedPermissions = Object.fromEntries(
    permissionsList.map((permission) => [
        permission,
        function ({ session }: ListAccessArgs) {
            return !!session?.data.role?.[permission];
        },
    ])
);

// Permissions check if someone meets a criteria yes or no
export const permissions = {
    ...generatedPermissions,
    isAwesome({ session }: ListAccessArgs) {
        return session?.data.name.includes('eleftherios');
    },
};

// Rule based function
// Rules can return a boolean - yes or no - or a filter which limits
// products they can CRUD.
export const rules = {
    canManageProducts({ session }: ListAccessArgs) {
        if (!isSignedIn({ session })) {
            return false;
        }

        if (permissions.canManageProducts({ session })) {
            return true;
        }

        return { user: { id: session.itemId } };
    },
    canOrder({ session }: ListAccessArgs) {
        if (!isSignedIn({ session })) {
            return false;
        }
        if (permissions.canManageCart({ session })) {
            return true;
        }

        return { user: { id: session.itemId } };
    },
    canManageOrderItems({ session }: ListAccessArgs) {
        if (!isSignedIn({ session })) {
            return false;
        }

        if (permissions.canManageCart({ session })) {
            return true;
        }

        return { order: { user: { id: session.itemId } } };
    },
    canReadProducts({ session }: ListAccessArgs) {
        if (permissions.canManageProducts({ session })) {
            return true; // They can read everything
        }

        // They should only see available products based on the status field
        return { status: 'AVAILABLE' };
    },
    canManagerUsers({ session }: ListAccessArgs) {
        if (!isSignedIn({ session })) {
            return false;
        }
        if (permissions.canManageUsers({ session })) {
            return true;
        }

        return { id: session.itemId };
    },
};
