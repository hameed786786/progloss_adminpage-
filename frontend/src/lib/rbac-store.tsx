import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useRoles, queryKeys } from "@/lib/hooks/api";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

export const PERM_MODULES = [
  "Dashboard","Customers","Subscriptions","Operations","Staff","Apartments",
  "Billing & VAT","Payments","Analytics","Ecommerce","RBAC","Audit",
];
export const PERM_ACTIONS = ["view","create","edit","delete","export","approve","manage"];

const INITIAL_ROLES: Role[] = [];
const INITIAL_MATRIX: Matrix = {};

export type Role = { id: string; name: string; users: number; color: string; desc: string };

export type ModulePermissions = {
  view: boolean; create: boolean; edit: boolean; delete: boolean;
  export: boolean; approve: boolean; manage: boolean;
};

/** Matrix: roleName → moduleName → ModulePermissions */
export type Matrix = Record<string, Record<string, ModulePermissions>>;

type Ctx = {
  roles: Role[];
  matrix: Matrix;
  modules: string[];
  actions: string[];
  dirty: Set<string>;
  createRole: (input: { name: string; desc: string; template?: string }) => Role;
  updateRole: (id: string, patch: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  setCell: (roleName: string, module: string, actionKey: string, value: boolean) => void;
  setModuleAll: (roleName: string, module: string, value: boolean) => void;
  resetRole: (roleName: string) => void;
  saveMatrix: (roleName: string) => Promise<void>;
};

const RBACContext = createContext<Ctx | null>(null);

function emptyPerms(): ModulePermissions {
  return { view: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false };
}

function allPerms(value: boolean): ModulePermissions {
  return { view: value, create: value, edit: value, delete: value, export: value, approve: value, manage: value };
}

function clone(m: Matrix): Matrix {
  const out: Matrix = {};
  for (const r of Object.keys(m)) {
    out[r] = {};
    for (const mod of Object.keys(m[r])) out[r][mod] = { ...m[r][mod] };
  }
  return out;
}

export function RBACProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: rolesData } = useRoles();

  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [matrix, setMatrix] = useState<Matrix>(() => clone(INITIAL_MATRIX));
  // Track which role names have unsaved local changes
  const [dirty, setDirty] = useState<Set<string>>(new Set());

  // Sync roles and matrix when fetched from backend.
  // Dirty roles are protected — their local edits are NOT overwritten by the server response.
  useEffect(() => {
    if (rolesData && rolesData.length > 0) {
      setRoles(rolesData.map(r => ({
        id: r.id,
        name: r.name,
        users: r.users,
        color: r.color || "neutral",
        desc: r.desc || "",
      })));
      setMatrix(prev => {
        const m: Matrix = {};
        for (const r of rolesData) {
          if (dirty.has(r.name)) {
            // Preserve local edits
            m[r.name] = prev[r.name] ?? (r.matrix ? clone({ x: r.matrix as any }).x : {});
          } else {
            m[r.name] = r.matrix ? clone({ x: r.matrix as any }).x : {};
          }
        }
        return m;
      });
    }
  // dirty intentionally omitted — we only want to re-run when server data changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolesData]);

  const createRole: Ctx["createRole"] = useCallback(({ name, desc, template }) => {
    const id = `ROL-${name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || "NEW"}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    const role: Role = { id, name, desc, users: 0, color: "neutral" };
    const base = template && matrix[template]
      ? clone({ [template]: matrix[template] })[template]
      : Object.fromEntries(PERM_MODULES.map((m) => [m, { view: true, create: false, edit: false, delete: false, export: false, approve: false, manage: false }]));

    setRoles((r) => [...r, role]);
    setMatrix((m) => ({ ...m, [name]: base }));

    void api.createRole({ name, desc, matrix: base }).then(() => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles });
    });

    return role;
  }, [matrix, queryClient]);

  const updateRole: Ctx["updateRole"] = useCallback((id, patch) => {
    setRoles((rs) => {
      const target = rs.find((r) => r.id === id);
      if (!target) return rs;
      const oldName = target.name;
      const next = rs.map((r) => (r.id === id ? { ...r, ...patch } : r));
      if (patch.name && patch.name !== oldName) {
        setMatrix((m) => {
          const cp = { ...m };
          cp[patch.name!] = cp[oldName];
          delete cp[oldName];
          return cp;
        });
      }
      return next;
    });
  }, []);

  const deleteRole: Ctx["deleteRole"] = useCallback((id) => {
    setRoles((rs) => {
      const target = rs.find((r) => r.id === id);
      if (target) {
        setMatrix((m) => { const cp = { ...m }; delete cp[target.name]; return cp; });
        void api.deleteRole(target.name).then(() => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.roles });
        });
      }
      return rs.filter((r) => r.id !== id);
    });
  }, [queryClient]);

  // Toggle a single cell — purely local state update, marks role dirty
  const setCell: Ctx["setCell"] = useCallback((roleName, module, actionKey, value) => {
    setMatrix((m) => {
      const row = m[roleName]?.[module] ?? emptyPerms();
      let next = { ...row, [actionKey]: value };
      if (actionKey === "view" && !value) {
        next = emptyPerms();
      } else if (actionKey !== "view" && value) {
        next.view = true;
      }
      return { ...m, [roleName]: { ...m[roleName], [module]: next } };
    });
    setDirty((d) => new Set(d).add(roleName));
  }, []);

  // Grant/clear all permissions for a module — purely local, marks role dirty
  const setModuleAll: Ctx["setModuleAll"] = useCallback((roleName, module, value) => {
    setMatrix((m) => {
      const nextRow = allPerms(value);
      return { ...m, [roleName]: { ...m[roleName], [module]: nextRow } };
    });
    setDirty((d) => new Set(d).add(roleName));
  }, []);

  // Explicit save — called by the "Save changes" button; persists to DB then clears dirty flag
  const saveMatrix: Ctx["saveMatrix"] = useCallback(async (roleName) => {
    const roleMatrix = matrix[roleName];
    if (!roleMatrix) return;
    await api.updateRolePermissions(roleName, roleMatrix);
    setDirty((d) => { const n = new Set(d); n.delete(roleName); return n; });
    void queryClient.invalidateQueries({ queryKey: queryKeys.roles });
  }, [matrix, queryClient]);

  // Reset role to all-false — marks dirty so user must explicitly save
  const resetRole: Ctx["resetRole"] = useCallback((roleName) => {
    const blankRow = Object.fromEntries(PERM_MODULES.map((md) => [md, emptyPerms()]));
    setMatrix((m) => ({ ...m, [roleName]: blankRow }));
    setDirty((d) => new Set(d).add(roleName));
  }, []);

  return (
    <RBACContext.Provider value={{
      roles, matrix, modules: PERM_MODULES, actions: PERM_ACTIONS, dirty,
      createRole, updateRole, deleteRole, setCell, setModuleAll, resetRole, saveMatrix,
    }}>
      {children}
    </RBACContext.Provider>
  );
}

export function useRBAC() {
  const ctx = useContext(RBACContext);
  if (!ctx) throw new Error("useRBAC must be used inside RBACProvider");
  return ctx;
}
