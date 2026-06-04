import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { Mail, Plus } from "lucide-react";
import { useNotificationTemplates, queryKeys } from "@/lib/hooks/api";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FormDialog, Field, FieldGrid, PrimaryBtn, SecondaryBtn } from "@/components/app/FormDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_app/notifications/email")({ component: Page });

function Page() {
  const queryClient = useQueryClient();
  const { data: allTemplates = [] } = useNotificationTemplates();
  const templates = allTemplates.filter(t => t.type === "email");

  const [open, setOpen] = useState(false);

  const totalSent = templates.reduce((sum, t) => sum + (t.sent || 0), 0);
  const avgOpen = templates.length ? templates.reduce((sum, t) => sum + (t.open || 0), 0) / templates.length : 0;
  const avgClick = templates.length ? templates.reduce((sum, t) => sum + (t.click || 0), 0) / templates.length : 0;
  const avgDelivered = templates.length ? templates.reduce((sum, t) => sum + (t.delivered || 100), 0) / templates.length : 100;
  const avgBounce = Math.max(0, 100 - avgDelivered);

  return (
    <>
      <TopBar title="Email Templates" subtitle="Transactional & marketing email library" actions={
        <PrimaryBtn onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5"/> New template</PrimaryBtn>
      }/>
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Sent (30d)" value={totalSent.toLocaleString()} icon={Mail} accent="primary" />
          <KpiCard label="Open rate" value={`${avgOpen.toFixed(1)}%`} icon={Mail} accent="success" />
          <KpiCard label="Click rate" value={`${avgClick.toFixed(1)}%`} icon={Mail} accent="success" />
          <KpiCard label="Bounce rate" value={`${avgBounce.toFixed(1)}%`} icon={Mail} accent="success" />
        </div>
        <Surface padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[720px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">ID</th><th className="px-4 py-3 text-left">Template</th><th className="px-4 py-3 text-left">Trigger</th><th className="px-4 py-3 text-right">Sent</th><th className="px-4 py-3 text-right">Open</th><th className="px-4 py-3 text-right">Click</th><th className="px-4 py-3 text-right">Status</th></tr>
              </thead>
              <tbody>
                {templates.map(t => (
                  <tr key={t.id} className="border-t border-border hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-mono font-bold">{t.id}</td>
                    <td className="px-4 py-3"><div className="font-bold">{t.name}</div><div className="text-[10.5px] text-muted-foreground">{t.subject}</div></td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{t.trigger}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{t.sent}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">{t.open}%</td>
                    <td className="px-4 py-3 text-right tabular-nums">{t.click}%</td>
                    <td className="px-4 py-3 text-right"><StatusChip tone={t.status==="active"?"success":"neutral"}>{t.status}</StatusChip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      </div>

      <CreateEmailTemplateDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={async (template) => {
          try {
            await api.createNotificationTemplate(template);
            void queryClient.invalidateQueries({ queryKey: queryKeys.notificationTemplates });
            toast.success("Email template created", { description: `${template.id} · ${template.name}` });
          } catch (e: any) {
            toast.error(e.message || "Failed to create email template");
          }
        }}
        exists={(id) => allTemplates.some(t => t.id === id)}
      />
    </>
  );
}

function CreateEmailTemplateDialog({
  open,
  onOpenChange,
  onCreate,
  exists,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (template: any) => Promise<void>;
  exists: (id: string) => boolean;
}) {
  const [idSuffix, setIdSuffix] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [trigger, setTrigger] = useState("manual");
  const [status, setStatus] = useState("active");

  const reset = () => {
    setIdSuffix("");
    setName("");
    setSubject("");
    setBody("");
    setTrigger("manual");
    setStatus("active");
  };

  const submit = async () => {
    const suffix = idSuffix.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    if (!suffix) return toast.error("Template ID is required");
    const fullId = `EML-${suffix}`;
    if (exists(fullId)) return toast.error("A template with that ID already exists");
    if (!name.trim()) return toast.error("Template name is required");
    if (!subject.trim()) return toast.error("Subject is required");

    await onCreate({
      id: fullId,
      type: "email",
      name: name.trim(),
      subject: subject.trim(),
      body: body.trim(),
      trigger: trigger.trim(),
      status,
      sent: 0,
      open: 0,
      click: 0,
      delivered: 100,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
      title="Create Email Template"
      description="Create a new email template for transactional or marketing campaigns."
      size="lg"
      footer={
        <>
          <SecondaryBtn onClick={() => { reset(); onOpenChange(false); }}>Cancel</SecondaryBtn>
          <PrimaryBtn onClick={submit}><Plus className="h-3.5 w-3.5"/> Create template</PrimaryBtn>
        </>
      }
    >
      <FieldGrid>
        <Field label="Template ID" hint="Unique ID. E.g. WELCOME -> EML-WELCOME">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-mono font-bold">EML-</span>
            <Input
              value={idSuffix}
              onChange={(e) => setIdSuffix(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
              placeholder="WELCOME"
              className="font-mono tracking-wider"
            />
          </div>
        </Field>
        <Field label="Template Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Welcome onboarding" />
        </Field>
      </FieldGrid>

      <FieldGrid>
        <Field label="Event Trigger" hint="System event that fires this notification.">
          <Input value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="customer.created" />
        </Field>
        <Field label="Status">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FieldGrid>

      <Field label="Subject Line">
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Welcome to Progloss, {{name}}" />
      </Field>

      <Field label="Email Body (HTML/Text)">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Dear {{name}},\n\nWelcome to Progloss!"
          className="w-full min-h-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Field>
    </FormDialog>
  );
}

