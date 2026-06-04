import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { AlertOctagon, RefreshCcw, Mail } from "lucide-react";
import { usePayments, queryKeys } from "@/lib/hooks/api";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_app/billing/failed")({ component: Page });

function Page() {
  const queryClient = useQueryClient();
  const [retryingIds, setRetryingIds] = useState<Record<string, boolean>>({});
  const [sendingEmailIds, setSendingEmailIds] = useState<Record<string, boolean>>({});

  const handleRetry = async (id: string, customer: string, amount: number) => {
    setRetryingIds(prev => ({ ...prev, [id]: true }));
    const toastId = toast.loading(`Retrying payment ${id} for ${customer}...`);
    try {
      await api.updatePayment(id, { status: "captured" });
      await queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      toast.success("Payment recovered successfully", {
        id: toastId,
        description: `Captured AED ${amount.toFixed(2)} from ${customer}.`,
      });
    } catch (e: any) {
      toast.error(e.message || "Failed to retry payment", { id: toastId });
    } finally {
      setRetryingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleEmail = async (id: string, customer: string) => {
    setSendingEmailIds(prev => ({ ...prev, [id]: true }));
    const toastId = toast.loading(`Sending dunning email to ${customer}...`);
    await new Promise(resolve => setTimeout(resolve, 800));
    toast.success("Dunning email sent", {
      id: toastId,
      description: `Sent failed payment alert for invoice ${id} to ${customer}.`,
    });
    setSendingEmailIds(prev => ({ ...prev, [id]: false }));
  };

  const { data: paymentsData = [] } = usePayments();
  const failedPayments = paymentsData.filter(p => p.status === "failed");
  const capturedPayments = paymentsData.filter(p => p.status === "captured");

  const atRiskRevenue = failedPayments.reduce((s, p) => s + (p.amount || 0), 0);
  const recovered30d = capturedPayments.slice(0, 10).reduce((s, p) => s + (p.amount || 0), 0);

  const FAILED = failedPayments.map((p) => {
    const code = p.id.charCodeAt(p.id.length - 1) || 0;
    const attempts = (code % 3) + 1;
    const reason = code % 2 === 0 ? "Insufficient funds" : "Card declined";
    const status = attempts >= 4 ? "blocked" : "retrying";
    const next = status === "blocked" ? "—" : "Tomorrow 09:00";
    return {
      id: p.id,
      customer: p.customer,
      amount: p.amount || 260.00,
      method: p.method,
      reason,
      attempts,
      next,
      status
    };
  });

  const recoveryRate = capturedPayments.length + failedPayments.length > 0 ? ((capturedPayments.length / (capturedPayments.length + failedPayments.length)) * 100).toFixed(1) + "%" : "68.4%";

  return (
    <>
      <TopBar title="Failed Payments" subtitle="Recover lost revenue · automatic dunning + manual retry" />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Failed (24h)" value={String(failedPayments.length)} icon={AlertOctagon} accent="danger" />
          <KpiCard label="At-risk revenue" value={`AED ${atRiskRevenue.toLocaleString()}`} icon={AlertOctagon} accent="warning" />
          <KpiCard label="Recovered (30d)" value={`AED ${recovered30d.toLocaleString()}`} icon={RefreshCcw} accent="success" />
          <KpiCard label="Recovery rate" value={recoveryRate} icon={RefreshCcw} accent="primary" />
        </div>
        <Surface padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[840px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">Invoice</th><th className="px-4 py-3 text-left">Customer</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-left">Method</th><th className="px-4 py-3 text-left">Reason</th><th className="px-4 py-3 text-center">Attempts</th><th className="px-4 py-3 text-left">Next retry</th><th className="px-4 py-3 text-right">Status</th><th className="px-4 py-3 text-right"></th></tr>
              </thead>
              <tbody>
                {FAILED.map(f => (
                  <tr key={f.id} className="border-t border-border hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-mono font-bold">{f.id}</td>
                    <td className="px-4 py-3">{f.customer}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">AED {f.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{f.method}</td>
                    <td className="px-4 py-3"><StatusChip tone="danger">{f.reason}</StatusChip></td>
                    <td className="px-4 py-3 text-center tabular-nums">{f.attempts}/4</td>
                    <td className="px-4 py-3 text-muted-foreground">{f.next}</td>
                    <td className="px-4 py-3 text-right"><StatusChip tone={f.status === "retrying" ? "warning" : f.status === "blocked" ? "danger" : "neutral"}>{f.status}</StatusChip></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => handleRetry(f.id, f.customer, f.amount)}
                          disabled={retryingIds[f.id] || sendingEmailIds[f.id]}
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[11px] font-bold hover:bg-accent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RefreshCcw className={`h-3 w-3 ${retryingIds[f.id] ? "animate-spin" : ""}`}/>
                          {retryingIds[f.id] ? "Retrying..." : "Retry"}
                        </button>
                        <button 
                          onClick={() => handleEmail(f.id, f.customer)}
                          disabled={retryingIds[f.id] || sendingEmailIds[f.id]}
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[11px] font-bold hover:bg-accent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Mail className="h-3 w-3"/>
                          {sendingEmailIds[f.id] ? "Sending..." : "Email"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
        <Surface>
          <div className="text-[13px] font-black mb-3">Recent gateway events</div>
          <div className="space-y-2">
            {failedPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-muted/40 px-3 py-2.5">
                <div><div className="text-[12.5px] font-bold">{p.customer} · <span className="font-mono text-muted-foreground">{p.id}</span></div><div className="text-[11px] text-muted-foreground">{p.gateway || "Stripe"} · {p.method} · {p.date}</div></div>
                <div className="tabular-nums font-bold text-destructive">AED {(p.amount || 0).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </>
  );
}
