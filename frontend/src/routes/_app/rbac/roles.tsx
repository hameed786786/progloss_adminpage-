import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { StatusChip } from "@/components/app/StatusChip";
import { PermissionMatrix } from "@/components/app/PermissionMatrix";
import { useRBAC, type Role } from "@/lib/rbac-store";
import { ShieldCheck, Plus, Pencil, Trash2, Settings2, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_app/rbac/roles")({ component: Roles });

import { usePermission } from "@/hooks/usePermission";

function Roles() {
  const { allowed: canView } = usePermission("RBAC", "VIEW");
  const { allowed: canCreate } = usePermission("RBAC", "CREATE");
  const { allowed: canEdit } = usePermission("RBAC", "EDIT");
  const { allowed: canDelete } = usePermission("RBAC", "DELETE");

  const { roles, createRole, updateRole, deleteRole } = useRBAC();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState<Role | null>(null);

  if (!canView) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm font-bold text-muted-foreground">Access Denied: Missing VIEW permission for RBAC</div>
      </div>
    );
  }

  return (
    <>
      <TopBar
        title="Roles"
        subtitle={`${roles.length} roles · ${roles.reduce((s, r) => s + r.users, 0)} users assigned`}
        actions={
          canCreate ? (
            <button onClick={() => setCreateOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-[12.5px] font-bold text-primary-foreground hover:bg-primary/90">
              <Plus className="h-3.5 w-3.5" /> New role
            </button>
          ) : undefined
        }
      />
      <div className="px-4 py-4 md:px-6 md:py-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {roles.map((r) => (
          <Surface key={r.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="h-4 w-4" /></div>
                <div className="min-w-0">
                  <div className="text-[14px] font-black tracking-tight truncate">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{r.id}</div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                  <Settings2 className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {canCreate && (
                    <DropdownMenuItem onClick={() => {
                      const copy = createRole({ name: `${r.name} (Copy)`, desc: r.desc, template: r.name });
                      toast.success("Role duplicated", { description: copy.name });
                    }}><Copy className="mr-2 h-3.5 w-3.5" />Duplicate</DropdownMenuItem>
                  )}
                  {canCreate && <DropdownMenuSeparator />}
                  {canDelete && (
                    <DropdownMenuItem onClick={() => setDeleting(r)} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-3.5 w-3.5" />Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="mt-3 text-[12.5px] text-foreground/80 line-clamp-2 min-h-[34px]">{r.desc}</p>
            <div className="mt-4 flex items-center justify-between gap-2 text-[11.5px]">
              <StatusChip tone="primary">{r.users} users</StatusChip>
              {canEdit && (
                <button onClick={() => setEditing(r)} className="inline-flex items-center gap-1 text-primary font-bold hover:underline">
                  <Pencil className="h-3 w-3" /> Edit permissions
                </button>
              )}
            </div>
          </Surface>
        ))}
      </div>

      <CreateRoleDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditRoleDialog role={editing} onOpenChange={(o) => !o && setEditing(null)} onSaved={(name) => { setEditing(null); toast.success("Role updated", { description: name }); }} />
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the role and revoke access for {deleting?.users ?? 0} users. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deleting) { deleteRole(deleting.id); toast.success("Role deleted", { description: deleting.name }); }
              setDeleting(null);
            }} className="bg-destructive hover:bg-destructive/90">Delete role</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CreateRoleDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { roles, createRole } = useRBAC();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [template, setTemplate] = useState<string>("__blank");
  const [createdName, setCreatedName] = useState<string | null>(null);

  const reset = () => { setStep(1); setName(""); setDesc(""); setTemplate("__blank"); setCreatedName(null); };

  const next = () => {
    if (!name.trim()) return toast.error("Role name is required");
    if (roles.some((r) => r.name.toLowerCase() === name.trim().toLowerCase())) return toast.error("A role with that name already exists");
    const r = createRole({ name: name.trim(), desc: desc.trim() || "Custom role", template: template === "__blank" ? undefined : template });
    setCreatedName(r.name);
    setStep(2);
    toast.success("Role created", { description: `${r.name} · ${r.id}` });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className={step === 1 ? "sm:max-w-[480px]" : "max-w-[100vw] sm:max-w-[860px] p-0 overflow-hidden max-h-[92vh] flex flex-col"}>
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-[16px] font-black tracking-tight">Create new role · Step 1 of 2</DialogTitle>
              <DialogDescription>Define the role, then configure permissions on the next step.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="role-name" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Role name</Label>
                <Input id="role-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Regional Manager" autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role-desc" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                <Textarea id="role-desc" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What can this role do?" rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Start from</Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__blank">Blank · read-only on Dashboard</SelectItem>
                    {roles.filter(r => r && r.name).map((r) => <SelectItem key={r.id} value={r.name}>Clone from {r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => { reset(); onOpenChange(false); }} className="inline-flex h-9 items-center rounded-xl border border-border bg-surface px-3 text-[12.5px] font-bold text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={next} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-[12.5px] font-bold text-primary-foreground hover:bg-primary/90">
                Continue · set permissions
              </button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="px-5 py-4 border-b border-border">
              <DialogTitle className="text-[16px] font-black tracking-tight">Configure permissions · {createdName}</DialogTitle>
              <DialogDescription>Toggle cells to set Read, Create, Update, Delete and more. Changes save instantly.</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-auto">
              {createdName && <PermissionMatrix roleName={createdName} editable />}
            </div>
            <DialogFooter className="px-5 py-3 border-t border-border bg-surface-muted/30">
              <button onClick={() => { reset(); onOpenChange(false); }} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-[12.5px] font-bold text-primary-foreground hover:bg-primary/90">
                Done
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}


function EditRoleDialog({ role, onOpenChange, onSaved }: { role: Role | null; onOpenChange: (o: boolean) => void; onSaved: (name: string) => void }) {
  const { updateRole } = useRBAC();
  const [name, setName] = useState(role?.name ?? "");
  const [desc, setDesc] = useState(role?.desc ?? "");




  return (
    <Dialog open={!!role} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[100vw] sm:max-w-[860px] p-0 overflow-hidden max-h-[92vh] flex flex-col"
        onOpenAutoFocus={() => { if (role) { setName(role.name); setDesc(role.desc); } }}
      >
        {role && (
          <>
            <DialogHeader className="px-5 py-4 border-b border-border">
              <DialogTitle className="text-[16px] font-black tracking-tight">Edit role · {role.name}</DialogTitle>
              <DialogDescription>Update role details and configure permissions inline.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 px-5 py-4 sm:grid-cols-2 border-b border-border">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Role name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                <Input value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <PermissionMatrix roleName={role.name} editable />
            </div>

            <DialogFooter className="px-5 py-3 border-t border-border bg-surface-muted/30">
              <button onClick={() => onOpenChange(false)} className="inline-flex h-9 items-center rounded-xl border border-border bg-surface px-3 text-[12.5px] font-bold text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={() => {
                if (!name.trim()) return toast.error("Role name is required");
                updateRole(role.id, { name: name.trim(), desc: desc.trim() });
                onSaved(name.trim());
              }} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-[12.5px] font-bold text-primary-foreground hover:bg-primary/90">
                Save changes
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
