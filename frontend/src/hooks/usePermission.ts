import { useAuth } from '@/lib/auth-store';
import { useRBAC } from '@/lib/rbac-store';
import { can, PermissionAction } from '@/lib/rbac';

/**
 * React hook to perform UI-level permission checks reactively.
 * Usage: const { allowed } = usePermission("Customers", "CREATE");
 */
export function usePermission(module: string, action: PermissionAction) {
  const { user } = useAuth();
  const { matrix } = useRBAC();

  if (!user) {
    return { allowed: false };
  }

  // Build a virtual RoleRecord compatible with the `can` utility helper
  const roleRecord = {
    name: user.role,
    matrix: matrix[user.role] || {},
  } as any;

  const allowed = can(roleRecord, module, action);

  return { allowed };
}
