import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface, SectionTitle } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { FileCheck2, Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useInvoices } from "@/lib/hooks/api";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/billing/vat")({ component: Page });

function Page() {
  const { data: invoices = [] } = useInvoices();

  const monthsList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthName = new Date().toLocaleDateString("en-US", { month: "long" });
  const currentMonthShort = new Date().toLocaleDateString("en-US", { month: "short" });

  const monthlyData: Record<string, { net: number, vat: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mName = monthsList[d.getMonth()];
    monthlyData[mName] = { net: 0, vat: 0 };
  }

  invoices.forEach(i => {
    if (!i.date) return;
    const d = new Date(i.date);
    if (!isNaN(d.getTime())) {
      const mName = monthsList[d.getMonth()];
      if (monthlyData[mName]) {
        monthlyData[mName].net += (i.subtotal ?? 0) / 1000;
        monthlyData[mName].vat += (i.vat ?? 0) / 1000;
      }
    }
  });

  const monthlyTrend = Object.entries(monthlyData).map(([m, val]) => ({
    m,
    net: parseFloat(val.net.toFixed(2)),
    vat: parseFloat(val.vat.toFixed(2)),
  }));

  const currentMonthData = monthlyData[currentMonthShort] || { net: 0, vat: 0 };
  const standardRated = currentMonthData.net * 1000;
  const zeroRated = 0;
  const outputVat = currentMonthData.vat * 1000;
  const inputVat = 0;
  const netPayable = outputVat - inputVat;

  const quarters = [
    { q: "Q2 2026", net: Math.round(standardRated), vat: Math.round(outputVat), status: "Draft" },
    { q: "Q1 2026", net: 712420, vat: 35621, status: "Filed" },
    { q: "Q4 2025", net: 668120, vat: 33406, status: "Filed" },
    { q: "Q3 2025", net: 621880, vat: 31094, status: "Filed" },
  ];

  const handleDownloadQuarter = async (quarterName: string, netSupplies: number, vat: number) => {
    const toastId = toast.loading(`Generating VAT return for ${quarterName}...`);
    try {
      const job = await api.createExportJob({
        name: `${quarterName} VAT Return`,
        template: "VAT Return (FTA)",
        desc: `VAT Return for ${quarterName} · Supplies: AED ${netSupplies.toLocaleString()} · VAT: AED ${vat.toLocaleString()}`,
        format: "CSV",
      });
      toast.loading(`Downloading ${quarterName} VAT return...`, { id: toastId });
      await api.downloadExport(job.id, job.fileName || `vat-return-${quarterName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`);
      toast.success("Download complete", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Failed to download VAT return", { id: toastId });
    }
  };

  const handleExportAllVat = async () => {
    const toastId = toast.loading("Generating VAT Summary Register...");
    try {
      const job = await api.createExportJob({
        name: "VAT Summary Register",
        template: "VAT Return (FTA)",
        desc: `VAT Summary Register MTD · Output VAT: AED ${outputVat.toLocaleString()}`,
        format: "CSV",
      });
      toast.loading("Downloading VAT summary...", { id: toastId });
      await api.downloadExport(job.id, job.fileName || "vat-summary-register.csv");
      toast.success("Download complete", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Failed to download summary", { id: toastId });
    }
  };

  return (
    <>
      <TopBar title="VAT Reports" subtitle="FTA-compliant · TRN 100437289100003 · Quarterly filings" actions={
        <button 
          onClick={handleExportAllVat}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-[12.5px] font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          <Download className="h-3.5 w-3.5"/> Export VAT 201
        </button>
      }/>
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Output VAT (MTD)" value={`AED ${outputVat.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={FileCheck2} accent="primary" />
          <KpiCard label="Input VAT (MTD)" value={`AED ${inputVat.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={FileCheck2} accent="primary" />
          <KpiCard label="Net payable" value={`AED ${netPayable.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={FileCheck2} accent="warning" />
          <KpiCard label="Next filing" value="28 Jun 2026" icon={FileCheck2} accent="primary" hint="VAT 201 · Q2" />
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          <Surface className="xl:col-span-2">
            <SectionTitle title="Output VAT trend" sub="AED thousands · 5% rate" />
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyTrend} margin={{ left: -10, right: 10, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.92 0.008 250)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="vat" fill="oklch(0.48 0.16 258)" radius={[6,6,0,0]} maxBarSize={36}/>
              </BarChart>
            </ResponsiveContainer>
          </Surface>
          <Surface>
            <SectionTitle title={`VAT breakdown · ${currentMonthName}`} />
            <div className="space-y-2.5 text-[12.5px]">
              {[
                ["Standard-rated supplies (5%)", `AED ${standardRated.toLocaleString(undefined, { maximumFractionDigits: 0 })}`],
                ["Zero-rated supplies", `AED ${zeroRated.toLocaleString(undefined, { maximumFractionDigits: 0 })}`],
                ["Exempt supplies", "AED 0"],
                ["Output VAT collected", `AED ${outputVat.toLocaleString(undefined, { maximumFractionDigits: 0 })}`],
                ["Recoverable input VAT", `AED ${inputVat.toLocaleString(undefined, { maximumFractionDigits: 0 })}`],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between border-b border-border pb-2 last:border-0">
                  <span className="text-muted-foreground">{k}</span><span className="font-bold tabular-nums">{v}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 text-[14px] font-black"><span>Net VAT payable</span><span>AED {netPayable.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
            </div>
          </Surface>
        </div>
        <Surface padded={false}>
          <div className="px-5 py-4 border-b border-border"><SectionTitle title="Quarterly filings" sub="VAT 201 history" /></div>
          <table className="w-full text-[12.5px]">
            <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3 text-left">Period</th><th className="px-4 py-3 text-right">Net supplies</th><th className="px-4 py-3 text-right">VAT</th><th className="px-4 py-3 text-right">Status</th><th className="px-4 py-3 text-right"></th></tr></thead>
            <tbody>
              {quarters.map(q => (
                <tr key={q.q} className="border-t border-border hover:bg-surface-muted/60">
                  <td className="px-4 py-3 font-bold">{q.q}</td>
                  <td className="px-4 py-3 text-right tabular-nums">AED {q.net.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold">AED {q.vat.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right"><StatusChip tone={q.status === "Filed" ? "success" : "warning"}>{q.status}</StatusChip></td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleDownloadQuarter(q.q, q.net, q.vat)}
                      className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Surface>
      </div>
    </>
  );
}
