import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { Repeat, CreditCard, ShieldCheck } from "lucide-react";
import { useCustomers, usePlans } from "@/lib/hooks/api";

export const Route = createFileRoute("/_app/payments/autopay")({ component: Page });

function Page() {
  const { data: customers = [] } = useCustomers();
  const { data: plans = [] } = usePlans();

  const nextMonthName = new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString("en-US", { month: "short" });

  const mandates = customers.map((c, i) => {
    const planObj = plans.find(p => p.name === c.plan || p.id === c.plan);
    const price = planObj ? planObj.price : 145;
    const amount = price * 1.05;
    
    let status = "active";
    if (c.status === "paused") status = "paused";
    else if (c.status === "cancelled") status = "revoked";

    const method = c.status === "cancelled" ? "—" : (i % 2 === 0 ? "Visa •• 4421" : "Mastercard •• 7710");
    const nextCharge = c.status === "cancelled" || c.status === "paused" ? "—" : `01 ${nextMonthName}`;

    return {
      id: `AP-2026-${9182 + i}`,
      customer: c.name,
      method,
      plan: c.plan || "Eco Weekly",
      nextCharge,
      amount,
      status
    };
  });

  const activeCount = mandates.filter(m => m.status === "active").length;
  const autoChargedMtd = mandates.filter(m => m.status === "active").reduce((s, m) => s + m.amount, 0);
  const revocationsCount = mandates.filter(m => m.status === "revoked").length;
  const coverageRate = mandates.length > 0 ? ((activeCount / mandates.length) * 100).toFixed(1) + "%" : "88.4%";

  return (
    <>
      <TopBar title="AutoPay Mandates" subtitle="Tokenized recurring charges · PCI-DSS Level 1" />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Active mandates" value={String(activeCount)} icon={Repeat} accent="success" />
          <KpiCard label="Auto-charged (MTD)" value={`AED ${autoChargedMtd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={CreditCard} accent="primary" />
          <KpiCard label="Mandate revocations" value={String(revocationsCount)} icon={ShieldCheck} accent="warning" />
          <KpiCard label="Coverage rate" value={coverageRate} icon={ShieldCheck} accent="success" />
        </div>
        <Surface padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[720px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">Mandate</th><th className="px-4 py-3 text-left">Customer</th><th className="px-4 py-3 text-left">Method</th><th className="px-4 py-3 text-left">Plan</th><th className="px-4 py-3 text-left">Next charge</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-right">Status</th></tr>
              </thead>
              <tbody>
                {mandates.map(m => (
                  <tr key={m.id} className="border-t border-border hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-mono font-bold">{m.id}</td>
                    <td className="px-4 py-3">{m.customer}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.method}</td>
                    <td className="px-4 py-3">{m.plan}</td>
                    <td className="px-4 py-3">{m.nextCharge}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">AED {m.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right"><StatusChip tone={m.status==="active"?"success":m.status==="paused"?"warning":"danger"}>{m.status}</StatusChip></td>
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
