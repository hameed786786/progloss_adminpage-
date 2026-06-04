import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { StatusChip } from "@/components/app/StatusChip";
import { Download, MoreHorizontal, Eye, Receipt, RotateCcw, Copy, Flag, RefreshCcw } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { usePayments, queryKeys } from "@/lib/hooks/api";
import type { Payment as Txn } from "@/lib/api/types";
import { useState } from "react";
import { exportToCSV } from "@/lib/utils";
import { FormDialog, SecondaryBtn } from "@/components/app/FormDialog";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_app/payments/transactions")({ component: Transactions });

const STAT: Record<string, "success"|"warning"|"danger"|"neutral"> = { captured: "success", pending: "warning", failed: "danger", refunded: "neutral" };

function Transactions() {
  const queryClient = useQueryClient();
  const { data: paymentsData = [] } = usePayments();
  const [activeTab, setActiveTab] = useState("All");
  const [viewingTxn, setViewingTxn] = useState<Txn | null>(null);

  const filteredPayments = paymentsData.filter((p) => {
    if (activeTab === "All") return true;
    return p.status?.toLowerCase() === activeTab.toLowerCase();
  });

  const total = paymentsData.filter(p => p.status === "captured").reduce((s,p) => s + (p.amount || 0), 0);

  const handleUpdateStatus = async (id: string, newStatus: string, successMessage: string) => {
    try {
      await api.updatePayment(id, { status: newStatus });
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      toast.success(successMessage, { description: id });
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    }
  };

  const action = (label: string, id: string) => toast.success(label, { description: id });

  return (
    <>
      <TopBar title="Transactions" subtitle={`Today · ${paymentsData.length} processed · AED ${total.toLocaleString()} captured`} />
      <div className="px-4 py-4 sm:px-6 sm:py-6">
        <Surface padded={false}>
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 overflow-x-auto">
            {["All","Captured","Pending","Failed","Refunded"].map((t) => (
              <button 
                key={t} 
                onClick={() => setActiveTab(t)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-bold ${activeTab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}
              >
                {t}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              <button 
                onClick={() => exportToCSV(filteredPayments, "transactions_export")}
                className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-[12px] font-bold hover:bg-accent"
              >
                <Download className="h-3 w-3" /> Export
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[820px]">
              <thead className="bg-surface-muted/40 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-2.5 text-left">Transaction</th><th className="px-4 py-2.5 text-left">Customer</th><th className="px-4 py-2.5 text-left">Method</th><th className="px-4 py-2.5 text-left">Gateway</th><th className="px-4 py-2.5 text-right">Amount</th><th className="px-4 py-2.5 text-left">Status</th><th className="px-4 py-2.5 text-left">Time</th><th className="px-4 py-2.5"></th></tr>
              </thead>
              <tbody>
                {filteredPayments.map((p: Txn) => (
                  <tr key={p.id} className="border-t border-border hover:bg-surface-muted/40">
                    <td className="px-4 py-3 font-mono text-[11.5px] font-bold">{p.id}</td>
                    <td className="px-4 py-3">{p.customer}</td>
                    <td className="px-4 py-3">{p.method}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.gateway}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">AED {(p.amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusChip tone={STAT[p.status || "captured"]}>{p.status}</StatusChip></td>
                    <td className="px-4 py-3 text-muted-foreground">{p.date}</td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="More">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel className="text-[10.5px] uppercase tracking-wider text-muted-foreground">{p.id}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={()=>setViewingTxn(p)}><Eye className="mr-2 h-3.5 w-3.5"/> View details</DropdownMenuItem>
                          <DropdownMenuItem onClick={()=>action("Receipt resent", p.customer)}><Receipt className="mr-2 h-3.5 w-3.5"/> Resend receipt</DropdownMenuItem>
                          <DropdownMenuItem onClick={()=>{ navigator.clipboard?.writeText(p.id); action("Transaction ID copied", p.id); }}><Copy className="mr-2 h-3.5 w-3.5"/> Copy ID</DropdownMenuItem>
                          {p.status === "pending" && (
                            <DropdownMenuItem onClick={()=>handleUpdateStatus(p.id, "captured", "Transaction captured successfully")}><RefreshCcw className="mr-2 h-3.5 w-3.5"/> Capture now</DropdownMenuItem>
                          )}
                          {p.status === "failed" && (
                            <DropdownMenuItem onClick={()=>handleUpdateStatus(p.id, "captured", "Retry successful, payment captured")}><RefreshCcw className="mr-2 h-3.5 w-3.5"/> Retry payment</DropdownMenuItem>
                          )}
                          {p.status === "captured" && (
                            <DropdownMenuItem onClick={()=>handleUpdateStatus(p.id, "refunded", "Refund requested successfully")} className="text-warning focus:text-warning"><RotateCcw className="mr-2 h-3.5 w-3.5"/> Refund</DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={()=>handleUpdateStatus(p.id, "failed", "Flagged for review as potential fraud")} className="text-destructive focus:text-destructive"><Flag className="mr-2 h-3.5 w-3.5"/> Flag as fraud</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      </div>

      <FormDialog
        open={!!viewingTxn}
        onOpenChange={(o) => !o && setViewingTxn(null)}
        title={`Transaction Details · ${viewingTxn?.id}`}
        footer={<SecondaryBtn onClick={() => setViewingTxn(null)}>Close</SecondaryBtn>}
      >
        {viewingTxn && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Customer</div>
                <div className="font-semibold text-foreground mt-0.5">{viewingTxn.customer}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Amount</div>
                <div className="font-bold text-foreground mt-0.5">AED {viewingTxn.amount?.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</div>
                <div className="mt-1">
                  <StatusChip tone={STAT[viewingTxn.status || "captured"]}>{viewingTxn.status}</StatusChip>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date / Time</div>
                <div className="font-semibold text-foreground mt-0.5">{viewingTxn.date}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payment Method</div>
                <div className="font-semibold text-foreground mt-0.5">{viewingTxn.method}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Gateway</div>
                <div className="font-semibold text-foreground mt-0.5">{viewingTxn.gateway || "—"}</div>
              </div>
            </div>
          </div>
        )}
      </FormDialog>
    </>
  );
}
