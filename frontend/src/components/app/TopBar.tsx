import { Search, Bell, Command, Info, CheckCircle, AlertTriangle, X } from "lucide-react";
import { MobileNav } from "./MobileNav";
import { useRouterState, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  useInvoices,
  useTickets,
  useCustomers,
  useStaff,
  useMe,
  useApartments,
  useWorkOrders,
  useVehicles,
  useEcommerceProducts,
  useEcommerceOrders,
  useComplaints,
  queryKeys
} from "@/lib/hooks/api";
import { NAV } from "./nav-config";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";


export function TopBar({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  const routerState = useRouterState();
  const isDashboard = routerState.location.pathname === "/dashboard" || routerState.location.pathname === "/";
  
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // State for global search Command Dialog
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const { data: profile } = useMe();
  const dismissedIds = profile?.dismissedNotifications || [];

  // Fetch dynamic database records for notifications and search
  const { data: invoices = [] } = useInvoices();
  const { data: tickets = [] } = useTickets();
  const { data: customers = [] } = useCustomers();
  const { data: staffList = [] } = useStaff();
  const { data: apartments = [] } = useApartments();
  const { data: workOrders = [] } = useWorkOrders();
  const { data: vehicles = [] } = useVehicles();
  const { data: ecommerceProducts = [] } = useEcommerceProducts();
  const { data: ecommerceOrders = [] } = useEcommerceOrders();
  const { data: complaints = [] } = useComplaints();

  // Listen for keyboard command shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compile dynamic notifications from real database records
  const allNotifications: { id: string; type: "success" | "danger" | "warning"; title: string; desc: string; time: string; link: string }[] = [];

  // 1. Failed/overdue invoices
  invoices.filter(inv => inv.status === "failed" || inv.status === "overdue").forEach(inv => {
    allNotifications.push({
      id: `inv-fail-${inv.id}`,
      type: "danger",
      title: "Invoice Auto-charge Failed",
      desc: `${inv.customer} · AED ${inv.total?.toFixed(2)} · ${inv.plan}`,
      time: inv.date || "Today",
      link: `/billing/invoices/${inv.id}`
    });
  });

  // 2. Escalated tickets
  tickets.filter(t => t.status === "escalated").forEach(t => {
    allNotifications.push({
      id: `ticket-esc-${t.id}`,
      type: "warning",
      title: "Ticket Escalated",
      desc: `${t.customer} · ${t.subject}`,
      time: t.created || "Today",
      link: "/customers/tickets"
    });
  });

  // 3. Paid invoices (captured payments)
  invoices.filter(inv => inv.status === "paid").forEach(inv => {
    allNotifications.push({
      id: `inv-paid-${inv.id}`,
      type: "success",
      title: "Payment Captured Successfully",
      desc: `${inv.customer} · AED ${inv.total?.toFixed(2)}`,
      time: inv.date || "Today",
      link: `/billing/invoices/${inv.id}`
    });
  });

  // 4. Open tickets
  tickets.filter(t => t.status === "open").forEach(t => {
    allNotifications.push({
      id: `ticket-open-${t.id}`,
      type: "warning",
      title: "New Customer Ticket",
      desc: `${t.customer} · ${t.subject}`,
      time: t.created || "Today",
      link: "/customers/tickets"
    });
  });

  // Filter out dismissed notifications
  const notifications = allNotifications.filter(n => !dismissedIds.includes(n.id));
  const unreadCount = notifications.length;

  const dismissNotification = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const next = [...dismissedIds, id];
    try {
      await api.updateDismissedNotifications(next);
      void queryClient.invalidateQueries({ queryKey: queryKeys.me });
    } catch (err: any) {
      toast.error(err.message || "Failed to update notification");
    }
  };

  const clearAllNotifications = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const activeIds = notifications.map(n => n.id);
    const next = [...dismissedIds, ...activeIds];
    try {
      await api.updateDismissedNotifications(next);
      void queryClient.invalidateQueries({ queryKey: queryKeys.me });
    } catch (err: any) {
      toast.error(err.message || "Failed to clear notifications");
    }
  };

  // Compile flat navigation links for search index dynamically
  const navItems: { label: string; to: string }[] = [];
  NAV.forEach((group) => {
    if (group.to) {
      navItems.push({ label: group.label, to: group.to });
    }
    if (group.items) {
      group.items.forEach((item) => {
        navItems.push({ label: `${group.label} → ${item.label}`, to: item.to });
      });
    }
  });

  const [searchQuery, setSearchQuery] = useState("");

  const customFilter = (value: string, search: string) => {
    const searchLower = search.toLowerCase().trim();
    if (!searchLower) return 1;
    const valueLower = value.toLowerCase();
    const searchWords = searchLower.split(/\s+/);
    return searchWords.every(word => valueLower.includes(word)) ? 1 : 0;
  };

  // Score a single item value against the query (higher = better match)
  const scoreItem = (value: string, query: string): number => {
    if (!query) return 0;
    const q = query.toLowerCase().trim();
    const v = value.toLowerCase();
    const words = q.split(/\s+/);
    if (!words.every(w => v.includes(w))) return 0;
    // Bonus for word-boundary / prefix match
    const startsWithBonus = v.startsWith(q) ? 10 : 0;
    const wordBoundaryBonus = new RegExp(`\\b${words[0]}`).test(v) ? 5 : 0;
    return 1 + startsWithBonus + wordBoundaryBonus;
  };

  // Return the best score across all values in a group
  const groupScore = (values: string[]): number =>
    Math.max(0, ...values.map(v => scoreItem(v, searchQuery)));

  return (
    <header className="sticky top-0 z-20 flex flex-col gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-5">
      <div className="flex items-center gap-3 min-w-0">
        <MobileNav />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[18px] sm:text-[22px] font-black leading-tight tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-0.5 truncate text-[12px] sm:text-[13px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 lg:overflow-visible relative">
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-[13px] text-muted-foreground shadow-card transition-colors hover:border-primary/30 w-[240px] xl:w-[280px] text-left cursor-pointer"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-muted-foreground">Search…</span>
          <kbd className="hidden xl:inline-flex items-center gap-0.5 rounded-md border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
            <Command className="h-2.5 w-2.5" /> K
          </kbd>
        </button>
        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground hover:bg-accent cursor-pointer"
        >
          <Search className="h-4 w-4" />
        </button>
        {actions}

        {isDashboard && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
              className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer ${showNotifications ? "bg-accent text-foreground" : ""}`}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[320px] sm:w-[380px] rounded-2xl border border-border bg-surface p-4 shadow-pop animate-in fade-in-50 slide-in-from-top-1">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <div className="text-[14px] font-black tracking-tight">System Notifications</div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <>
                        <button
                          onClick={clearAllNotifications}
                          className="text-[11.5px] font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer mr-1"
                        >
                          Clear all
                        </button>
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                          {unreadCount} active
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-2 divide-y divide-border max-h-[320px] overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-[12.5px] text-muted-foreground">
                      No notifications or system alerts.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        to={n.link}
                        onClick={() => setShowNotifications(false)}
                        className="flex gap-3 py-3 first:pt-1 last:pb-1 hover:bg-surface-muted/30 rounded-xl px-2 -mx-2 transition-colors group/item relative"
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                          n.type === "success" ? "bg-[color:oklch(0.95_0.05_155)] text-[color:oklch(0.4_0.12_155)]" :
                          n.type === "danger" ? "bg-[color:oklch(0.96_0.04_25)] text-[color:oklch(0.45_0.18_25)]" :
                          "bg-[color:oklch(0.97_0.06_75)] text-[color:oklch(0.45_0.13_60)]"
                        }`}>
                          {n.type === "success" ? <CheckCircle className="h-4 w-4" /> :
                           n.type === "danger" ? <AlertTriangle className="h-4 w-4" /> :
                           <Info className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0 leading-tight pr-6">
                          <div className="text-[12.5px] font-bold text-foreground truncate">{n.title}</div>
                          <div className="mt-0.5 text-[11.5px] text-muted-foreground line-clamp-2">{n.desc}</div>
                          <div className="mt-1 text-[10px] text-muted-foreground/80">{n.time}</div>
                        </div>
                        <button
                          onClick={(e) => dismissNotification(n.id, e)}
                          aria-label="Dismiss notification"
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 p-1 rounded-md hover:bg-surface-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <CommandDialog open={searchOpen} onOpenChange={(open) => { setSearchOpen(open); if (!open) setSearchQuery(""); }} filter={customFilter}>
        <CommandInput
          placeholder="Search everything (customers, invoices, staff, apartments, work orders, products, tickets)..."
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {(() => {
            // Build all groups with their relevance scores
            const navValues = navItems.map(item => `page navigation ${item.label} ${item.to}`.toLowerCase());
            const custValues = customers.map(c => `customer ${c.name} ${c.email || ""} ${c.phone || ""} ${c.community || ""} ${c.id}`.toLowerCase());
            const invValues = invoices.map(inv => `invoice ${inv.id} ${inv.customer} ${inv.plan || ""} ${inv.plate || ""} ${inv.community || ""} ${inv.status || ""}`.toLowerCase());
            const staffValues = staffList.map(s => `staff ${s.id} ${s.name} ${s.role || ""} ${s.zone || ""} ${s.status || ""}`.toLowerCase());
            const aptValues = apartments.map(a => `apartment community ${a.name}`.toLowerCase());
            const ticketValues = tickets.map(t => `ticket ${t.id} ${t.subject} ${t.customer} ${t.status || ""} ${t.assigned || ""}`.toLowerCase());
            const complaintValues = complaints.map(c => `complaint ${c.id} ${c.subject} ${c.customer} ${c.status || ""}`.toLowerCase());
            const woValues = workOrders.map(w => `work order ${w.id} ${w.plate || ""} ${w.community || ""} ${w.plan || ""} ${w.tech || ""} ${w.status || ""}`.toLowerCase());
            const vehValues = vehicles.map((v, i) => { const cn = typeof v.customer === "object" && v.customer ? (v.customer.name || "") : (v.customer || ""); return `vehicle car ${v.plate} ${v.make || ""} ${v.color || ""} ${cn} ${v.community || ""}`.toLowerCase(); });
            const prodValues = ecommerceProducts.map(p => `product ecommerce ${p.sku} ${p.name} ${p.category || ""} ${p.status || ""}`.toLowerCase());
            const orderValues = ecommerceOrders.map(o => `order ecommerce ${o.id} ${o.customer} ${o.status || ""} ${o.channel || ""}`.toLowerCase());

            const groups = [
              { key: "nav",        score: groupScore(navValues),       show: navItems.length > 0 },
              { key: "customers",  score: groupScore(custValues),       show: customers.length > 0 },
              { key: "invoices",   score: groupScore(invValues),        show: invoices.length > 0 },
              { key: "staff",      score: groupScore(staffValues),      show: staffList.length > 0 },
              { key: "apartments", score: groupScore(aptValues),        show: apartments.length > 0 },
              { key: "tickets",    score: groupScore(ticketValues),     show: tickets.length > 0 },
              { key: "complaints", score: groupScore(complaintValues),  show: complaints.length > 0 },
              { key: "workorders", score: groupScore(woValues),         show: workOrders.length > 0 },
              { key: "vehicles",   score: groupScore(vehValues),        show: vehicles.length > 0 },
              { key: "products",   score: groupScore(prodValues),       show: ecommerceProducts.length > 0 },
              { key: "eorders",    score: groupScore(orderValues),      show: ecommerceOrders.length > 0 },
            ]
              // When there's a query, sort by score descending; ties keep original order (stable)
              .sort((a, b) => searchQuery ? b.score - a.score : 0)
              .filter(g => g.show);

            const renderGroup = (key: string, isFirst: boolean) => {
              const sep = !isFirst ? <CommandSeparator key={`sep-${key}`} /> : null;
              switch (key) {
                case "nav":
                  return [sep, <CommandGroup key="nav" heading="Navigation / Pages">
                    {navItems.map((item) => (
                      <CommandItem key={item.to} value={`page navigation ${item.label} ${item.to}`.toLowerCase()} onSelect={() => { setSearchOpen(false); navigate({ to: item.to }); }}>
                        <span>{item.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>];
                case "customers":
                  return [sep, <CommandGroup key="customers" heading="Customers">
                    {customers.map((cust) => (
                      <CommandItem key={cust.id} value={`customer ${cust.name} ${cust.email || ""} ${cust.phone || ""} ${cust.community || ""} ${cust.id}`.toLowerCase()} onSelect={() => { setSearchOpen(false); navigate({ to: `/customers/${cust.id}` }); }}>
                        <div className="flex flex-col"><span className="font-bold">{cust.name}</span><span className="text-[11px] text-muted-foreground">{cust.id} · {cust.email || "No email"} · {cust.phone || "No phone"} · {cust.community || "No community"}</span></div>
                      </CommandItem>
                    ))}
                  </CommandGroup>];
                case "invoices":
                  return [sep, <CommandGroup key="invoices" heading="Invoices">
                    {invoices.map((inv) => (
                      <CommandItem key={inv.id} value={`invoice ${inv.id} ${inv.customer} ${inv.plan || ""} ${inv.plate || ""} ${inv.community || ""} ${inv.status || ""}`.toLowerCase()} onSelect={() => { setSearchOpen(false); navigate({ to: `/billing/invoices/${inv.id}` }); }}>
                        <div className="flex flex-col"><span className="font-bold">{inv.id}</span><span className="text-[11px] text-muted-foreground">{inv.customer} · {inv.plan || "One-off"} · AED {inv.total?.toFixed(2)} · {inv.status}</span></div>
                      </CommandItem>
                    ))}
                  </CommandGroup>];
                case "staff":
                  return [sep, <CommandGroup key="staff" heading="Staff Directory">
                    {staffList.map((s) => (
                      <CommandItem key={s.id} value={`staff ${s.id} ${s.name} ${s.role || ""} ${s.zone || ""} ${s.status || ""}`.toLowerCase()} onSelect={() => { setSearchOpen(false); navigate({ to: "/staff/directory" }); }}>
                        <div className="flex flex-col"><span className="font-bold">{s.name}</span><span className="text-[11px] text-muted-foreground">{s.id} · {s.role || "Technician"} · {s.zone || "HQ"} · Status: {s.status}</span></div>
                      </CommandItem>
                    ))}
                  </CommandGroup>];
                case "apartments":
                  return [sep, <CommandGroup key="apartments" heading="Apartments & Communities">
                    {apartments.map((apt) => (
                      <CommandItem key={apt.name} value={`apartment community ${apt.name}`.toLowerCase()} onSelect={() => { setSearchOpen(false); navigate({ to: "/apartments/communities" }); }}>
                        <div className="flex flex-col"><span className="font-bold">{apt.name}</span><span className="text-[11px] text-muted-foreground">{apt.units || 0} units · MRR: AED {apt.mrr || 0} · Occupancy: {apt.occupancy || 0}%</span></div>
                      </CommandItem>
                    ))}
                  </CommandGroup>];
                case "tickets":
                  return [sep, <CommandGroup key="tickets" heading="Tickets">
                    {tickets.map((t) => (
                      <CommandItem key={t.id} value={`ticket ${t.id} ${t.subject} ${t.customer} ${t.status || ""} ${t.assigned || ""}`.toLowerCase()} onSelect={() => { setSearchOpen(false); navigate({ to: "/customers/tickets" }); }}>
                        <div className="flex flex-col"><span className="font-bold">{t.subject}</span><span className="text-[11px] text-muted-foreground">{t.id} · {t.customer} · Status: {t.status} · Assigned: {t.assigned}</span></div>
                      </CommandItem>
                    ))}
                  </CommandGroup>];
                case "complaints":
                  return [sep, <CommandGroup key="complaints" heading="Complaints">
                    {complaints.map((c) => (
                      <CommandItem key={c.id} value={`complaint ${c.id} ${c.subject} ${c.customer} ${c.status || ""}`.toLowerCase()} onSelect={() => { setSearchOpen(false); navigate({ to: "/customers/complaints" }); }}>
                        <div className="flex flex-col"><span className="font-bold">{c.subject}</span><span className="text-[11px] text-muted-foreground">{c.id} · {c.customer} · Status: {c.status}</span></div>
                      </CommandItem>
                    ))}
                  </CommandGroup>];
                case "workorders":
                  return [sep, <CommandGroup key="workorders" heading="Work Orders">
                    {workOrders.map((w) => (
                      <CommandItem key={w.id} value={`work order ${w.id} ${w.plate || ""} ${w.community || ""} ${w.plan || ""} ${w.tech || ""} ${w.status || ""}`.toLowerCase()} onSelect={() => { setSearchOpen(false); navigate({ to: "/operations/dispatch" }); }}>
                        <div className="flex flex-col"><span className="font-bold">{w.id}</span><span className="text-[11px] text-muted-foreground">Plate: {w.plate || "—"} · {w.community || "—"} · Tech: {w.tech || "Unassigned"} · {w.status}</span></div>
                      </CommandItem>
                    ))}
                  </CommandGroup>];
                case "vehicles":
                  return [sep, <CommandGroup key="vehicles" heading="Vehicles">
                    {vehicles.map((v, i) => { const custName = typeof v.customer === "object" && v.customer ? (v.customer.name || "") : (v.customer || ""); return (
                      <CommandItem key={`${v.plate}-${i}`} value={`vehicle car ${v.plate} ${v.make || ""} ${v.color || ""} ${custName} ${v.community || ""}`.toLowerCase()} onSelect={() => { setSearchOpen(false); navigate({ to: "/apartments/vehicles" }); }}>
                        <div className="flex flex-col"><span className="font-bold">{v.plate} ({v.make})</span><span className="text-[11px] text-muted-foreground">Color: {v.color} · Customer: {custName} · Community: {v.community || "—"}</span></div>
                      </CommandItem>
                    ); })}
                  </CommandGroup>];
                case "products":
                  return [sep, <CommandGroup key="products" heading="Products">
                    {ecommerceProducts.map((p) => (
                      <CommandItem key={p.sku} value={`product ecommerce ${p.sku} ${p.name} ${p.category || ""} ${p.status || ""}`.toLowerCase()} onSelect={() => { setSearchOpen(false); navigate({ to: "/ecommerce/products" }); }}>
                        <div className="flex flex-col"><span className="font-bold">{p.name}</span><span className="text-[11px] text-muted-foreground">SKU: {p.sku} · Category: {p.category || "—"} · Price: AED {p.price} · Stock: {p.stock}</span></div>
                      </CommandItem>
                    ))}
                  </CommandGroup>];
                case "eorders":
                  return [sep, <CommandGroup key="eorders" heading="Ecommerce Orders">
                    {ecommerceOrders.map((o) => (
                      <CommandItem key={o.id} value={`order ecommerce ${o.id} ${o.customer} ${o.status || ""} ${o.channel || ""}`.toLowerCase()} onSelect={() => { setSearchOpen(false); navigate({ to: "/ecommerce/orders" }); }}>
                        <div className="flex flex-col"><span className="font-bold">Order {o.id}</span><span className="text-[11px] text-muted-foreground">Customer: {o.customer} · Total: AED {o.total} · Status: {o.status}</span></div>
                      </CommandItem>
                    ))}
                  </CommandGroup>];
                default:
                  return null;
              }
            };

            return groups.map((g, idx) => renderGroup(g.key, idx === 0));
          })()}
        </CommandList>
      </CommandDialog>
    </header>
  );
}
