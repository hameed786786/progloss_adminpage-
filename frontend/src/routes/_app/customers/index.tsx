import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { StatusChip } from "@/components/app/StatusChip";
import { Filter, Download, ChevronDown, MoreHorizontal, Search, Plus, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FormDialog, Field, FieldGrid, PrimaryBtn, SecondaryBtn } from "@/components/app/FormDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomers, useApartments, usePlans, useVehicles, queryKeys } from "@/lib/hooks/api";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Customer as Cust } from "@/lib/api/types";

export const Route = createFileRoute("/_app/customers/")({ component: CustomersPage });

const STATUS: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  active: "success", paused: "warning", "churn-risk": "danger", cancelled: "neutral",
};

import { exportToCSV } from "@/lib/utils";

import { usePermission } from "@/hooks/usePermission";

function CustomersPage() {
  const formatDate = (dateVal?: string | Date) => {
    if (!dateVal) return "—";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const { allowed: canView } = usePermission("Customers", "VIEW");
  const { allowed: canCreate } = usePermission("Customers", "CREATE");
  const { allowed: canExport } = usePermission("Customers", "EXPORT");

  const { data: customersData = [] } = useCustomers();
  const { data: apartmentsData = [] } = useApartments();
  const { data: plansData = [] } = usePlans();
  const { data: vehiclesData = [] } = useVehicles();

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPlan, setSelectedPlan] = useState("All");
  const [selectedCommunity, setSelectedCommunity] = useState("All");
  const [open, setOpen] = useState(false);

  const filteredList = customersData.filter((c) => {
    const s = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(s) ||
      (c.email || "").toLowerCase().includes(s) ||
      c.id.toLowerCase().includes(s) ||
      (c.community || "").toLowerCase().includes(s) ||
      vehiclesData.some((v) => {
        const vCustId = typeof v.customer === "object" && v.customer ? v.customer.id : v.customer;
        return vCustId === c.id && v.plate.toLowerCase().includes(s);
      });

    const matchesStatus = selectedStatus === "All" || c.status === selectedStatus;
    const matchesPlan = selectedPlan === "All" || c.plan === selectedPlan;
    const matchesCommunity = selectedCommunity === "All" || c.community === selectedCommunity;

    return matchesSearch && matchesStatus && matchesPlan && matchesCommunity;
  });

  const activeCount = customersData.filter(c => c.status === "active").length;
  const churnCount = customersData.filter(c => c.status === "churn-risk").length;

  if (!canView) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm font-bold text-muted-foreground">Access Denied: Missing VIEW permission for Customers</div>
      </div>
    );
  }

  return (
    <>
      <TopBar
        title="Customers"
        subtitle={`${activeCount} active · 142 new this month · ${churnCount} churn-risk`}
        actions={
          canCreate ? (
            <PrimaryBtn onClick={() => setOpen(true)}><UserPlus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">New customer</span></PrimaryBtn>
          ) : undefined
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
                placeholder="Search name, email, plate…"
                className="w-64 bg-transparent outline-none"
              />
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[125px] h-8 rounded-xl border border-border bg-surface px-3 text-[12px] font-bold text-foreground hover:bg-accent focus:ring-0 focus:outline-none cursor-pointer">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-border bg-surface shadow-pop text-[12.5px] font-bold">
                <SelectItem value="All" className="rounded-lg focus:bg-accent cursor-pointer">All status</SelectItem>
                <SelectItem value="active" className="rounded-lg focus:bg-accent cursor-pointer">Active</SelectItem>
                <SelectItem value="paused" className="rounded-lg focus:bg-accent cursor-pointer">Paused</SelectItem>
                <SelectItem value="churn-risk" className="rounded-lg focus:bg-accent cursor-pointer">Churn risk</SelectItem>
                <SelectItem value="cancelled" className="rounded-lg focus:bg-accent cursor-pointer">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger className="w-[125px] h-8 rounded-xl border border-border bg-surface px-3 text-[12px] font-bold text-foreground hover:bg-accent focus:ring-0 focus:outline-none cursor-pointer">
                <SelectValue placeholder="All plans" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-border bg-surface shadow-pop text-[12.5px] font-bold">
                <SelectItem value="All" className="rounded-lg focus:bg-accent cursor-pointer">All plans</SelectItem>
                {plansData.filter(p => p.name).map((p) => (
                  <SelectItem key={p.id || p.name} value={p.name} className="rounded-lg focus:bg-accent cursor-pointer">{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
              <SelectTrigger className="w-[155px] h-8 rounded-xl border border-border bg-surface px-3 text-[12px] font-bold text-foreground hover:bg-accent focus:ring-0 focus:outline-none cursor-pointer">
                <SelectValue placeholder="All communities" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-border bg-surface shadow-pop text-[12.5px] font-bold">
                <SelectItem value="All" className="rounded-lg focus:bg-accent cursor-pointer">All communities</SelectItem>
                {apartmentsData.filter(a => a.name).map((a) => (
                  <SelectItem key={a.name} value={a.name} className="rounded-lg focus:bg-accent cursor-pointer">{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-2">
              {canExport && (
                <button 
                  onClick={() => exportToCSV(filteredList, "customers_export")}
                  className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-[12px] font-bold hover:bg-accent"
                >
                  <Download className="h-3 w-3" /> Export
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="bg-surface-muted/60 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left">Customer</th>
                  <th className="px-4 py-2.5 text-left">Community</th>
                  <th className="px-4 py-2.5 text-right">Vehicles</th>
                  <th className="px-4 py-2.5 text-left">Plan</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5 text-left">Since</th>
                  <th className="px-4 py-2.5 text-right">LTV (AED)</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((c) => (
                  <tr key={c.id} className="border-t border-border hover:bg-surface-muted/40">
                    <td className="px-4 py-3">
                      <Link to="/customers/$id" params={{ id: c.id }} className="group flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-[11px] font-black text-primary">
                          {c.name.split(" ").map(n=>n[0]).slice(0,2).join("")}
                        </div>
                        <div className="leading-tight">
                          <div className="font-bold text-foreground group-hover:text-primary">{c.name}</div>
                          <div className="text-[11px] text-muted-foreground">{c.email}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground/80">{c.community}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.vehicles}</td>
                    <td className="px-4 py-3">{c.plan}</td>
                    <td className="px-4 py-3"><StatusChip tone={STATUS[c.status || "active"]}>{c.status}</StatusChip></td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(c.since)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">{(c.ltv ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right"><button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[11.5px] text-muted-foreground">
            <span>Showing 1–{filteredList.length} of {customersData.length} customers</span>
            <div className="flex items-center gap-1">
              <button className="rounded-md border border-border bg-surface px-2 py-1 hover:bg-accent">Prev</button>
              <button className="rounded-md bg-primary px-2.5 py-1 font-bold text-primary-foreground">1</button>
              <button className="rounded-md border border-border bg-surface px-2.5 py-1 hover:bg-accent">2</button>
              <button className="rounded-md border border-border bg-surface px-2.5 py-1 hover:bg-accent">3</button>
              <button className="rounded-md border border-border bg-surface px-2 py-1 hover:bg-accent">Next</button>
            </div>
          </div>
        </Surface>
      </div>

      <CreateCustomerDialog
        open={open}
        onOpenChange={setOpen}
        communities={apartmentsData.map(a => a.name).filter(Boolean)}
        plans={plansData.filter(p => p.name)}
        nextId={`CUS-${10429 + customersData.length}`}
      />
    </>
  );
}

function CreateCustomerDialog({
  open,
  onOpenChange,
  communities = [],
  plans = [],
  nextId
}: {
  open: boolean;
  onOpenChange: (o: boolean)=>void;
  communities: string[];
  plans: any[];
  nextId: string;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const safeCommunities = communities.filter(Boolean);
  const safePlans = plans.filter(p => p && p.name);
  const [community, setCommunity] = useState("");
  const [plan, setPlan] = useState("");
  const [vehicles, setVehicles] = useState("1");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (safeCommunities.length > 0 && !community) {
      setCommunity(safeCommunities[0]);
    }
  }, [safeCommunities, community]);

  useEffect(() => {
    if (safePlans.length > 0 && !plan) {
      setPlan(safePlans[0].name);
    }
  }, [safePlans, plan]);

  const reset = () => { setName(""); setEmail(""); setPhone(""); setCommunity(safeCommunities[0] || ""); setPlan(safePlans[0]?.name || ""); setVehicles("1"); setStatus("active"); };
  const submit = async () => {
    if (!name.trim()) return toast.error("Customer name is required");
    if (!email.trim() || !email.includes("@")) return toast.error("Valid email is required");
    
    try {
      const c = {
        id: nextId, name: name.trim(), email: email.trim(), phone: phone.trim() || "—",
        community, vehicles: Math.max(1, parseInt(vehicles) || 1), plan, status,
        since: new Date().toLocaleString("en-US", { month: "short", year: "numeric" }), ltv: 0,
      };
      await api.createCustomer(c);
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers });
      toast.success("Customer created", { description: `${c.name} · ${c.id}` });
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create customer");
    }
  };

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Create new customer" description="Add a customer to your workspace and assign them to a plan."
      size="lg"
      footer={<><SecondaryBtn onClick={() => { reset(); onOpenChange(false); }}>Cancel</SecondaryBtn><PrimaryBtn onClick={submit}><Plus className="h-3.5 w-3.5" /> Create customer</PrimaryBtn></>}
    >
      <FieldGrid>
        <Field label="Full name"><Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g. Layla Hassan" /></Field>
        <Field label="Email"><Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="name@company.com" /></Field>
      </FieldGrid>
      <FieldGrid>
        <Field label="Phone"><Input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+971 50 000 0000" /></Field>
        <Field label="Vehicles"><Input type="number" min={1} value={vehicles} onChange={(e)=>setVehicles(e.target.value)} /></Field>
      </FieldGrid>
      <FieldGrid>
        <Field label="Community">
          <Select value={community || safeCommunities[0]} onValueChange={setCommunity}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{safeCommunities.map(c=> <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Plan">
          <Select value={plan || safePlans[0]?.name} onValueChange={setPlan}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{safePlans.map(p=> <SelectItem key={p.id || p.name} value={p.name}>{p.name} · AED {p.price}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </FieldGrid>
      <Field label="Status">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="churn-risk">Churn risk</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </FormDialog>
  );
}

