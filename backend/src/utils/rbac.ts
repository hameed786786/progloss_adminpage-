/**
 * RBAC permission utilities.
 *
 * Matrix format (stored in MongoDB):
 *   { "Customers": { "view": true, "create": true, "edit": false, ... } }
 *
 * Action keys map directly to object property names — no index arithmetic needed.
 */

export const ACTIONS = {
  VIEW:    'view',
  CREATE:  'create',
  EDIT:    'edit',
  DELETE:  'delete',
  EXPORT:  'export',
  APPROVE: 'approve',
  MANAGE:  'manage',
} as const;

export type PermissionAction = keyof typeof ACTIONS;
export type ActionKey = typeof ACTIONS[PermissionAction];

export type ModulePermissions = {
  view:    boolean;
  create:  boolean;
  edit:    boolean;
  delete:  boolean;
  export:  boolean;
  approve: boolean;
  manage:  boolean;
};

export type PermissionMatrix = Record<string, ModulePermissions>;

export interface Role {
  id: string;
  name: string;
  matrix: PermissionMatrix;
  [key: string]: any;
}

/**
 * Checks if the role is the Super Admin.
 */
export function isSuperAdmin(role: Role | string | undefined): boolean {
  if (!role) return false;
  const roleName = typeof role === 'string' ? role : role.name;
  return roleName === 'Super Admin';
}

/**
 * Checks if a role is permitted to perform a specific action on a module.
 */
export function can(role: Role | undefined, module: string, action: PermissionAction): boolean {
  if (!role) return false;
  if (isSuperAdmin(role)) return true;

  const matrix = role.matrix || {};
  const perms = matrix[module];
  if (!perms || typeof perms !== 'object' || Array.isArray(perms)) return false;

  const key = ACTIONS[action] as ActionKey;
  if (key !== 'view' && perms.view !== true) return false;

  return perms[key] === true;
}

/**
 * Checks if a role has any permission for a given module.
 */
export function hasAnyPermission(role: Role | undefined, module: string): boolean {
  if (!role) return false;
  if (isSuperAdmin(role)) return true;

  const matrix = role.matrix || {};
  const perms = matrix[module];
  if (!perms || typeof perms !== 'object' || Array.isArray(perms)) return false;

  return Object.values(perms).some(v => v === true);
}

/**
 * Checks if a role has all of the specified permissions for a given module.
 */
export function hasAllPermissions(role: Role | undefined, module: string, actions: PermissionAction[]): boolean {
  if (!role) return false;
  if (isSuperAdmin(role)) return true;

  return actions.every(action => can(role, module, action));
}
