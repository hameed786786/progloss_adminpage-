import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface, SectionTitle } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { Banknote, ArrowLeft, Building2, Car, Users, TrendingUp, Wrench } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useApartments, useCustomers, useInvoices } from "@/lib/hooks/api";

export const Route = createFileRoute("/_app/apartments/revenue/$name")({ component: Detail });

const STATUS: Record<string, "success"|"warning"|"danger"|"neutral"> = {
  paid: "success", pending: "warning", overdue: "danger", failed: "danger", refunded: "neutral",
};

function Detail() {
  const { name } = useParams({ from: "/_app/apartments/revenue/$name" });
  const decoded = decodeURIComponent(name);

  const { data: apartmentsData = [] } = useApartments();
  const { data: customersData = [] } = useCustomers();
  const { data: invoicesData = [] } = useInvoices();

  const apartments = apartmentsData;
  const customers = customersData;
  const invoicesList = invoicesData;

  const a = apartments.find(x => x.name === decoded);
  const total = apartments.reduce((s, x) => s + (x.mrr || 0), 0);

  if (!a) {
    return (
      <>
        <TopBar title="Not found" subtitle="That community does not exist" />
        <div className="px-4 py-4 sm:px-6 sm:py-6">
          <Link to="/apartments/revenue" className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-primary hover:underline"><ArrowLeft className="h-3.5 w-3.5"/> Back to revenue</Link>
        </div>
      </>
    );
  }

  const residents = customers.filter(c => c.community === a.name);
  const invoices = invoicesList.filter(i => i.community && i.community.includes(a.name.split(" ").slice(0,2).join(" "))).slice(0, 6);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const months = [];
  const currentMonthIdx = new Date().getMonth();
  for (let i = 5; i >= 0; i--) {
    const idx = (currentMonthIdx - i + 12) % 12;
    months.push(monthNames[idx]);
  }
  const trend = months.map((m, idx) => {
    const factor = 0.9 + (idx * 0.02) + (a.name.charCodeAt(0) % 5) / 100;
    return { m, mrr: Math.round((a.mrr || 0) * factor) };
  });

  return (
    <>
      <TopBar title={a.name} subtitle={`Revenue detail · AED ${(a.mrr ?? 0).toLocaleString()}/mo · ${(((a.mrr ?? 0)/total)*100).toFixed(1)}% of portfolio`} />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <Link to="/apartments/revenue" className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5"/> Back to revenue</Link>

        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Monthly recurring" value={`AED ${(a.mrr ?? 0).toLocaleString()}`} icon={Banknote} accent="primary" />
          <KpiCard label="ARPV" value={`AED ${Math.round((a.mrr ?? 0)/Math.max(1, a.vehicles ?? 1))}`} icon={TrendingUp} accent="success" hint="Per vehicle / month" />
          <KpiCard label="Vehicles" value={String(a.vehicles ?? 0)} icon={Car} accent="primary" />
          <KpiCard label="Occupancy" value={`${a.occupancy ?? 0}%`} icon={Building2} accent="success" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Surface className="lg:col-span-2">
            <SectionTitle title="MRR trend" sub="6 months · attributed to this community" />
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trend} margin={{ left: -10, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.48 0.16 258)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.48 0.16 258)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.52 0.02 256)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.92 0.008 250)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="mrr" stroke="oklch(0.48 0.16 258)" strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </Surface>

          <Surface>
            <SectionTitle title="Community snapshot" />
            <div className="space-y-3 text-[12.5px]">
              <Row icon={<Users className="h-3.5 w-3.5"/>} label="Residents" value={String(a.residents ?? 0)} />
              <Row icon={<Car className="h-3.5 w-3.5"/>} label="Active vehicles" value={String(a.vehicles ?? 0)} />
              <Row icon={<Wrench className="h-3.5 w-3.5"/>} label="Assigned staff" value={String(a.staff ?? 0)} />
              <Row icon={<Building2 className="h-3.5 w-3.5"/>} label="Total units" value={String(a.units ?? 0)} />
              <Row icon={<Banknote className="h-3.5 w-3.5"/>} label="ARPU" value={`AED ${Math.round((a.mrr ?? 0) / Math.max(1, residents.length || (a.residents ?? 1)))}`} />
              <div className="pt-3 border-t border-border">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Open complaints</div>
                {(a.complaints ?? 0) > 0 ? <StatusChip tone={(a.complaints ?? 0) > 2 ? "danger" : "warning"}>{(a.complaints ?? 0)} open</StatusChip> : <StatusChip tone="success">All clear</StatusChip>}
              </div>
            </div>
          </Surface>
        </div>

        <Surface padded={false}>
          <SectionTitle title="Recent invoices" sub="Linked to this community" />
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[640px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Invoice</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No invoices in the last cycle.</td></tr>
                ) : invoices.map(i => (
                  <tr key={i.id} className="border-t border-border hover:bg-surface-muted/60">
                    <td className="px-4 py-3"><Link to="/billing/invoices/$id" params={{id: i.id}} className="font-mono font-bold text-primary hover:underline">{i.id}</Link></td>
                    <td className="px-4 py-3">{i.customer}</td>
                    <td className="px-4 py-3">{i.plan}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">AED {(i.total ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusChip tone={STATUS[i.status || "pending"]}>{i.status}</StatusChip></td>
                    <td className="px-4 py-3 text-muted-foreground">{i.date}</td>
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

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">{icon} {label}</span>
      <span className="font-black tabular-nums">{value}</span>
    </div>
  );
}
