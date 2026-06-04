import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface, SectionTitle } from "@/components/app/Surface";
import { StatusChip } from "@/components/app/StatusChip";
import { ArrowLeft, Mail, Phone, Building2, Car, CreditCard, MessageSquare, Activity, FileText } from "lucide-react";
import { useCustomer, useInvoices, useTickets, useVehicles } from "@/lib/hooks/api";

export const Route = createFileRoute("/_app/customers/$id")({ component: CustomerDetail });

function CustomerDetail() {
  const formatDate = (dateVal?: string | Date) => {
    if (!dateVal) return "—";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const { id } = Route.useParams();
  const { data: customer, isLoading } = useCustomer(id);
  const { data: invoicesData = [] } = useInvoices();
  const { data: ticketsData = [] } = useTickets();
  const { data: vehiclesData = [] } = useVehicles();

  if (isLoading || !customer) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-bold text-muted-foreground animate-pulse">Loading customer details...</div>
      </div>
    );
  }

  const c = customer;

  const invoices = invoicesData.filter(i => i.customer === c.name);

  const tickets = ticketsData.filter(t => t.customer === c.name);

  const customerVehicles = vehiclesData.filter(v => v.customer === c.id || (typeof v.customer === 'object' && v.customer?.id === c.id) || v.customer === c.name);

  const vehiclesList = customerVehicles;

  return (
    <>
      <TopBar title={c.name} subtitle={`${c.id} · ${c.community} · Customer since ${formatDate(c.since)}`}/>
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-4">
        <Link to="/customers" className="inline-flex items-center gap-1 text-[12px] font-bold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All customers
        </Link>

        <div className="grid gap-4 xl:grid-cols-3">
          <Surface className="xl:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-[18px] font-black text-primary">
                {c.name.split(" ").map(n=>n[0]).slice(0,2).join("")}
              </div>
              <div>
                <div className="text-[16px] font-black tracking-tight">{c.name}</div>
                <StatusChip tone={c.status === "active" ? "success" : c.status === "paused" ? "warning" : "danger"}>{c.status}</StatusChip>
              </div>
            </div>
            <div className="mt-5 space-y-2.5 text-[12.5px]">
              <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {c.email}</div>
              <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {c.phone}</div>
              <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {c.community}</div>
              <div className="flex items-center gap-2"><Car className="h-3.5 w-3.5 text-muted-foreground" /> {c.vehicles} vehicle(s)</div>
              <div className="flex items-center gap-2"><CreditCard className="h-3.5 w-3.5 text-muted-foreground" /> {c.plan}</div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-surface-muted px-3 py-3">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">LTV</div>
                <div className="mt-0.5 text-[18px] font-black">AED {(c.ltv ?? 0).toLocaleString()}</div>
              </div>
              <div className="rounded-xl bg-surface-muted px-3 py-3">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">Washes</div>
                <div className="mt-0.5 text-[18px] font-black">128</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-xl bg-primary px-3 py-2 text-[12px] font-bold text-primary-foreground hover:bg-primary/90">Message</button>
              <button className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-[12px] font-bold hover:bg-accent">Open ticket</button>
            </div>
          </Surface>

          <div className="xl:col-span-2 space-y-4">
            <Surface>
              <SectionTitle title="Vehicles" sub={`${vehiclesList.length} registered`} />
              <div className="grid gap-3 sm:grid-cols-2">
                {vehiclesList.map((vh, i) => (
                  <div key={i} className="rounded-xl border border-border bg-surface-muted/40 p-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <Car className="h-3.5 w-3.5" /> Dubai · Private
                    </div>
                    <div className="mt-1 text-[16px] font-black tracking-tight">{vh.plate}</div>
                    <div className="mt-1 text-[12px] text-muted-foreground">
                      {vh.make} {vh.color ? `· ${vh.color}` : ''}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11.5px]">
                      <span className="text-muted-foreground">Last wash · {vh.lastWash || "13 May"}</span>
                      <StatusChip tone={vh.status === "Healthy" || vh.status === "active" ? "success" : "warning"}>{vh.status}</StatusChip>
                    </div>
                  </div>
                ))}
              </div>
            </Surface>

            <Surface>
              <SectionTitle title="Recent invoices" sub="Last 6 months" />
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-[12.5px]">
                  <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    <tr><th className="px-3 py-2 text-left">Invoice</th><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-right">Amount</th><th className="px-3 py-2 text-left">Status</th></tr>
                  </thead>
                  <tbody>
                    {invoices.slice(0, 5).map((i) => (
                      <tr key={i.id} className="border-t border-border">
                        <td className="px-3 py-2.5"><Link to="/billing/invoices/$id" params={{id: i.id}} className="font-bold text-primary hover:underline">{i.id}</Link></td>
                        <td className="px-3 py-2.5 text-muted-foreground">{i.date}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums font-bold">AED {i.total?.toFixed(2)}</td>
                        <td className="px-3 py-2.5"><StatusChip tone={i.status === "paid" ? "success" : i.status === "overdue" ? "danger" : i.status === "failed" ? "danger" : "warning"}>{i.status}</StatusChip></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Surface>

            <Surface>
              <SectionTitle title="Activity timeline" />
              <div className="relative space-y-4 pl-5 before:absolute before:left-1.5 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
                {[
                  { icon: FileText, t: "Invoice INV-2026-04812 paid · AED 441.00", time: "Today 11:02" },
                  { icon: Activity, t: "Wash completed at Marina Gate 2 by Imran Saeed", time: "Today 09:14" },
                  { icon: MessageSquare, t: "Submitted ticket TKT-9821 · Water spots on rear", time: "Today 09:42" },
                  { icon: CreditCard, t: "Renewed Royal Monthly subscription", time: "12 May" },
                  { icon: Car, t: "Added vehicle Q-15-67120 (Mercedes G63)", time: "08 May" },
                ].map((e, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[18px] top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-primary ring-4 ring-background"></div>
                    <div className="flex items-start gap-2">
                      <e.icon className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-[12.5px] text-foreground">{e.t}</div>
                        <div className="text-[11px] text-muted-foreground">{e.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Surface>
          </div>
        </div>
      </div>
    </>
  );
}

