import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { StatusChip } from "@/components/app/StatusChip";
import { Plus, Sparkles, Repeat, Car, Check, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FormDialog, Field, FieldGrid, PrimaryBtn, SecondaryBtn } from "@/components/app/FormDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlans, queryKeys } from "@/lib/hooks/api";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Plan as APIPlan } from "@/lib/api/types";

export const Route = createFileRoute("/_app/subscriptions/plans")({ component: PlansPage });

type Plan = APIPlan;

function PlansPage() {
  const queryClient = useQueryClient();
  const { data: plansData = [] } = usePlans();
  
  const plans = plansData;
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);

  return (
    <>
      <TopBar title="Subscription Plans" subtitle="Manage pricing, frequency, perks and vehicle support"
        actions={<PrimaryBtn onClick={()=>setCreateOpen(true)}><Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">New plan</span></PrimaryBtn>}/>
      <div className="px-4 py-4 sm:px-6 sm:py-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((p, i) => (
          <Surface key={p.id} className="flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles className="h-4 w-4" /></div>
              {i === 1 && <StatusChip tone="primary">Most popular</StatusChip>}
            </div>
            <div className="mt-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{p.id}</div>
              <div className="text-[17px] font-black tracking-tight">{p.name}</div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-[28px] font-black tracking-tight">{p.price}</span>
              <span className="text-[12px] text-muted-foreground">AED · {p.freq}</span>
            </div>
            <div className="mt-3 flex gap-2 text-[11px]">
              <div className="flex items-center gap-1 rounded-md bg-surface-muted px-2 py-1 font-bold"><Repeat className="h-3 w-3" /> {p.washes} washes</div>
              <div className="flex items-center gap-1 rounded-md bg-surface-muted px-2 py-1 font-bold"><Car className="h-3 w-3" /> {p.vehicles} vehicle{p.vehicles && p.vehicles>1?"s":""}</div>
            </div>
            <ul className="mt-4 space-y-1.5 text-[12.5px] flex-1">
              {(p.perks ?? []).map((b) => (
                <li key={b} className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 text-primary shrink-0" /><span className="text-foreground/80">{b}</span></li>
              ))}
            </ul>
            <div className="mt-4 border-t border-border pt-3 flex items-center justify-between text-[11.5px]">
              <span className="text-muted-foreground">{p.active ?? 0} active</span>
              <button onClick={()=>setEditing(p as Plan)} className="inline-flex items-center gap-1 text-primary font-bold hover:underline"><Pencil className="h-3 w-3" /> Edit plan</button>
            </div>
          </Surface>
        ))}
      </div>

      <PlanDialog
        open={createOpen} mode="create" onOpenChange={setCreateOpen}
        onSave={async (p)=>{
          try {
            await api.createPlan(p);
            void queryClient.invalidateQueries({ queryKey: queryKeys.plans });
            toast.success("Plan created", { description: `${p.name} · ${p.id}` });
          } catch (e: any) {
            toast.error(e.message || "Failed to create plan");
          }
        }}
        nextId={`PLN-${String(plans.length + 1).padStart(3, "0")}`}
      />
      <PlanDialog
        open={!!editing} mode="edit" plan={editing ?? undefined} onOpenChange={(o)=>!o && setEditing(null)}
        onSave={async (p)=>{
          try {
            await api.updatePlan(p.id, p);
            void queryClient.invalidateQueries({ queryKey: queryKeys.plans });
            toast.success("Plan updated", { description: p.name });
            setEditing(null);
          } catch (e: any) {
            toast.error(e.message || "Failed to update plan");
          }
        }}
      />
    </>
  );
}

function PlanDialog({ open, mode, plan, onOpenChange, onSave, nextId }: { open: boolean; mode: "create"|"edit"; plan?: Plan; onOpenChange: (o:boolean)=>void; onSave: (p: Plan)=>void; nextId?: string }) {
  const [name, setName] = useState(plan?.name ?? "");
  const [price, setPrice] = useState(String(plan?.price ?? 0));
  const [freq, setFreq] = useState(plan?.freq ?? "monthly");
  const [washes, setWashes] = useState(String(plan?.washes ?? 4));
  const [vehicles, setVehicles] = useState(String(plan?.vehicles ?? 1));
  const [perks, setPerks] = useState((plan?.perks ?? []).join("\n"));

  useEffect(() => {
    if (open) {
      setName(plan?.name ?? "");
      setPrice(String(plan?.price ?? 0));
      setFreq(plan?.freq ?? "monthly");
      setWashes(String(plan?.washes ?? 4));
      setVehicles(String(plan?.vehicles ?? 1));
      setPerks((plan?.perks ?? []).join("\n"));
    }
  }, [open, plan]);

  const submit = () => {
    if (!name.trim()) return toast.error("Plan name is required");
    const p: Plan = {
      id: plan?.id ?? nextId ?? "PLN-NEW",
      name: name.trim(),
      price: parseFloat(price) || 0,
      freq, washes: parseInt(washes) || 1, vehicles: parseInt(vehicles) || 1,
      perks: perks.split("\n").map(s=>s.trim()).filter(Boolean),
      active: plan?.active ?? 0,
    };
    onSave(p); onOpenChange(false);
  };

  return (
    <FormDialog open={open} onOpenChange={onOpenChange}
      title={mode==="create" ? "Create new plan" : `Edit plan · ${plan?.name ?? ""}`}
      description="Configure pricing, frequency and perks. Existing subscribers are unaffected."
      size="lg"
      footer={<><SecondaryBtn onClick={()=>onOpenChange(false)}>Cancel</SecondaryBtn><PrimaryBtn onClick={submit}>{mode==="create" ? <><Plus className="h-3.5 w-3.5"/> Create plan</> : "Save changes"}</PrimaryBtn></>}
    >
      <FieldGrid>
        <Field label="Plan name"><Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g. Platinum Monthly" /></Field>
        <Field label="Price (AED)"><Input type="number" value={price} onChange={(e)=>setPrice(e.target.value)} /></Field>
      </FieldGrid>
      <FieldGrid cols={3}>
        <Field label="Frequency">
          <Select value={freq} onValueChange={setFreq}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Washes"><Input type="number" value={washes} onChange={(e)=>setWashes(e.target.value)} /></Field>
        <Field label="Vehicles"><Input type="number" value={vehicles} onChange={(e)=>setVehicles(e.target.value)} /></Field>
      </FieldGrid>
      <Field label="Perks (one per line)">
        <Textarea rows={5} value={perks} onChange={(e)=>setPerks(e.target.value)} placeholder={"Ceramic top-up\nInterior detail\nPriority slots"} />
      </Field>
    </FormDialog>
  );
}

