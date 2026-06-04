import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface, SectionTitle } from "@/components/app/Surface";
import { StatusChip } from "@/components/app/StatusChip";
import { Banknote, FileText, AlertOctagon, Undo2, Download, Filter, MoreHorizontal } from "lucide-react";
import { Area, AreaChart, Bar, ComposedChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useInvoices, queryKeys } from "@/lib/hooks/api";
import { useState } from "react";
import { exportToCSV } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/billing/overview")({ component: BillingOverview });

const STATUS: Record<string, "success"|"warning"|"danger"|"neutral"> = {
  paid: "success", pending: "warning", overdue: "danger", failed: "danger", refunded: "neutral",
};

function BillingOverview() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [generatingVat, setGeneratingVat] = useState(false);
  const { data: invoicesData = [] } = useInvoices();
  const [selectedStatus, setSelectedStatus] = useState("All");
  const invoices = invoicesData;

  const handleGenerateVat = async () => {
    setGeneratingVat(true);
    try {
      await api.createExportJob({
        name: "Q2 2026 VAT Return",
        template: "VAT Return (FTA)",
        desc: "Quarterly VAT 201 ready for FTA portal",
        format: "CSV",
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.exportJobs });
      toast.success("VAT Return Generated", { description: "Your Q2 2026 VAT return has been generated successfully." });
      navigate({ to: "/billing/exports" });
    } catch (error: any) {
      toast.error(error.message || "Failed to generate VAT return");
    } finally {
      setGeneratingVat(false);
    }
  };

  const filteredInvoices = invoices.filter(
    (i) => selectedStatus === "All" || i.status === selectedStatus
  );

  const currentMonthName = new Date().toLocaleDateString("en-US", { month: "long" });
  const currentYear = new Date().getFullYear();

  const totalInvoiced = invoices.reduce((s, i) => s + (i.total || 0), 0);
  const totalCollected = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.total || 0), 0);
  const totalFailed = invoices.filter(i => i.status === "failed" || i.status === "overdue").reduce((s, i) => s + (i.total || 0), 0);
  const totalRefunded = invoices.filter(i => i.status === "refunded").reduce((s, i) => s + (i.total || 0), 0);
  const collectionRate = totalInvoiced > 0 ? ((totalCollected / totalInvoiced) * 100).toFixed(1) : "0.0";

  const taxableSales = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.subtotal || 0), 0);
  const outputVat = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.vat || 0), 0);
  const zeroRated = 0;
  const recoverableVat = Math.round(outputVat * 0.16);

  // Build monthly cashflow from ALL invoices (last 6 months with data, or last 6 calendar months)
  const monthlyMap: Record<string, number> = {};
  invoices.forEach(inv => {
    if (!inv.date) return;
    const d = new Date(inv.date);
    if (isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap[key] = (monthlyMap[key] ?? 0) + (inv.total || 0);
  });

  // Ensure last 6 calendar months always appear (even if zero)
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!(key in monthlyMap)) monthlyMap[key] = 0;
  }

  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const data = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, v]) => {
      const [yr, mo] = key.split('-');
      return {
        d: `${MONTH_NAMES[parseInt(mo) - 1]} '${yr.slice(2)}`,
        v: parseFloat((v / 1000).toFixed(1)),
      };
    });

  const hasChartData = data.some(d => d.v > 0);

  return (
    <>
      <TopBar title="Billing & VAT" subtitle={`${currentMonthName} ${currentYear} cycle · AED ${totalInvoiced.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} invoiced · ${collectionRate}% collected`} />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { l: "Invoiced (MTD)", v: `AED ${totalInvoiced.toLocaleString(undefined, {maximumFractionDigits: 0})}`, d: `${invoices.length} invoices`, i: FileText, t: "primary" as const },
            { l: "Collected", v: `AED ${totalCollected.toLocaleString(undefined, {maximumFractionDigits: 0})}`, d: `${collectionRate}% collection rate`, i: Banknote, t: "success" as const },
            { l: "Failed / Overdue", v: `AED ${totalFailed.toLocaleString(undefined, {maximumFractionDigits: 0})}`, d: `${invoices.filter(i=>i.status==="failed"||i.status==="overdue").length} invoices · auto-retry on`, i: AlertOctagon, t: "danger" as const },
            { l: "Refunds (MTD)", v: `AED ${totalRefunded.toLocaleString(undefined, {maximumFractionDigits: 0})}`, d: `${invoices.filter(i=>i.status==="refunded").length} refunds processed`, i: Undo2, t: "warning" as const },
          ].map((k) => (
            <Surface key={k.l}>
              <div className="flex items-center justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  k.t === "primary" ? "bg-primary/10 text-primary"
                  : k.t === "success" ? "bg-[color:oklch(0.95_0.05_155)] text-[color:oklch(0.4_0.12_155)]"
                  : k.t === "danger" ? "bg-[color:oklch(0.96_0.04_25)] text-[color:oklch(0.45_0.18_25)]"
                  : "bg-[color:oklch(0.97_0.06_75)] text-[color:oklch(0.45_0.13_60)]"
                }`}><k.i className="h-4 w-4" /></div>
              </div>
              <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{k.l}</div>
              <div className="mt-0.5 text-[22px] font-black tracking-tight">{k.v}</div>
              <div className="mt-1 text-[11.5px] text-muted-foreground">{k.d}</div>
            </Surface>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Surface className="xl:col-span-2">
            <SectionTitle title="Cashflow · Last 6 months" sub="Monthly invoiced volume · AED thousands" />
            {hasChartData ? (
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={data} margin={{ left: -10, right: 10, top: 10 }}>
                  <defs>
                    <linearGradient id="cf" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.48 0.16 258)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="oklch(0.48 0.16 258)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
                  <XAxis dataKey="d" tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false} unit="k" />
                  <Tooltip
                    contentStyle={{ background: "white", border: "1px solid oklch(0.92 0.008 250)", borderRadius: 12, fontSize: 12 }}
                    formatter={(v: number) => [`AED ${v}k`, "Volume"]}
                  />
                  <Bar dataKey="v" fill="oklch(0.48 0.16 258)" fillOpacity={0.15} radius={[4,4,0,0]} />
                  <Area type="monotone" dataKey="v" stroke="oklch(0.48 0.16 258)" strokeWidth={2.5} fill="url(#cf)" dot={{ r: 3, fill: "oklch(0.48 0.16 258)", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[240px] flex-col items-center justify-center gap-2 text-muted-foreground">
                <div className="text-[13px] font-bold">No billing data yet</div>
                <div className="text-[12px]">Invoices will appear here once payments are processed.</div>
              </div>
            )}
          </Surface>

          <Surface>
            <SectionTitle title="VAT 5% summary" sub="UAE Federal Tax Authority" />
            <div className="space-y-3 text-[12.5px]">
              {[
                { l: "Taxable sales", v: `AED ${taxableSales.toLocaleString(undefined, {maximumFractionDigits: 0})}` },
                { l: "Output VAT", v: `AED ${outputVat.toLocaleString(undefined, {maximumFractionDigits: 0})}`, b: true },
                { l: "Zero-rated", v: `AED ${zeroRated.toLocaleString(undefined, {maximumFractionDigits: 0})}` },
                { l: "Exempt", v: "AED 0" },
                { l: "Recoverable VAT", v: `AED ${recoverableVat.toLocaleString(undefined, {maximumFractionDigits: 0})}` },
              ].map((r,i) => (
                <div key={i} className={`flex items-center justify-between rounded-xl ${r.b ? "bg-primary/8 px-3 py-2.5" : "px-3 py-1"}`}>
                  <span className={r.b ? "font-bold text-foreground" : "text-muted-foreground"}>{r.l}</span>
                  <span className={`tabular-nums ${r.b ? "font-black text-primary" : "font-bold"}`}>{r.v}</span>
                </div>
              ))}
              <button
                onClick={handleGenerateVat}
                disabled={generatingVat}
                className="mt-2 w-full rounded-xl bg-primary py-2.5 text-[12.5px] font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {generatingVat ? "Generating..." : "Generate Q2 2026 VAT return"}
              </button>
            </div>
          </Surface>
        </div>

        <Surface padded={false}>
          <div className="flex flex-wrap items-center justify-between border-b border-border px-4 py-3 gap-2">
            <div>
              <div className="text-[14px] font-black tracking-tight">Latest invoices</div>
              <div className="text-[11.5px] text-muted-foreground">May cycle · {filteredInvoices.length} listed</div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[125px] h-8 rounded-xl border border-border bg-surface px-3 text-[12px] font-bold text-foreground hover:bg-accent focus:ring-0 focus:outline-none cursor-pointer">
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-border bg-surface shadow-pop text-[12.5px] font-bold">
                  <SelectItem value="All" className="rounded-lg focus:bg-accent cursor-pointer">All status</SelectItem>
                  <SelectItem value="paid" className="rounded-lg focus:bg-accent cursor-pointer">Paid</SelectItem>
                  <SelectItem value="pending" className="rounded-lg focus:bg-accent cursor-pointer">Pending</SelectItem>
                  <SelectItem value="overdue" className="rounded-lg focus:bg-accent cursor-pointer">Overdue</SelectItem>
                  <SelectItem value="failed" className="rounded-lg focus:bg-accent cursor-pointer">Failed</SelectItem>
                  <SelectItem value="refunded" className="rounded-lg focus:bg-accent cursor-pointer">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <button 
                onClick={() => exportToCSV(filteredInvoices, "latest_invoices_export")}
                className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-[12px] font-bold hover:bg-accent"
              >
                <Download className="h-3 w-3" /> Export
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="bg-surface-muted/40 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left">Invoice</th>
                  <th className="px-4 py-2.5 text-left">Customer</th>
                  <th className="px-4 py-2.5 text-left">Plate</th>
                  <th className="px-4 py-2.5 text-left">Plan</th>
                  <th className="px-4 py-2.5 text-right">Subtotal</th>
                  <th className="px-4 py-2.5 text-right">VAT 5%</th>
                  <th className="px-4 py-2.5 text-right">Total</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((i) => (
                  <tr key={i.id} className="border-t border-border hover:bg-surface-muted/40">
                    <td className="px-4 py-3"><Link to="/billing/invoices/$id" params={{id: i.id}} className="font-bold text-primary hover:underline">{i.id}</Link></td>
                    <td className="px-4 py-3">{i.customer}</td>
                    <td className="px-4 py-3 font-mono text-[11.5px] text-muted-foreground">{i.plate || "—"}</td>
                    <td className="px-4 py-3">{i.plan}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{(i.subtotal || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{(i.vat || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">{(i.total || 0).toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusChip tone={STATUS[i.status || "pending"]}>{i.status}</StatusChip></td>
                    <td className="px-4 py-3 text-right"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></td>
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
