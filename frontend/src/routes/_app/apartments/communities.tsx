import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { StatusChip } from "@/components/app/StatusChip";
import { Building2, Users, Car, Wrench, Banknote, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FormDialog, Field, FieldGrid, PrimaryBtn, SecondaryBtn } from "@/components/app/FormDialog";
import { Input } from "@/components/ui/input";
import { useApartments, queryKeys } from "@/lib/hooks/api";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Apartment as Apt } from "@/lib/api/types";

export const Route = createFileRoute("/_app/apartments/communities")({ component: Communities });

function Communities() {
  const { data: apartmentsData = [] } = useApartments();
  const list = apartmentsData;
  const [open, setOpen] = useState(false);

  return (
    <>
      <TopBar
        title="Communities"
        subtitle={`${list.length} buildings under management · Dubai region`}
        actions={<PrimaryBtn onClick={()=>setOpen(true)}><Plus className="h-3.5 w-3.5"/> <span className="hidden sm:inline">Add community</span></PrimaryBtn>}
      />
      <div className="px-4 py-4 sm:px-6 sm:py-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((a) => (
          <Surface key={a.name}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2 className="h-4.5 w-4.5" /></div>
                <div>
                  <div className="text-[14px] font-black tracking-tight">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground">{a.units} units · Dubai</div>
                </div>
              </div>
              {(a.complaints ?? 0) > 0 ? <StatusChip tone={(a.complaints ?? 0) > 2 ? "danger" : "warning"}>{a.complaints} open</StatusChip> : <StatusChip tone="success">No issues</StatusChip>}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-[12px]">
              <div className="rounded-xl bg-surface-muted px-3 py-2.5"><div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground"><Users className="h-3 w-3" /> Residents</div><div className="mt-0.5 text-[16px] font-black tabular-nums">{a.residents}</div></div>
              <div className="rounded-xl bg-surface-muted px-3 py-2.5"><div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground"><Car className="h-3 w-3" /> Vehicles</div><div className="mt-0.5 text-[16px] font-black tabular-nums">{a.vehicles}</div></div>
              <div className="rounded-xl bg-surface-muted px-3 py-2.5"><div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground"><Wrench className="h-3 w-3" /> Staff</div><div className="mt-0.5 text-[16px] font-black tabular-nums">{a.staff}</div></div>
              <div className="rounded-xl bg-primary/8 px-3 py-2.5"><div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-primary"><Banknote className="h-3 w-3" /> MRR</div><div className="mt-0.5 text-[15px] font-black tabular-nums text-primary">AED {(a.mrr ?? 0).toLocaleString()}</div></div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11.5px]">
              <span className="text-muted-foreground">Occupancy</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 rounded-full bg-surface-muted overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${a.occupancy}%` }} /></div>
                <span className="tabular-nums font-bold">{a.occupancy}%</span>
              </div>
            </div>
          </Surface>
        ))}
      </div>

      <AddCommunityDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

function AddCommunityDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o:boolean)=>void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [units, setUnits] = useState("");
  const [residents, setResidents] = useState("");
  const [vehicles, setVehicles] = useState("");
  const [staff, setStaff] = useState("1");
  const [occupancy, setOccupancy] = useState("0");

  const reset = () => { setName(""); setUnits(""); setResidents(""); setVehicles(""); setStaff("1"); setOccupancy("0"); };
  const submit = async () => {
    if (!name.trim()) return toast.error("Community name is required");
    if (!units) return toast.error("Total units is required");
    try {
      const a = {
        name: name.trim(),
        units: parseInt(units) || 0,
        residents: parseInt(residents) || 0,
        vehicles: parseInt(vehicles) || 0,
        staff: parseInt(staff) || 1,
        mrr: 0,
        complaints: 0,
        occupancy: Math.min(100, Math.max(0, parseInt(occupancy) || 0)),
      };
      await api.createApartment(a);
      void queryClient.invalidateQueries({ queryKey: queryKeys.apartments });
      toast.success("Community added", { description: a.name });
      reset();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to add community");
    }
  };

  return (
    <FormDialog open={open} onOpenChange={(o)=>{ onOpenChange(o); if (!o) reset(); }}
      title="Add new community" description="Register a new building or villa community to your operations."
      size="lg"
      footer={<><SecondaryBtn onClick={()=>{ reset(); onOpenChange(false); }}>Cancel</SecondaryBtn><PrimaryBtn onClick={submit}><Plus className="h-3.5 w-3.5"/> Add community</PrimaryBtn></>}
    >
      <Field label="Community name"><Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g. Marina Gate 3" /></Field>
      <FieldGrid cols={3}>
        <Field label="Total units"><Input type="number" value={units} onChange={(e)=>setUnits(e.target.value)} /></Field>
        <Field label="Residents"><Input type="number" value={residents} onChange={(e)=>setResidents(e.target.value)} /></Field>
        <Field label="Vehicles"><Input type="number" value={vehicles} onChange={(e)=>setVehicles(e.target.value)} /></Field>
      </FieldGrid>
      <FieldGrid>
        <Field label="Assigned staff"><Input type="number" value={staff} onChange={(e)=>setStaff(e.target.value)} /></Field>
        <Field label="Occupancy %"><Input type="number" min={0} max={100} value={occupancy} onChange={(e)=>setOccupancy(e.target.value)} /></Field>
      </FieldGrid>
    </FormDialog>
  );
}
