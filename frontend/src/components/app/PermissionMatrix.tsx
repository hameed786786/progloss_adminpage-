import React, { useMemo, useState } from "react";
import { Check, Search, RotateCcw, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRBAC, type ModulePermissions } from "@/lib/rbac-store";

type Props = {
  roleName: string;
  editable?: boolean;
  compact?: boolean;
};

const CATEGORIES: { label: string; modules: string[] }[] = [
  { label: "Core", modules: ["Dashboard", "Analytics", "Audit"] },
  { label: "Commerce", modules: ["Subscriptions", "Billing & VAT", "Payments", "Ecommerce"] },
  { label: "Operations", modules: ["Operations", "Staff", "Apartments"] },
  { label: "People & Access", modules: ["Customers", "RBAC"] },
];

// Map display label → permission key
const ACTION_KEYS: string[] = ["view", "create", "edit", "delete", "export", "approve", "manage"];

function boolToV(b: boolean): number {
  return b ? 1 : 0;
}

function Cell({ v, editable, onClick }: { v: number; editable?: boolean; onClick?: () => void }) {
  const base = "mx-auto h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-black transition-all";
  const styles =
    v === 1
      ? "bg-primary text-primary-foreground shadow-sm"
      : "bg-surface-muted border border-border text-transparent";
  const interactive = editable ? "cursor-pointer hover:ring-2 hover:ring-primary/30 active:scale-95" : "";
  return (
    <button type="button" disabled={!editable} onClick={onClick} className={cn(base, styles, interactive)} aria-label={`Permission value ${v}`}>
      {v === 1 ? <Check className="h-3 w-3" strokeWidth={3} /> : "·"}
    </button>
  );
}

function emptyPerms(): ModulePermissions {
  return { view: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false };
}

export function PermissionMatrix({ roleName, editable = false, compact = false }: Props) {
  const { matrix, actions, modules, setCell, setModuleAll, resetRole } = useRBAC();
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const data = matrix[roleName] ?? {};

  const grouped = useMemo(() => {
    return CATEGORIES.map((c) => ({
      ...c,
      modules: c.modules.filter((m) => modules.includes(m) && m.toLowerCase().includes(query.toLowerCase())),
    })).filter((c) => c.modules.length > 0);
  }, [modules, query]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <div className="flex flex-1 min-w-[160px] items-center gap-2 rounded-xl border border-border bg-surface-muted px-2.5 py-1.5 text-[12px]">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent outline-none" placeholder="Search modules…" />
        </div>
        {editable && (
          <button onClick={() => resetRole(roleName)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-[11.5px] font-bold text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className={cn("w-full text-[12px]", compact ? "min-w-[560px]" : "min-w-[640px]")}>
          <thead className="bg-surface-muted/60 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sticky top-0 z-10">
            <tr>
              <th className="sticky left-0 z-20 bg-surface-muted/95 backdrop-blur px-3 py-3 text-left">Module</th>
              {actions.map((a) => <th key={a} className="px-2 py-3 text-center min-w-[56px]">{a}</th>)}
              {editable && <th className="px-2 py-3 text-center min-w-[64px]">All</th>}
            </tr>
          </thead>
          <tbody>
            {grouped.map((cat) => {
              const isCollapsed = collapsed[cat.label];
              return (
                <React.Fragment key={cat.label}>
                  <tr className="bg-surface-muted/30 border-t border-border">
                    <td colSpan={actions.length + (editable ? 2 : 1)} className="sticky left-0 px-3 py-1.5">
                      <button onClick={() => setCollapsed((s) => ({ ...s, [cat.label]: !s[cat.label] }))} className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:text-foreground">
                        <ChevronDown className={cn("h-3 w-3 transition-transform", isCollapsed && "-rotate-90")} />
                        {cat.label} · {cat.modules.length}
                      </button>
                    </td>
                  </tr>
                  {!isCollapsed && cat.modules.map((m) => {
                    const row: ModulePermissions = data[m] ?? emptyPerms();
                    const allFull = ACTION_KEYS.every((k) => (row as any)[k] === true);
                    return (
                      <tr key={m} className="border-t border-border hover:bg-surface-muted/30">
                        <td className="sticky left-0 z-10 bg-surface px-3 py-2 font-bold text-foreground whitespace-nowrap">{m}</td>
                        {ACTION_KEYS.map((key) => {
                          const v = boolToV((row as any)[key]);
                          return (
                            <td key={key} className="px-2 py-2">
                              <Cell
                                v={v}
                                editable={editable}
                                onClick={() => setCell(roleName, m, key, !(row as any)[key])}
                              />
                            </td>
                          );
                        })}
                        {editable && (
                          <td className="px-2 py-2">
                            <button onClick={() => setModuleAll(roleName, m, !allFull)} className="rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:border-primary/40">
                              {allFull ? "Clear" : "Grant"}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-[11px]">
        <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-primary" />Full</span>
          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-surface-muted ring-1 ring-border" />None</span>
        </div>
        {editable && <span className="text-muted-foreground">Tap a cell to toggle</span>}
      </div>
    </div>
  );
}
