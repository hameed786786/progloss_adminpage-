import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { Surface, SectionTitle } from "@/components/app/Surface";
import { StatusChip } from "@/components/app/StatusChip";
import { GripVertical, MapPin, Search, ChevronDown, Check, X } from "lucide-react";
import { useWorkOrders, useStaff, queryKeys } from "@/lib/hooks/api";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/operations/dispatch")({ component: Dispatch });

const STAT: Record<string, "primary"|"info"|"warning"|"success"|"danger"|"neutral"> = {
  "in-progress": "primary",
  "en-route": "info",
  queued: "warning",
  done: "success",
  completed: "success",
  delayed: "warning",
  cancelled: "neutral",
};

function Dispatch() {
  const queryClient = useQueryClient();
  const { data: workOrdersData = [] } = useWorkOrders();
  const { data: staffData = [] } = useStaff();
  const [search, setSearch] = useState("");
  const [reassigning, setReassigning] = useState<string | null>(null); // work order id being reassigned
  const [saving, setSaving] = useState(false);

  const filteredWorkOrders = workOrdersData.filter((w) => {
    const s = search.toLowerCase();
    return (
      w.id.toLowerCase().includes(s) ||
      (w.community || "").toLowerCase().includes(s) ||
      (w.plate || "").toLowerCase().includes(s) ||
      (w.tech || "").toLowerCase().includes(s) ||
      (w.status || "").toLowerCase().includes(s)
    );
  });

  // Compute tech load: count work orders per tech (excluding done/cancelled)
  const techLoad: Record<string, number> = {};
  for (const wo of workOrdersData) {
    if (wo.tech && wo.status !== "done" && wo.status !== "completed" && wo.status !== "cancelled") {
      techLoad[wo.tech] = (techLoad[wo.tech] ?? 0) + 1;
    }
  }
  const maxLoad = Math.max(1, ...Object.values(techLoad));

  async function handleReassign(workOrderId: string, newTech: string) {
    setSaving(true);
    try {
      await api.updateWorkOrder(workOrderId, { tech: newTech });
      void queryClient.invalidateQueries({ queryKey: queryKeys.workOrders });
      toast.success("Technician reassigned", { description: `${workOrderId} → ${newTech}` });
    } catch (e: any) {
      toast.error(e.message || "Failed to reassign technician");
    } finally {
      setSaving(false);
      setReassigning(null);
    }
  }

  // Group work orders by community for the map pins
  const communityGroups: Record<string, number> = {};
  for (const wo of workOrdersData) {
    if (wo.community) communityGroups[wo.community] = (communityGroups[wo.community] ?? 0) + 1;
  }

  // Fixed pin positions for known communities
  const PIN_POSITIONS: Record<string, { t: string; l: string }> = {
    "Marina Gate 2": { t: "18%", l: "22%" },
    "Burj Vista 1": { t: "32%", l: "48%" },
    "Damac Heights": { t: "52%", l: "30%" },
    "Emirates Hills 47": { t: "28%", l: "74%" },
    "Dubai Hills": { t: "68%", l: "60%" },
    "JBR": { t: "78%", l: "26%" },
  };
  const pins = Object.entries(communityGroups).map(([name, count], i) => {
    const pos = PIN_POSITIONS[name] ?? { t: `${20 + (i * 13) % 60}%`, l: `${15 + (i * 17) % 70}%` };
    return { name, count, ...pos };
  });

  const selectedWO = reassigning ? workOrdersData.find(w => w.id === reassigning) : null;

  return (
    <>
      <TopBar title="Dispatch Center" subtitle={`${filteredWorkOrders.length} work orders in queue · click a card to reassign`} />
      <div className="grid gap-4 px-4 py-4 sm:px-6 sm:py-6 xl:grid-cols-5">
        {/* Map panel */}
        <Surface className="xl:col-span-3 !p-0 overflow-hidden">
          <div className="relative h-[600px] bg-gradient-to-br from-[oklch(0.97_0.015_220)] to-[oklch(0.95_0.025_258)]">
            <svg className="absolute inset-0 h-full w-full opacity-50">
              <defs><pattern id="dg" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="oklch(0.86 0.015 250)" strokeWidth="0.5"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#dg)" />
            </svg>
            <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 shadow-card">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56 bg-transparent text-[12px] outline-none"
                placeholder="Filter by zone, plate, technician…"
              />
            </div>
            {pins.map((p, i) => (
              <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ top: p.t, left: p.l }}>
                <div className="rounded-xl bg-primary px-2.5 py-1.5 text-[11px] font-bold text-primary-foreground shadow-elevated flex items-center gap-1 whitespace-nowrap">
                  <MapPin className="h-3 w-3" /> {p.name} · {p.count} WO
                </div>
              </div>
            ))}
          </div>
        </Surface>

        <div className="xl:col-span-2 space-y-3">
          {/* Booking queue */}
          <Surface className="!p-4">
            <SectionTitle title="Booking queue" sub="Today · sorted by slot · click to reassign" />
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {filteredWorkOrders.length === 0 && (
                <div className="py-6 text-center text-[12px] text-muted-foreground">No work orders match the filter.</div>
              )}
              {filteredWorkOrders.map((w) => (
                <div key={w.id}>
                  <div
                    onClick={() => setReassigning(reassigning === w.id ? null : w.id)}
                    className={`group flex items-center gap-2 rounded-xl border p-2.5 cursor-pointer transition-all ${
                      reassigning === w.id
                        ? "border-primary/40 bg-primary/5 shadow-sm"
                        : "border-border bg-surface-muted/40 hover:border-primary/30 hover:bg-surface-muted/70"
                    }`}
                  >
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                    <div className="flex-1 leading-tight min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[12.5px]">{w.id}</span>
                        <StatusChip tone={STAT[w.status || "queued"] || "info"}>{w.status}</StatusChip>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">{w.community} · {w.plate} · {w.slot}</div>
                    </div>
                    <div className="text-right text-[11px] shrink-0">
                      <div className="text-muted-foreground">Tech</div>
                      <div className="font-bold">{w.tech || "—"}</div>
                    </div>
                    <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0 ${reassigning === w.id ? "rotate-180" : ""}`} />
                  </div>

                  {/* Inline tech picker */}
                  {reassigning === w.id && (
                    <div className="mt-1 rounded-xl border border-primary/20 bg-surface shadow-card overflow-hidden">
                      <div className="px-3 py-2 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Reassign technician — {w.id}
                      </div>
                      <div className="max-h-48 overflow-y-auto divide-y divide-border">
                        <button
                          onClick={() => handleReassign(w.id, "")}
                          disabled={saving}
                          className="flex w-full items-center gap-2 px-3 py-2 text-[12px] hover:bg-accent text-left disabled:opacity-50"
                        >
                          <span className="flex-1 text-muted-foreground italic">Unassigned</span>
                          {!w.tech && <Check className="h-3.5 w-3.5 text-primary" />}
                        </button>
                        {staffData.map((s) => (
                          <button
                            key={s.id ?? s.name}
                            onClick={() => handleReassign(w.id, s.name)}
                            disabled={saving}
                            className="flex w-full items-center gap-2 px-3 py-2 text-[12px] hover:bg-accent text-left disabled:opacity-50"
                          >
                            <div className="flex-1 leading-tight">
                              <div className="font-bold">{s.name}</div>
                              {s.role && <div className="text-[10.5px] text-muted-foreground">{s.role}</div>}
                            </div>
                            <div className="text-[10px] text-muted-foreground tabular-nums">
                              {techLoad[s.name] ?? 0} WO
                            </div>
                            {w.tech === s.name && <Check className="h-3.5 w-3.5 text-primary" />}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-end px-3 py-2 border-t border-border">
                        <button
                          onClick={() => setReassigning(null)}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11.5px] font-bold text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Surface>

          {/* Technician load */}
          <Surface className="!p-4">
            <SectionTitle title="Technician load" sub="Active work orders today" />
            <div className="space-y-2.5">
              {staffData.slice(0, 6).map((s) => {
                const count = techLoad[s.name] ?? 0;
                const pct = maxLoad > 0 ? Math.round((count / maxLoad) * 100) : 0;
                return (
                  <div key={s.id ?? s.name} className="flex items-center gap-3 text-[12px]">
                    <div className="w-28 truncate font-bold" title={s.name}>{s.name}</div>
                    <div className="flex-1 h-1.5 rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct > 85 ? "bg-destructive" : pct > 60 ? "bg-[oklch(0.74_0.15_75)]" : "bg-primary"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="w-12 text-right tabular-nums text-muted-foreground font-bold">
                      {count} WO
                    </div>
                  </div>
                );
              })}
              {staffData.length === 0 && (
                <div className="text-[12px] text-muted-foreground text-center py-4">No staff data.</div>
              )}
            </div>
          </Surface>
        </div>
      </div>
    </>
  );
}
