import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { RefreshCcw, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useCustomers, usePlans } from "@/lib/hooks/api";

export const Route = createFileRoute("/_app/subscriptions/renewals")({ component: Page });

function Page() {
  const { data: customers = [] } = useCustomers();
  const { data: plans = [] } = usePlans();

  const renewals = customers
    .filter(c => c.status !== "cancelled" && c.status !== "paused")
    .map((c, i) => {
      const planObj = plans.find(p => p.name === c.plan || p.id === c.plan);
      const price = planObj ? planObj.price : 145;
      const amount = price * 1.05;
      
      let dueIn = "—";
      let diffDays: number | null = null;
      if (c.nextRenewal) {
        const nextRenewal = new Date(c.nextRenewal);
        if (!isNaN(nextRenewal.getTime())) {
          const today = new Date();
          const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const renewalMidnight = new Date(nextRenewal.getFullYear(), nextRenewal.getMonth(), nextRenewal.getDate());
          const diffTime = renewalMidnight.getTime() - todayMidnight.getTime();
          diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 0) dueIn = "Today";
          else if (diffDays === 1) dueIn = "Tomorrow";
          else if (diffDays > 1) dueIn = `in ${diffDays} days`;
          else if (diffDays === -1) dueIn = "Yesterday";
          else if (diffDays < -1) dueIn = `${Math.abs(diffDays)} days ago`;
        }
      }

      let status = "scheduled";
      if (c.status === "churn-risk") status = "at-risk";

      const autopay = c.status !== "churn-risk";
      const method = i % 2 === 0 ? "Visa •• 4421" : "Mastercard •• 7710";

      return {
        id: c.subscriptionId || `SUB-${20480 + i}`,
        customer: c.name,
        plan: c.plan || "Eco Weekly",
        amount,
        dueIn,
        method,
        autopay,
        status,
        diffDays
      };
    })
    .filter(r => r.diffDays !== null && r.diffDays <= 7)
    .sort((a, b) => (a.diffDays ?? 0) - (b.diffDays ?? 0));

  const dueCount = renewals.length;
  const expectedRev = renewals.reduce((sum, r) => sum + r.amount, 0);
  const atRiskCount = renewals.filter(r => r.status === "at-risk").length;
  const autoRenewPct = renewals.length > 0 ? (renewals.filter(r => r.autopay).length / renewals.length) * 100 : 0;

  return (
    <>
      <TopBar title="Renewals" subtitle={`${dueCount} renewals due in next 7 days · AED ${expectedRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} expected`} />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Due in 7 days" value={String(dueCount)} icon={Calendar} accent="warning" />
          <KpiCard label="Expected revenue" value={`AED ${expectedRev.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={Calendar} accent="primary" />
          <KpiCard label="At-risk" value={String(atRiskCount)} icon={AlertTriangle} accent="danger" hint="No valid card" />
          <KpiCard label="Auto-renewing" value={`${autoRenewPct.toFixed(1)}%`} icon={CheckCircle2} accent="success" />
        </div>
        <Surface padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[720px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">Subscription</th><th className="px-4 py-3 text-left">Customer</th><th className="px-4 py-3 text-left">Plan</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-left">Due</th><th className="px-4 py-3 text-left">Method</th><th className="px-4 py-3 text-right">Status</th></tr>
              </thead>
              <tbody>
                {renewals.map(r => (
                  <tr key={r.id} className="border-t border-border hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-mono font-bold">{r.id}</td>
                    <td className="px-4 py-3">{r.customer}</td>
                    <td className="px-4 py-3 font-bold">{r.plan}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">AED {r.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.dueIn}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.method}{r.autopay && <RefreshCcw className="inline ml-1.5 h-3 w-3 text-primary"/>}</td>
                    <td className="px-4 py-3 text-right"><StatusChip tone={r.status==="scheduled"?"info":r.status==="at-risk"?"danger":"warning"}>{r.status}</StatusChip></td>
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
