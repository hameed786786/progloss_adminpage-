import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Mail, MessageSquare, Send } from "lucide-react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TopBar } from "@/components/app/TopBar";
import { Surface, SectionTitle } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { AsyncState } from "@/components/app/AsyncState";
import { useNotificationTemplates } from "@/lib/hooks/api";

export const Route = createFileRoute("/_app/notifications/")({ component: Page });

const axis = { fontSize: 11, fill: "oklch(0.52 0.02 256)" };
const tooltipStyle = { background: "white", border: "1px solid oklch(0.92 0.008 250)", borderRadius: 12, fontSize: 12 };
const pieColors = ["oklch(0.48 0.16 258)", "oklch(0.55 0.14 155)", "oklch(0.74 0.15 75)"];

function Page() {
  const { data: templates = [], isLoading, error } = useNotificationTemplates();

  const grouped = {
    push: templates.filter((template) => template.type === "push"),
    email: templates.filter((template) => template.type === "email"),
    sms: templates.filter((template) => template.type === "sms"),
  };

  const totals = {
    templates: templates.length,
    sent24h: templates.reduce((sum, template) => sum + (template.sent24h || template.sent || 0), 0),
    active: templates.filter((template) => template.status === "active").length,
    delivered: Math.round(
      templates.length ? templates.reduce((sum, template) => sum + (template.delivered || 100), 0) / templates.length : 100,
    ),
  };

  const chartData = useMemo(
    () => [
      { name: "Push", templates: grouped.push.length, sent: grouped.push.reduce((sum, template) => sum + (template.sent24h || template.sent || 0), 0) },
      { name: "Email", templates: grouped.email.length, sent: grouped.email.reduce((sum, template) => sum + (template.sent || 0), 0) },
      { name: "SMS", templates: grouped.sms.length, sent: grouped.sms.reduce((sum, template) => sum + (template.sent24h || template.sent || 0), 0) },
    ],
    [grouped.email, grouped.push, grouped.sms],
  );

  const statusData = useMemo(
    () => [
      { name: "Active", value: templates.filter((template) => template.status === "active").length },
      { name: "Draft", value: templates.filter((template) => template.status !== "active").length },
    ],
    [templates],
  );

  const sections = [
    {
      title: "Push",
      subtitle: "In-app and mobile alerts",
      icon: Bell,
      count: grouped.push.length,
      sent: grouped.push.reduce((sum, template) => sum + (template.sent24h || template.sent || 0), 0),
      to: "/notifications/push",
      tone: "primary" as const,
    },
    {
      title: "Email",
      subtitle: "Transactional and digest templates",
      icon: Mail,
      count: grouped.email.length,
      sent: grouped.email.reduce((sum, template) => sum + (template.sent || 0), 0),
      to: "/notifications/email",
      tone: "success" as const,
    },
    {
      title: "SMS",
      subtitle: "Critical delivery and reminders",
      icon: MessageSquare,
      count: grouped.sms.length,
      sent: grouped.sms.reduce((sum, template) => sum + (template.sent24h || template.sent || 0), 0),
      to: "/notifications/sms",
      tone: "warning" as const,
    },
  ];

  return (
    <>
      <TopBar
        title="Notifications"
        subtitle={`${totals.templates} templates · ${totals.sent24h.toLocaleString()} sent (24h) · ${totals.active} active`}
      />

      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Templates" value={String(totals.templates)} icon={Send} accent="primary" />
          <KpiCard label="Sent (24h)" value={totals.sent24h.toLocaleString()} icon={Send} accent="primary" />
          <KpiCard label="Active" value={String(totals.active)} icon={Bell} accent="success" />
          <KpiCard label="Avg delivered" value={`${totals.delivered}%`} icon={Bell} accent="success" />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Surface>
            <SectionTitle title="Channel volume" sub="Templates and sent activity by section" />
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
                <XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="templates" fill="oklch(0.55 0.14 155)" radius={[6, 6, 0, 0]} maxBarSize={24} />
                <Bar dataKey="sent" fill="oklch(0.48 0.16 258)" radius={[6, 6, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </Surface>

          <Surface>
            <SectionTitle title="Template status" sub="Active vs draft distribution" />
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-3 text-[12px]">
              {statusData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                  <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: pieColors[index % pieColors.length] }} />{entry.name}</div>
                  <span className="tabular-nums font-bold">{entry.value}</span>
                </div>
              ))}
            </div>
          </Surface>
        </div>

        <AsyncState isLoading={isLoading} error={error} isEmpty={templates.length === 0}>
          <div className="grid gap-4 xl:grid-cols-3">
            {sections.map((section) => (
              <Surface key={section.title} className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <SectionTitle title={section.title} sub={section.subtitle} />
                  </div>
                  <StatusChip tone={section.tone}>{section.count} templates</StatusChip>
                </div>

                <div className="rounded-2xl border border-border bg-surface-muted/50 p-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Sent</div>
                  <div className="mt-1 text-3xl font-black tabular-nums">{section.sent.toLocaleString()}</div>
                  <div className="mt-3 h-2 rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, section.count * 25)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-[12.5px] text-muted-foreground">
                  {grouped[section.title.toLowerCase() as keyof typeof grouped].slice(0, 3).map((template) => (
                    <div key={template.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 text-foreground">
                      <div className="min-w-0">
                        <div className="truncate font-bold">{template.name}</div>
                        <div className="truncate text-[11px] text-muted-foreground">{template.trigger ?? template.subject ?? template.body}</div>
                      </div>
                      <div className="shrink-0 text-right text-[11px] text-muted-foreground tabular-nums">
                        {(template.sent24h || template.sent || 0).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to={section.to}
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-[12.5px] font-bold hover:bg-accent"
                >
                  Open {section.title}
                </Link>
              </Surface>
            ))}
          </div>
        </AsyncState>
      </div>
    </>
  );
}