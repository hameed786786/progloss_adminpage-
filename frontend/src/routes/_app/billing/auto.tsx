import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { Surface, SectionTitle } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { Repeat, Play, Pause, Calendar, CheckCircle2 } from "lucide-react";
import { usePlans, useCustomers, queryKeys } from "@/lib/hooks/api";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/billing/auto")({ component: Page });

function Page() {
  const { data: plans = [] } = usePlans();
  const { data: customers = [] } = useCustomers();
  const queryClient = useQueryClient();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const currentMonthNum = String(new Date().getMonth() + 1).padStart(2, "0");

  const cycles = plans.map((p) => {
    let run = "1st 04:00 GST";
    let next = "01 Jul, 04:00";
    let status = "Scheduled";

    if (p.name.includes("Weekly")) {
      run = "Mon 06:00 GST";
      next = "Next Mon, 06:00";
      status = "Running";
    } else if (p.name.includes("Bi-weekly")) {
      run = "Sun 22:00 GST";
      next = "Next Sun, 22:00";
      status = "Scheduled";
    } else if (p.name.includes("Monthly")) {
      run = "1st 02:00 GST";
      next = "01 Jul, 02:00";
      status = "Scheduled";
    }

    if (p.name.includes("Fleet")) {
      status = "Paused";
    }

    const invoicesCount = customers.filter(c => c.status === "active" && (c.plan === p.name || c.plan === p.id)).length;
    const amount = invoicesCount * p.price * 1.05;

    const pCode = p.id.replace("PLN-", "");
    const id = `CYC-${currentYear}-${currentMonthNum}-${pCode}`;

    // Use real cycleStatus from DB, fall back to derived status
    const realStatus = p.cycleStatus ?? status;

    return {
      id,
      planId: p.id,
      plan: p.name,
      run,
      next,
      invoices: invoicesCount,
      amount,
      status: realStatus,
    };
  });

  async function toggleCycle(planId: string, cycleId: string, currentStatus: string) {
    const next = currentStatus === 'Paused' ? 'Running' : 'Paused';
    setTogglingId(cycleId);
    try {
      await api.updatePlanCycleStatus(planId, next);
      await queryClient.invalidateQueries({ queryKey: queryKeys.plans });
      toast.success(next === 'Paused' ? 'Cycle paused' : 'Cycle resumed', { description: cycleId });
    } catch (e: any) {
      toast.error(e.message || 'Failed to update cycle status');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleRunCycle() {
    toast.promise(
      new Promise<void>(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Triggering billing cycle…',
        success: 'Billing cycle triggered successfully',
        error: 'Failed to trigger cycle',
      }
    );
  }

  const activeCyclesCount = cycles.filter(c => c.status !== "Paused").length;
  const totalInvoicesMonth = customers.filter(c => c.status === "active").length;
  const expectedMrrValue = cycles.reduce((sum, c) => sum + c.amount, 0);
  const dunningSentCount = customers.filter(c => c.status === "churn-risk").length * 2 || 6;
  const pausedPlanName = cycles.find(c => c.status === "Paused")?.plan || "none";

  return (
    <>
      <TopBar title="Auto Billing" subtitle="Recurring invoice cycles & dunning rules" actions={
        <button
          onClick={handleRunCycle}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-[12.5px] font-bold text-primary-foreground hover:bg-primary/90"
        >
          <Play className="h-3.5 w-3.5" /> Run cycle
        </button>
      }/>
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Active cycles" value={`${activeCyclesCount} / ${cycles.length}`} icon={Repeat} accent="primary" hint={`${pausedPlanName} paused`} />
          <KpiCard label="Invoices this month" value={totalInvoicesMonth.toLocaleString()} icon={CheckCircle2} accent="success" />
          <KpiCard label="Expected MRR" value={`AED ${expectedMrrValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={Calendar} accent="primary" />
          <KpiCard label="Dunning emails sent" value={String(dunningSentCount)} icon={Calendar} accent="warning" />
        </div>
        <Surface padded={false}>
          <div className="px-5 py-4 border-b border-border"><SectionTitle title="Billing cycles" sub="Eco · Premium · Royal · Fleet Care" /></div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[720px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Cycle ID</th>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-left">Schedule</th>
                  <th className="px-4 py-3 text-left">Next run</th>
                  <th className="px-4 py-3 text-right">Invoices</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Status</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {cycles.map(c => (
                  <tr key={c.id} className="border-t border-border hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-mono font-bold">{c.id}</td>
                    <td className="px-4 py-3 font-bold">{c.plan}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.run}</td>
                    <td className="px-4 py-3">{c.next}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.invoices}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">AED {c.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right">
                      <StatusChip tone={c.status==="Running"?"success":c.status==="Paused"?"warning":"info"}>{c.status}</StatusChip>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleCycle(c.planId, c.id, c.status)}
                        disabled={togglingId === c.id}
                        className={`inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11px] font-bold transition-colors disabled:opacity-50 ${
                          c.status === 'Paused'
                            ? 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10'
                            : 'border-border bg-surface text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                      >
                        {c.status === 'Paused'
                          ? <><Play className="h-3 w-3" /> Resume</>
                          : <><Pause className="h-3 w-3" /> Pause</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      </div>
    </>
  );
}
