import {
  LayoutDashboard, Users, MessageSquareWarning, LifeBuoy, GitBranch,
  CreditCard, RefreshCcw, Ticket, Wrench, Map, Radar,
  UserCog, Clock, TrendingUp, Award,
  Building2, Banknote, Car,
  Receipt, FileText, Repeat, FileCheck2, Undo2, AlertOctagon, FileMinus, Download,
  Wallet, Network, ScrollText,
  BarChart3, ShoppingBag, Tag, Megaphone, Bell, Mail, MessageSquare,
  ShieldCheck, KeyRound, History, Settings,
} from "lucide-react";

export type NavItem = { label: string; to: string; icon: any };
export type NavGroupDef = { label: string; icon: any; items?: NavItem[]; to?: string };

export const NAV: NavGroupDef[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Customers", icon: Users, items: [
    { label: "All Customers", to: "/customers", icon: Users },
    { label: "Complaints", to: "/customers/complaints", icon: MessageSquareWarning },
    { label: "Tickets", to: "/customers/tickets", icon: LifeBuoy },
    { label: "Customer Lifecycle", to: "/customers/lifecycle", icon: GitBranch },
  ]},
  { label: "Subscriptions", icon: CreditCard, items: [
    { label: "Plans", to: "/subscriptions/plans", icon: CreditCard },
    { label: "Active Subscriptions", to: "/subscriptions/active", icon: Repeat },
    { label: "Renewals", to: "/subscriptions/renewals", icon: RefreshCcw },
    { label: "Coupons", to: "/subscriptions/coupons", icon: Ticket },
  ]},
  { label: "Operations", icon: Wrench, items: [
    { label: "Daily Operations", to: "/operations/daily", icon: Wrench },
    { label: "Dispatch Center", to: "/operations/dispatch", icon: Map },
    { label: "Staff Live Tracking", to: "/operations/tracking", icon: Radar },
  ]},
  { label: "Staff", icon: UserCog, items: [
    { label: "Staff Directory", to: "/staff/directory", icon: UserCog },
    { label: "Attendance", to: "/staff/attendance", icon: Clock },
    { label: "Productivity", to: "/staff/productivity", icon: TrendingUp },
    { label: "Performance", to: "/staff/performance", icon: Award },
  ]},
  { label: "Apartments", icon: Building2, items: [
    { label: "Communities", to: "/apartments/communities", icon: Building2 },
    { label: "Revenue", to: "/apartments/revenue", icon: Banknote },
    { label: "Vehicle Mapping", to: "/apartments/vehicles", icon: Car },
  ]},
  { label: "Billing & VAT", icon: Receipt, items: [
    { label: "Overview", to: "/billing/overview", icon: Receipt },
    { label: "Invoices", to: "/billing/invoices", icon: FileText },
    { label: "Auto Billing", to: "/billing/auto", icon: Repeat },
    { label: "VAT Reports", to: "/billing/vat", icon: FileCheck2 },
    { label: "Refunds", to: "/billing/refunds", icon: Undo2 },
    { label: "Failed Payments", to: "/billing/failed", icon: AlertOctagon },
    { label: "Credit Notes", to: "/billing/credit", icon: FileMinus },
    { label: "Exports", to: "/billing/exports", icon: Download },
  ]},
  { label: "Payments", icon: Wallet, items: [
    { label: "Transactions", to: "/payments/transactions", icon: Wallet },
    { label: "AutoPay", to: "/payments/autopay", icon: Repeat },
    { label: "Gateway Logs", to: "/payments/gateway", icon: Network },
  ]},
  { label: "Analytics", icon: BarChart3, to: "/analytics" },
  { label: "Ecommerce", icon: ShoppingBag, items: [
    { label: "Products", to: "/ecommerce/products", icon: ShoppingBag },
    { label: "Orders", to: "/ecommerce/orders", icon: ScrollText },
    { label: "Coupons", to: "/ecommerce/coupons", icon: Tag },
    { label: "Promotions", to: "/ecommerce/promotions", icon: Megaphone },
  ]},
  { label: "Notifications", icon: Bell, items: [
    { label: "Push", to: "/notifications/push", icon: Bell },
    { label: "Email", to: "/notifications/email", icon: Mail },
    { label: "SMS", to: "/notifications/sms", icon: MessageSquare },
  ]},
  { label: "RBAC", icon: ShieldCheck, items: [
    { label: "Roles", to: "/rbac/roles", icon: ShieldCheck },
    { label: "Permissions", to: "/rbac/permissions", icon: KeyRound },
  ]},
  { label: "Audit Logs", icon: History, to: "/audit" },
  { label: "Settings", icon: Settings, to: "/settings" },
];
