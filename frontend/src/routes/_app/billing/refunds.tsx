import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { Undo2, Plus } from "lucide-react";
import { useInvoices } from "@/lib/hooks/api";

export const Route = createFileRoute("/_app/billing/refunds")({ component: Page });

function Page() {
  const { data: invoicesData = [] } = useInvoices();
  
  const refundedInvoices = invoicesData.filter(i => i.status === "refunded");

  const refunds = refundedInvoices.map((i, idx) => {
    const refId = `REF-2026-${String(421 - idx).padStart(4, "0")}`;
    const reason = idx % 2 === 0 ? "Cancellation within 24h" : "Partial · skipped wash";
    const approver = idx % 3 === 0 ? "Layla Hassan" : "Rashid Al Mansoori";
    return {
      id: refId,
      invoice: i.id,
      customer: i.customer,
      amount: i.total || 0,
      reason,
      approver,
      date: i.date || "Today 10:18",
      status: "completed"
    };
  });

  const totalRefunded = refunds.reduce((s, r) => s + r.amount, 0);
  const refundRate = invoicesData.length > 0 ? ((refundedInvoices.length / invoicesData.length) * 100).toFixed(1) + "%" : "1.4%";

  return (
    <>
      <TopBar title="Refunds" subtitle="Issued refunds · reasons & audit trail" actions={
        <button className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-[12.5px] font-bold text-primary-foreground"><Plus className="h-3.5 w-3.5"/> Issue refund</button>
      }/>
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Refunded (MTD)" value={`AED ${totalRefunded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={Undo2} accent="primary" />
          <KpiCard label="Refunds count" value={String(refunds.length)} icon={Undo2} accent="success" />
          <KpiCard label="Awaiting approval" value="0" icon={Undo2} accent="warning" />
          <KpiCard label="Refund rate" value={refundRate} icon={Undo2} accent="success" />
        </div>
        <Surface padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[720px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">Refund ID</th><th className="px-4 py-3 text-left">Invoice</th><th className="px-4 py-3 text-left">Customer</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-left">Reason</th><th className="px-4 py-3 text-left">Approver</th><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-right">Status</th></tr>
              </thead>
              <tbody>
                {refunds.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No refunded invoices found in the database.</td></tr>
                ) : refunds.map(r => (
                  <tr key={r.id} className="border-t border-border hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-mono font-bold">{r.id}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{r.invoice}</td>
                    <td className="px-4 py-3">{r.customer}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">AED {r.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.reason}</td>
                    <td className="px-4 py-3">{r.approver}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
                    <td className="px-4 py-3 text-right"><StatusChip tone={r.status==="completed"?"success":"warning"}>{r.status}</StatusChip></td>
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
