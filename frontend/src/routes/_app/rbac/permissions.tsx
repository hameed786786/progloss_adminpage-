import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { PermissionMatrix } from "@/components/app/PermissionMatrix";
import { useRBAC } from "@/lib/rbac-store";
import { ShieldCheck, Save, Search, ChevronDown, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/rbac/permissions")({ component: Permissions });

function Permissions() {
  const { roles, dirty, saveMatrix } = useRBAC();
  // Super Admin permissions are immutable — exclude from picker
  const editableRoles = roles.filter((r) => r.name !== "Super Admin");
  const [role, setRole] = useState(editableRoles[0]?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filteredRoles = editableRoles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  const current = editableRoles.find((r) => r.name === role);
  const isDirty = dirty.has(role);

  async function handleSave() {
    setSaving(true);
    try {
      await saveMatrix(role);
      toast.success("Permissions saved", { description: `${role} updated` });
    } catch {
      toast.error("Save failed", { description: "Could not save permissions. Try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <TopBar
        title="Permission Matrix"
        subtitle={`Enterprise-grade RBAC · ${roles.length} roles · 12 modules · 7 actions`}
        actions={
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="relative inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-[12.5px] font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDirty && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-background" />}
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving…" : "Save changes"}
          </button>
        }
      />
      <div className="grid gap-4 px-4 py-4 md:px-6 md:py-6 xl:grid-cols-4">
        {/* Mobile/Tablet role picker */}
        <div className="xl:hidden">
          <button onClick={() => setPickerOpen(!pickerOpen)} className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5 text-left shadow-card">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"><ShieldCheck className="h-3.5 w-3.5" /></div>
              <div className="leading-tight min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Editing role</div>
                <div className="text-[13px] font-black truncate">{role}</div>
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${pickerOpen ? "rotate-180" : ""}`} />
          </button>
          {pickerOpen && (
            <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-card">
              {filteredRoles.map((r) => (
                <button key={r.id} onClick={() => { setRole(r.name); setPickerOpen(false); }} className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left ${role === r.name ? "bg-primary/8" : "hover:bg-accent"}`}>
                  <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="flex-1 min-w-0"><div className="text-[12.5px] font-bold truncate">{r.name}</div><div className="text-[10.5px] text-muted-foreground truncate">{r.users} users</div></div>
                </button>
              ))}
              <div className="mt-1 flex items-center gap-2 rounded-lg px-2 py-2 opacity-50 cursor-not-allowed">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="flex-1 min-w-0"><div className="text-[12.5px] font-bold">Super Admin</div><div className="text-[10.5px] text-muted-foreground">Full access · not editable</div></div>
              </div>
            </div>
          )}
        </div>

        <Surface className="hidden xl:block xl:col-span-1">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-muted px-2.5 py-1.5 text-[12px] mb-3">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent outline-none" placeholder="Find a role…" />
          </div>
          <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
            {filteredRoles.map((r) => (
              <button key={r.id} onClick={() => setRole(r.name)} className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${role === r.name ? "bg-primary/8 ring-1 ring-primary/20" : "hover:bg-accent"}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${role === r.name ? "bg-primary text-primary-foreground" : "bg-surface-muted text-muted-foreground"}`}>
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0 leading-tight">
                  <div className="text-[12.5px] font-bold truncate">{r.name}</div>
                  <div className="text-[10.5px] text-muted-foreground truncate">{r.users} users · {r.id}</div>
                </div>
              </button>
            ))}
          </div>
          {/* Super Admin locked notice */}
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-border/60 bg-surface-muted/50 px-2.5 py-2 opacity-70">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-[12px] font-bold truncate">Super Admin</div>
              <div className="text-[10px] text-muted-foreground">Full access · not editable</div>
            </div>
          </div>
        </Surface>

        <Surface padded={false} className="xl:col-span-3 overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Editing role</div>
            <div className="mt-0.5 text-[18px] font-black tracking-tight">{role}</div>
            {current && <div className="text-[12px] text-muted-foreground">{current.desc}</div>}
          </div>
          {role && <PermissionMatrix roleName={role} editable />}
        </Surface>
      </div>
    </>
  );
}
