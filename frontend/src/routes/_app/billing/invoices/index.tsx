import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { StatusChip } from "@/components/app/StatusChip";
import { Filter, Download, Search, MoreHorizontal, Plus } from "lucide-react";
import { PrimaryBtn } from "@/components/app/FormDialog";
import { useInvoices } from "@/lib/hooks/api";
import { useState } from "react";

export const Route = createFileRoute("/_app/billing/invoices/")({ component: Invoices });

const STATUS: Record<string, "success"|"warning"|"danger"|"neutral"> = {
  paid: "success", pending: "warning", overdue: "danger", failed: "danger", refunded: "neutral",
};

import { exportToCSV } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function Invoices() {
  const { data: invoicesData = [] } = useInvoices();
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPlan, setSelectedPlan] = useState("All");
  const [selectedCommunity, setSelectedCommunity] = useState("All");

  const filteredList = invoicesData.filter((i) => {
    const s = search.toLowerCase();
    const matchesSearch =
      i.id.toLowerCase().includes(s) ||
      i.customer.toLowerCase().includes(s) ||
      (i.plate || "").toLowerCase().includes(s);

    const matchesStatus = selectedStatus === "All" || i.status === selectedStatus;
    const matchesPlan = selectedPlan === "All" || i.plan === selectedPlan;
    const matchesCommunity = selectedCommunity === "All" || i.community === selectedCommunity;

    return matchesSearch && matchesStatus && matchesPlan && matchesCommunity;
  });

  return (
    <>
      <TopBar title="Invoices" subtitle="All invoices across plans, fleets and one-off services"
        actions={
          <Link to="/billing/invoices/new">
            <PrimaryBtn><Plus className="h-3.5 w-3.5"/> <span className="hidden sm:inline">Create invoice</span></PrimaryBtn>
          </Link>
        }
      />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-4">
        <Surface padded={false}>
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-muted px-2.5 py-1.5 text-[12.5px]">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Invoice #, customer, plate…"
                className="w-64 bg-transparent outline-none"
              />
            </div>
            
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

            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger className="w-[125px] h-8 rounded-xl border border-border bg-surface px-3 text-[12px] font-bold text-foreground hover:bg-accent focus:ring-0 focus:outline-none cursor-pointer">
                <SelectValue placeholder="All plans" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-border bg-surface shadow-pop text-[12.5px] font-bold">
                <SelectItem value="All" className="rounded-lg focus:bg-accent cursor-pointer">All plans</SelectItem>
                {Array.from(new Set(invoicesData.map((i) => i.plan).filter((p): p is string => Boolean(p)))).map((p) => (
                  <SelectItem key={p} value={p} className="rounded-lg focus:bg-accent cursor-pointer">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
              <SelectTrigger className="w-[155px] h-8 rounded-xl border border-border bg-surface px-3 text-[12px] font-bold text-foreground hover:bg-accent focus:ring-0 focus:outline-none cursor-pointer">
                <SelectValue placeholder="All communities" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-border bg-surface shadow-pop text-[12.5px] font-bold">
                <SelectItem value="All" className="rounded-lg focus:bg-accent cursor-pointer">All communities</SelectItem>
                {Array.from(new Set(invoicesData.map((i) => i.community).filter((c): c is string => Boolean(c)))).map((c) => (
                  <SelectItem key={c} value={c} className="rounded-lg focus:bg-accent cursor-pointer">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-2">
              <button 
                onClick={() => exportToCSV(filteredList, "invoices_export")}
                className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-[12px] font-bold hover:bg-accent"
              >
                <Download className="h-3 w-3" /> Export
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[820px]">
              <thead className="bg-surface-muted/40 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left">Invoice</th>
                  <th className="px-4 py-2.5 text-left">Customer</th>
                  <th className="px-4 py-2.5 text-left">Community</th>
                  <th className="px-4 py-2.5 text-left">Plate</th>
                  <th className="px-4 py-2.5 text-left">Plan</th>
                  <th className="px-4 py-2.5 text-right">VAT</th>
                  <th className="px-4 py-2.5 text-right">Total</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5 text-left">Date</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((i) => (
                  <tr key={i.id} className="border-t border-border hover:bg-surface-muted/40">
                    <td className="px-4 py-3"><Link to="/billing/invoices/$id" params={{id: i.id}} className="font-bold text-primary hover:underline">{i.id}</Link></td>
                    <td className="px-4 py-3">{i.customer}</td>
                    <td className="px-4 py-3 text-muted-foreground">{i.community}</td>
                    <td className="px-4 py-3 font-mono text-[11.5px]">{i.plate}</td>
                    <td className="px-4 py-3">{i.plan}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{(i.vat ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">AED {(i.total ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusChip tone={STATUS[i.status || "pending"]}>{i.status}</StatusChip></td>
                    <td className="px-4 py-3 text-muted-foreground">{i.date}</td>
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

