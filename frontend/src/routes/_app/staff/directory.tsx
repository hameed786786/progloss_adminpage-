import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { UserCog, Search, Plus, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FormDialog, Field, FieldGrid, PrimaryBtn, SecondaryBtn } from "@/components/app/FormDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStaff, queryKeys } from "@/lib/hooks/api";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_app/staff/directory")({ component: Page });

const ZONES = ["Marina","Downtown","JBR","Emirates Hills","Dubai Hills","Damac Heights","Bay Central","Business Bay"];
const ROLES = ["Technician","Senior Technician","Lead Technician","Supervisor","Dispatcher","Office Admin"];

import { exportToCSV } from "@/lib/utils";
import { Download } from "lucide-react";

function Page() {
  const { data: staffData = [] } = useStaff();
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedZone, setSelectedZone] = useState("All");
  const [open, setOpen] = useState(false);

  const filteredStaff = staffData.filter((s) => {
    const term = search.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(term) ||
      (s.role || "").toLowerCase().includes(term) ||
      (s.zone || "").toLowerCase().includes(term) ||
      s.id.toLowerCase().includes(term);

    const matchesRole = selectedRole === "All" || s.role === selectedRole;
    const matchesZone = selectedZone === "All" || s.zone === selectedZone;

    return matchesSearch && matchesRole && matchesZone;
  });

  return (
    <>
      <TopBar title="Staff Directory" subtitle={`${staffData.length} employees · 8 zones · Dubai operations`} actions={
        <PrimaryBtn onClick={()=>setOpen(true)}><UserPlus className="h-3.5 w-3.5"/> <span className="hidden sm:inline">Add staff</span></PrimaryBtn>
      }/>
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Total staff" value={String(staffData.length)} icon={UserCog} accent="primary" />
          <KpiCard label="Technicians" value={String(staffData.filter(s=>s.role?.includes("Technician")).length)} icon={UserCog} accent="primary" />
          <KpiCard label="Supervisors" value={String(staffData.filter(s=>s.role==="Supervisor").length)} icon={UserCog} accent="primary" />
          <KpiCard label="Office / admin" value={String(staffData.filter(s=>!s.role?.includes("Technician") && s.role !== "Supervisor").length)} icon={UserCog} accent="primary" />
        </div>
        <Surface padded={false}>
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface-muted px-3 py-1.5 min-w-[240px]">
              <Search className="h-3.5 w-3.5 text-muted-foreground"/>
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, role, zone…" 
                className="flex-1 bg-transparent text-[13px] outline-none"
              />
            </div>
            
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[125px] h-8 rounded-xl border border-border bg-surface px-3 text-[12px] font-bold text-foreground hover:bg-accent focus:ring-0 focus:outline-none cursor-pointer">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-border bg-surface shadow-pop text-[12.5px] font-bold">
                <SelectItem value="All" className="rounded-lg focus:bg-accent cursor-pointer">All roles</SelectItem>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r} className="rounded-lg focus:bg-accent cursor-pointer">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-[125px] h-8 rounded-xl border border-border bg-surface px-3 text-[12px] font-bold text-foreground hover:bg-accent focus:ring-0 focus:outline-none cursor-pointer">
                <SelectValue placeholder="All zones" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-border bg-surface shadow-pop text-[12.5px] font-bold">
                <SelectItem value="All" className="rounded-lg focus:bg-accent cursor-pointer">All zones</SelectItem>
                {ZONES.map((z) => (
                  <SelectItem key={z} value={z} className="rounded-lg focus:bg-accent cursor-pointer">{z}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-2">
              <button 
                onClick={() => exportToCSV(filteredStaff, "staff_directory")}
                className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-[12px] font-bold hover:bg-accent"
              >
                <Download className="h-3 w-3" /> Export
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[720px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">Staff ID</th><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Zone</th><th className="px-4 py-3 text-left">Shift</th><th className="px-4 py-3 text-right">Status</th></tr>
              </thead>
              <tbody>
                {filteredStaff.map(s => (
                  <tr key={s.id} className="border-t border-border hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-mono font-bold">{s.id}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-[10.5px] font-black text-primary">{(s.name || "").split(" ").map(n=>n[0] || "").slice(0,2).join("")}</div><span className="font-bold">{s.name}</span></div></td>
                    <td className="px-4 py-3">{s.role}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.zone}</td>
                    <td className="px-4 py-3">{s.shift}</td>
                    <td className="px-4 py-3 text-right"><StatusChip tone={s.status==="Cleaning"?"primary":s.status==="Available"?"success":s.status==="Break"?"warning":s.status==="Offline"?"neutral":"info"}>{s.status}</StatusChip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      </div>


      <AddStaffDialog open={open} onOpenChange={setOpen} nextId={`PRG-T-${String(staffData.length + 1).padStart(3,"0")}`} />
    </>
  );
}

function AddStaffDialog({ open, onOpenChange, nextId }: { open: boolean; onOpenChange: (o:boolean)=>void; nextId: string }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [role, setRole] = useState("Technician");
  const [zone, setZone] = useState(ZONES[0]);
  const [shift, setShift] = useState("06:00–14:00");
  const [status, setStatus] = useState("Available");

  const reset = () => { setName(""); setRole("Technician"); setZone(ZONES[0]); setShift("06:00–14:00"); setStatus("Available"); };
  const submit = async () => {
    if (!name.trim()) return toast.error("Staff name is required");
    try {
      const s = { id: nextId, name: name.trim(), role, zone, status, building: "—", plate: "—", shift, eta: "—" };
      await api.createStaff(s);
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff });
      toast.success("Staff added", { description: `${s.name} · ${s.id}` });
      reset();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to add staff");
    }
  };

  return (
    <FormDialog open={open} onOpenChange={(o)=>{ onOpenChange(o); if (!o) reset(); }}
      title="Add new staff member" description="Create a staff record and assign them to a zone and shift."
      size="lg"
      footer={<><SecondaryBtn onClick={()=>{ reset(); onOpenChange(false); }}>Cancel</SecondaryBtn><PrimaryBtn onClick={submit}><Plus className="h-3.5 w-3.5"/> Add staff</PrimaryBtn></>}
    >
      <FieldGrid>
        <Field label="Full name"><Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g. Ahmed Khan" /></Field>
        <Field label="Role">
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>{ROLES.map(r=> <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </FieldGrid>
      <FieldGrid cols={3}>
        <Field label="Zone">
          <Select value={zone} onValueChange={setZone}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>{ZONES.map(z=> <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Shift">
          <Select value={shift} onValueChange={setShift}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="06:00–14:00">06:00–14:00</SelectItem>
              <SelectItem value="10:00–18:00">10:00–18:00</SelectItem>
              <SelectItem value="14:00–22:00">14:00–22:00</SelectItem>
              <SelectItem value="22:00–06:00">22:00–06:00 (Night)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Offline">Offline</SelectItem>
              <SelectItem value="Break">Break</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FieldGrid>
      <p className="text-[11.5px] text-muted-foreground">Staff ID will be assigned automatically: <span className="font-mono font-bold text-foreground">{nextId}</span></p>
    </FormDialog>
  );
}

