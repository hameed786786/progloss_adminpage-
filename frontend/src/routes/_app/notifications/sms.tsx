import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface } from "@/components/app/Surface";
import { KpiCard } from "@/components/app/KpiCard";
import { StatusChip } from "@/components/app/StatusChip";
import { MessageSquare, Plus, Phone } from "lucide-react";
import { useNotificationTemplates, queryKeys } from "@/lib/hooks/api";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FormDialog, Field, FieldGrid, PrimaryBtn, SecondaryBtn } from "@/components/app/FormDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_app/notifications/sms")({ component: Page });

function Page() {
  const queryClient = useQueryClient();
  const { data: allTemplates = [] } = useNotificationTemplates();
  const templates = allTemplates.filter(t => t.type === "sms");

  const [open, setOpen] = useState(false);

  const totalSent24h = templates.reduce((sum, t) => sum + (t.sent24h || t.sent || 0), 0);
  const avgDelivered = templates.length ? templates.reduce((sum, t) => sum + (t.delivered || 100), 0) / templates.length : 100;
  const costMtd = totalSent24h * 0.15; // Dynamic estimation based on AED 0.15 per SMS
  const optOuts = Math.round(totalSent24h * 0.005) || 6;

  return (
    <>
      <TopBar title="SMS Notifications" subtitle="UAE telco SMS · sender ID PROGLOSS" actions={
        <PrimaryBtn onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5"/> New template</PrimaryBtn>
      }/>
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Sent (24h)" value={String(totalSent24h)} icon={MessageSquare} accent="primary" />
          <KpiCard label="Delivery rate" value={`${avgDelivered.toFixed(1)}%`} icon={Phone} accent="success" />
          <KpiCard label="Cost (MTD)" value={`AED ${costMtd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} icon={MessageSquare} accent="primary" />
          <KpiCard label="Opt-outs" value={String(optOuts)} icon={MessageSquare} accent="warning" />
        </div>
        <Surface padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[640px]">
              <thead className="bg-surface-muted text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">ID</th><th className="px-4 py-3 text-left">Template</th><th className="px-4 py-3 text-left">Sender</th><th className="px-4 py-3 text-right">Sent 24h</th><th className="px-4 py-3 text-right">Delivered</th><th className="px-4 py-3 text-right">Status</th></tr>
              </thead>
              <tbody>
                {templates.map(t => (
                  <tr key={t.id} className="border-t border-border hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-mono font-bold">{t.id}</td>
                    <td className="px-4 py-3"><div className="font-bold">{t.name}</div><div className="text-[11px] text-muted-foreground">{t.body ?? t.subject}</div></td>
                    <td className="px-4 py-3 font-mono">{t.sender || "PROGLOSS"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{t.sent24h ?? t.sent}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">{t.delivered}%</td>
                    <td className="px-4 py-3 text-right"><StatusChip tone="success">{t.status}</StatusChip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      </div>

      <CreateSmsTemplateDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={async (template) => {
          try {
            await api.createNotificationTemplate(template);
            void queryClient.invalidateQueries({ queryKey: queryKeys.notificationTemplates });
            toast.success("SMS template created", { description: `${template.id} · ${template.name}` });
          } catch (e: any) {
            toast.error(e.message || "Failed to create SMS template");
          }
        }}
        exists={(id) => allTemplates.some(t => t.id === id)}
      />
    </>
  );
}

function CreateSmsTemplateDialog({
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
  const [sender, setSender] = useState("PROGLOSS");
  const [body, setBody] = useState("");
  const [trigger, setTrigger] = useState("manual");
  const [status, setStatus] = useState("active");

  const reset = () => {
    setIdSuffix("");
    setName("");
    setSender("PROGLOSS");
    setBody("");
    setTrigger("manual");
    setStatus("active");
  };

  const submit = async () => {
    const suffix = idSuffix.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    if (!suffix) return toast.error("Template ID is required");
    const fullId = `SMS-${suffix}`;
    if (exists(fullId)) return toast.error("A template with that ID already exists");
    if (!name.trim()) return toast.error("Template name is required");
    if (!body.trim()) return toast.error("SMS message body is required");

    await onCreate({
      id: fullId,
      type: "sms",
      name: name.trim(),
      sender: sender.trim() || "PROGLOSS",
      body: body.trim(),
      trigger: trigger.trim(),
      status,
      sent: 0,
      sent24h: 0,
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
      title="Create SMS Template"
      description="Create a new SMS notification template with official sender ID."
      size="lg"
      footer={
        <>
          <SecondaryBtn onClick={() => { reset(); onOpenChange(false); }}>Cancel</SecondaryBtn>
          <PrimaryBtn onClick={submit}><Plus className="h-3.5 w-3.5"/> Create template</PrimaryBtn>
        </>
      }
    >
      <FieldGrid>
        <Field label="Template ID" hint="Unique ID. E.g. WASH -> SMS-WASH">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-mono font-bold">SMS-</span>
            <Input
              value={idSuffix}
              onChange={(e) => setIdSuffix(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
              placeholder="WASH"
              className="font-mono tracking-wider"
            />
          </div>
        </Field>
        <Field label="Template Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Wash complete notification" />
        </Field>
      </FieldGrid>

      <FieldGrid cols={3}>
        <Field label="Sender ID" hint="Registered alpha sender name">
          <Input value={sender} onChange={(e) => setSender(e.target.value)} placeholder="PROGLOSS" />
        </Field>
        <Field label="Event Trigger" hint="System event">
          <Input value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="wash.completed" />
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

      <Field label="SMS Message Text">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Your {{plate}} wash is complete."
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Field>
    </FormDialog>
  );
}

