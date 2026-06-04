import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface, SectionTitle } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { AsyncState } from "@/components/app/AsyncState";
import { Car, Clock, UserCheck, Calendar, CheckCircle2, Check, X } from "lucide-react";
import { useWorkOrders, useStaff, queryKeys } from "@/lib/hooks/api";
import { useState } from "react";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_app/operations/daily")({ component: Page });

const STAT_TONE: Record<string, "primary" | "info" | "success" | "warning" | "danger" | "neutral"> = {
  "in-progress": "primary",
  "en-route": "info",
  completed: "success",
  done: "success",
  queued: "warning",
  delayed: "danger",
  cancelled: "neutral"
};

function Page() {
  const queryClient = useQueryClient();
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const { data: workOrdersData = [], isLoading: isWorkOrdersLoading, error: workOrdersError } = useWorkOrders();
  const { data: staffData = [], isLoading: isStaffLoading, error: staffError } = useStaff();

  const isLoading = isWorkOrdersLoading || isStaffLoading;
  const error = workOrdersError || staffError;

  const workOrders = workOrdersData;
  const staff = staffData;

  const handleStatusUpdate = async (staffId: string, newStatus: string) => {
    setUpdating(true);
    try {
      await api.updateStaff(staffId, { status: newStatus });
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff });
      toast.success("Technician status updated", { description: `Status changed to ${newStatus}` });
    } catch (e: any) {
      toast.error(e.message || "Failed to update technician status");
    } finally {
      setUpdating(false);
      setEditingStaffId(null);
    }
  };

  const totalTechsOnShift = staff.filter(s => s.status !== "Offline").length;
  const totalTechs = staff.length;
  const techsOnShiftValue = `${totalTechsOnShift} / ${totalTechs}`;

  const completedWashes = workOrders.filter(w => w.status === "completed" || w.status === "done").length;

  // Dynamic Avg Wash Time calculation based on plan mix in the queue
  const planTimes: Record<string, number> = { Eco: 25, Premium: 40, Royal: 55, Fleet: 35 };
  let totalTime = 0;
  let countWithTime = 0;
  for (const w of workOrders) {
    const key = Object.keys(planTimes).find(k => w.plan?.includes(k));
    if (key) {
      totalTime += planTimes[key];
      countWithTime++;
    }
  }
  const avgWashTime = countWithTime > 0 ? `${Math.round(totalTime / countWithTime)}m` : "38m";

  // Dynamic On-time rate calculation
  const delayedWashes = workOrders.filter(w => w.status === "delayed").length;
  const totalWashes = workOrders.length;
  const onTimeRate = totalWashes > 0 ? `${Math.round(((totalWashes - delayedWashes) / totalWashes) * 100)}%` : "100%";

  // Dynamic shift supervisor search from database
  const morningStaff = staff.filter(s => s.shift?.startsWith("06:00"));
  const morningLead = morningStaff.find(s => s.role?.includes("Lead") || s.role?.includes("Senior") || s.role?.includes("Supervisor"))?.name || "Sara Khoury";

  const afternoonStaff = staff.filter(s => s.shift?.startsWith("10:00"));
  const afternoonLead = afternoonStaff.find(s => s.role?.includes("Lead") || s.role?.includes("Senior") || s.role?.includes("Supervisor"))?.name || "Khalid Noor";

  const eveningStaff = staff.filter(s => s.shift?.startsWith("14:00"));
  const eveningLead = eveningStaff.find(s => s.role?.includes("Lead") || s.role?.includes("Senior") || s.role?.includes("Supervisor"))?.name || "Abdellah Naciri";

  const SHIFTS = [
    { name: "Morning · 06:00–14:00", on: morningStaff.filter(s => s.status !== "Offline").length, expected: morningStaff.length, supervisor: morningLead },
    { name: "Afternoon · 10:00–18:00", on: afternoonStaff.filter(s => s.status !== "Offline").length, expected: afternoonStaff.length, supervisor: afternoonLead },
    { name: "Evening · 14:00–22:00", on: eveningStaff.filter(s => s.status !== "Offline").length, expected: eveningStaff.length, supervisor: eveningLead },
  ];

  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short", year: "numeric" });

  const getCurrentShiftName = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return "Morning shift in progress";
    if (hour >= 10 && hour < 14) return "Mid-day operations in progress";
    if (hour >= 14 && hour < 18) return "Afternoon shift in progress";
    if (hour >= 18 && hour < 22) return "Evening shift in progress";
    return "Off-shift hours";
  };

  return (
    <>
      <TopBar title="Daily Operations" subtitle={`${dateStr} · Dubai · ${getCurrentShiftName()}`} />
      <AsyncState isLoading={isLoading} error={error as Error | null}>
        <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <KpiCard label="Cars cleaned" value={String(completedWashes)} icon={Car} accent="primary" hint={`Target ${workOrders.length}`} />
            <KpiCard label="Avg wash time" value={avgWashTime} icon={Clock} accent="success" />
            <KpiCard label="Techs on shift" value={techsOnShiftValue} icon={UserCheck} accent="primary" />
            <KpiCard label="On-time rate" value={onTimeRate} icon={CheckCircle2} accent="success" />
          </div>
          <Surface>
            <SectionTitle title="Shifts today" />
            <div className="grid gap-3 md:grid-cols-3">
              {SHIFTS.map(s => (
                <div key={s.name} className="rounded-xl border border-border bg-surface-muted/40 p-4">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3 w-3"/> {s.name}</div>
                  <div className="mt-2 flex items-end justify-between"><span className="text-[28px] font-black tabular-nums">{s.on}</span><span className="text-[12px] text-muted-foreground mb-1">of {s.expected}</span></div>
                  <div className="mt-2 h-1.5 rounded-full bg-surface overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${s.expected > 0 ? (s.on / s.expected) * 100 : 0}%` }}/></div>
                  <div className="mt-3 text-[11.5px] text-muted-foreground">Supervisor · <span className="font-bold text-foreground">{s.supervisor}</span></div>
                </div>
              ))}
            </div>
          </Surface>
          <div className="grid gap-4 xl:grid-cols-2">
            <Surface padded={false}>
              <div className="px-5 py-4 border-b border-border"><SectionTitle title="Today's queue" sub={`${workOrders.length} work orders`}/></div>
              <div className="p-4 space-y-2 max-h-[420px] overflow-y-auto">
                {workOrders.map(w => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted/40 p-3 hover:border-primary/30 hover:bg-surface-muted/70 transition-all"
                  >
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12.5px] font-bold font-mono">{w.id}</span>
                        <StatusChip tone={(w.status && STAT_TONE[w.status]) || "neutral"}>{w.status}</StatusChip>
                      </div>
                      <div className="text-[11.5px] text-muted-foreground truncate">
                        <span className="font-mono font-bold text-foreground">{w.plate}</span> · {w.community} · {w.slot} · <span className="text-primary font-medium">{w.plan}</span>
                      </div>
                    </div>
                    <div className="text-right text-[11px] shrink-0">
                      <div className="text-muted-foreground">Technician</div>
                      <div className="font-bold text-foreground">{w.tech || "—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Surface>
            <Surface padded={false}>
              <div className="px-5 py-4 border-b border-border"><SectionTitle title="Technician status"/></div>
              <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
                {staff.map(s => (
                  <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-[11px] font-black text-primary">{s.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-bold truncate">{s.name}</div>
                      <div className="text-[10.5px] text-muted-foreground">{s.zone} · {s.shift}</div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild disabled={updating}>
                        <button className="focus:outline-none select-none transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
                          <StatusChip
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            tone={s.status === "Cleaning" ? "primary" : s.status === "Available" ? "success" : s.status === "Break" ? "warning" : s.status === "Offline" ? "neutral" : "info"}
                          >
                            {s.status}
                          </StatusChip>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        {["Available", "Cleaning", "En Route", "Break", "Offline"].map((statusOption) => (
                          <DropdownMenuItem
                            key={statusOption}
                            onClick={() => handleStatusUpdate(s.id, statusOption)}
                            className="flex items-center gap-2 cursor-pointer text-[12.5px]"
                          >
                            <span className={`h-2 w-2 rounded-full ${
                              statusOption === "Available" ? "bg-[color:oklch(0.6_0.15_155)]" :
                              statusOption === "Cleaning" ? "bg-primary" :
                              statusOption === "En Route" ? "bg-[color:oklch(0.6_0.15_230)]" :
                              statusOption === "Break" ? "bg-[color:oklch(0.65_0.15_60)]" :
                              "bg-muted-foreground"
                            }`} />
                            <span>{statusOption}</span>
                            {s.status === statusOption && (
                              <Check className="ml-auto h-3.5 w-3.5 text-primary" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </Surface>
          </div>
        </div>
      </AsyncState>
    </>
  );
}
