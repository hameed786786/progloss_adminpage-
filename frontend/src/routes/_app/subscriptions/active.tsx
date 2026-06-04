import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { Repeat, Pause, Play, AlertTriangle } from "lucide-react";
import { useCustomers, usePlans } from "@/lib/hooks/api";

export const Route = createFileRoute("/_app/subscriptions/active")({ component: Page });

const TONE = { active: "success", paused: "warning", "churn-risk": "danger", cancelled: "neutral" } as const;

function Page() {
  const { data: customersData = [] } = useCustomers();
  const { data: plansData = [] } = usePlans();

  const customersList = customersData;
  const plansList = plansData;

  const formatRenewalDate = (dateVal?: string | Date, status?: string) => {
    if (status === "paused") return "Paused";
    if (status === "cancelled") return "Cancelled";
    if (!dateVal) return "—";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  const subsList = customersList.map((c, i) => {
    return {
      id: c.subscriptionId || `SUB-${20480 + i}`,
      customer: c.name,
      plan: c.plan || "No Plan",
      vehicles: c.vehicles || 0,
      mrr: c.mrr || 260,
      nextRenewal: formatRenewalDate(c.nextRenewal, c.status),
      status: c.status || "active",
    };
  });

  const totalActive = customersList.filter(c => c.status === "active").length;
  const pausedCount = customersList.filter(c => c.status === "paused").length;
  const churnRiskCount = customersList.filter(c => c.status === "churn-risk").length;

  return (
    <>
      <TopBar title="Active Subscriptions" subtitle={`${totalActive} active across ${plansList.length} plans`} />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Total active" value={String(totalActive)} icon={Repeat} accent="success" />
          <KpiCard label="Paused" value={String(pausedCount)} icon={Pause} accent="warning" />
          <KpiCard label="Churn-risk" value={String(churnRiskCount)} icon={AlertTriangle} accent="warning" />
          <KpiCard label="Reactivated (MTD)" value="0" icon={Play} accent="success" />
        </div>
        <Surface>
          <div className="grid gap-3 md:grid-cols-4">
            {plansList.map(p => {
              const activeCount = customersList.filter(c => c.status === "active" && (c.plan === p.name || c.plan === p.id)).length;
              return (
                <div key={p.id} className="rounded-xl border border-border bg-surface-muted/40 p-4">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">{p.id}</div>
                  <div className="mt-0.5 text-[14px] font-black">{p.name}</div>
                  <div className="mt-2 text-[24px] font-black tabular-nums">{activeCount}</div>
                  <div className="text-[11px] text-muted-foreground">active subscriptions</div>
                </div>
              );
            })}
          </div>
        </Surface>
        <Surface padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[720px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">Subscription</th><th className="px-4 py-3 text-left">Customer</th><th className="px-4 py-3 text-left">Plan</th><th className="px-4 py-3 text-right">Vehicles</th><th className="px-4 py-3 text-right">MRR</th><th className="px-4 py-3 text-left">Next renewal</th><th className="px-4 py-3 text-right">Status</th></tr>
              </thead>
              <tbody>
                {subsList.map(s => (
                  <tr key={s.id} className="border-t border-border hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-mono font-bold">{s.id}</td>
                    <td className="px-4 py-3">{s.customer}</td>
                    <td className="px-4 py-3 font-bold">{s.plan}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{s.vehicles}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">AED {s.mrr}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.nextRenewal}</td>
                    <td className="px-4 py-3 text-right"><StatusChip tone={TONE[s.status as keyof typeof TONE] || "neutral"}>{s.status}</StatusChip></td>
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
