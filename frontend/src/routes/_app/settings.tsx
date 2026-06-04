import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface, SectionTitle } from "@/components/app/Surface";
import { Building2, CreditCard, Bell, ShieldCheck, Palette, Plug, Globe } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({ component: Page });

const SECTIONS = [
  { icon: Building2, label: "Workspace", desc: "Brand name, address, TRN, fiscal calendar" },
  { icon: Palette, label: "Branding", desc: "Logo, colors, email signatures" },
  { icon: CreditCard, label: "Billing", desc: "Plan, payment method, invoices" },
  { icon: ShieldCheck, label: "Security", desc: "SSO, 2FA, IP allowlists, session timeout" },
  { icon: Bell, label: "Notifications", desc: "System alerts, digests, Slack integration" },
  { icon: Plug, label: "Integrations", desc: "Network Intl, Stripe, Slack, WhatsApp Cloud" },
  { icon: Globe, label: "Localization", desc: "AED · GMT+4 · English / Arabic" },
];

function Page() {
  return (
    <>
      <TopBar title="Settings" subtitle="Workspace · branding · integrations · security" />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <Surface>
          <SectionTitle title="Workspace · Progloss Dubai HQ" sub="TRN 100437289100003 · Business Bay, Dubai" />
          <div className="grid gap-4 md:grid-cols-3">
            <div><div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Legal name</div><div className="rounded-xl border border-border bg-surface-muted px-3 py-2 text-[13px] font-bold">Progloss Eco Detail LLC</div></div>
            <div><div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Trade licence</div><div className="rounded-xl border border-border bg-surface-muted px-3 py-2 text-[13px] font-bold font-mono">DED-1284921</div></div>
            <div><div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Fiscal year</div><div className="rounded-xl border border-border bg-surface-muted px-3 py-2 text-[13px] font-bold">Jan – Dec</div></div>
            <div><div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Currency</div><div className="rounded-xl border border-border bg-surface-muted px-3 py-2 text-[13px] font-bold">AED (د.إ)</div></div>
            <div><div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Timezone</div><div className="rounded-xl border border-border bg-surface-muted px-3 py-2 text-[13px] font-bold">Asia/Dubai (GMT+4)</div></div>
            <div><div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground mb-1">VAT rate</div><div className="rounded-xl border border-border bg-surface-muted px-3 py-2 text-[13px] font-bold">5% standard</div></div>
          </div>
        </Surface>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {SECTIONS.map(s => (
            <button key={s.label} className="group flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-left shadow-card hover:border-primary/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><s.icon className="h-4 w-4"/></div>
              <div className="min-w-0"><div className="text-[13px] font-black">{s.label}</div><div className="mt-0.5 text-[11.5px] text-muted-foreground">{s.desc}</div></div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
