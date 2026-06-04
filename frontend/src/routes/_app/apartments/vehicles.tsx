import { createFileRoute } from '@tanstack/react-router';
import { useState } from "react";
import { exportToCSV } from "@/lib/utils";
import { Download, Car, MapPin, Search, Hash } from "lucide-react";
import { useVehicles, useApartments } from "@/lib/hooks/api";
import { KpiCard } from "@/components/app/KpiCard";
import { Surface } from "@/components/app/Surface";
import { StatusChip } from "@/components/app/StatusChip";
import { TopBar } from "@/components/app/TopBar";

export const Route = createFileRoute("/_app/apartments/vehicles")({ component: Page });

function Page() {
  const { data: vehiclesData = [] } = useVehicles();
  const { data: apartmentsData = [] } = useApartments();

  const VEHICLES = vehiclesData;
  const apartments = apartmentsData;
  const [search, setSearch] = useState("");

  const formatLastWash = (dateStr?: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const diffTime = Date.now() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  const filteredVehicles = VEHICLES.filter((v) => {
    const s = search.toLowerCase();
    const customerName = typeof v.customer === 'object' && v.customer ? v.customer.name : (v.customer || "");
    return (
      v.plate.toLowerCase().includes(s) ||
      v.make.toLowerCase().includes(s) ||
      (v.color || "").toLowerCase().includes(s) ||
      customerName.toLowerCase().includes(s) ||
      (v.community || "").toLowerCase().includes(s)
    );
  });

  return (
    <>
      <TopBar title="Vehicle Mapping" subtitle={`${VEHICLES.length} vehicles registered across ${apartments.length} communities`} />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Total vehicles" value={String(VEHICLES.length)} icon={Car} accent="primary" />
          <KpiCard label="Active today" value={String(VEHICLES.filter(v=>v.status==="active").length)} icon={Car} accent="success" />
          <KpiCard label="Queued wash" value={String(VEHICLES.filter(v=>v.status==="queued").length)} icon={Hash} accent="warning" />
          <KpiCard label="Communities" value={String(apartments.length)} icon={MapPin} accent="primary" />
        </div>
        <Surface padded={false}>
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface-muted px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search plates, vehicles, customers…" 
                className="flex-1 bg-transparent text-[13px] outline-none" 
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button 
                onClick={() => exportToCSV(filteredVehicles, "vehicles_mapping")}
                className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-[12px] font-bold hover:bg-accent"
              >
                <Download className="h-3 w-3" /> Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[720px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Plate</th>
                  <th className="px-4 py-3 text-left">Vehicle</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Community</th>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-left">Last wash</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((v, i) => {
                  const customerName = typeof v.customer === 'object' && v.customer ? v.customer.name : (v.customer || "");
                  return (
                    <tr key={i} className="border-t border-border hover:bg-surface-muted/60">
                      <td className="px-4 py-3 font-mono font-bold">{v.plate}</td>
                      <td className="px-4 py-3"><div className="font-bold">{v.make}</div><div className="text-[10.5px] text-muted-foreground">{v.color}</div></td>
                      <td className="px-4 py-3">{customerName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.community}</td>
                      <td className="px-4 py-3"><StatusChip tone="primary" dot={false}>{v.plan}</StatusChip></td>
                      <td className="px-4 py-3 text-muted-foreground">{formatLastWash(v.lastWash)}</td>
                      <td className="px-4 py-3 text-right"><StatusChip tone={v.status==="active"?"success":"warning"}>{v.status}</StatusChip></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Surface>
      </div>
    </>
  );
}
