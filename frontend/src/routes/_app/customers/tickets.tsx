import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface, SectionTitle } from "@/components/app/Surface";
import { StatusChip } from "@/components/app/StatusChip";
import { AlertTriangle, Clock, Paperclip, MessageSquare, User } from "lucide-react";
import { useTickets, useStaff, queryKeys } from "@/lib/hooks/api";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/customers/tickets")({ component: Tickets });

const PRIO: Record<string, "danger"|"warning"|"info"|"neutral"> = { urgent: "danger", high: "warning", medium: "info", low: "neutral" };
const STAT: Record<string, "danger"|"warning"|"primary"|"success"> = { escalated: "danger", open: "warning", "in-progress": "primary", resolved: "success" };

import { useState } from "react";
import { toast } from "sonner";

function Tickets() {
  const queryClient = useQueryClient();
  const { data: ticketsData = [] } = useTickets();
  const { data: staffData = [] } = useStaff();
  const [activeTab, setActiveTab] = useState("All");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const counts = {
    open: ticketsData.filter(t => t.status === "open").length,
    progress: ticketsData.filter(t => t.status === "in-progress").length,
    escalated: ticketsData.filter(t => t.status === "escalated").length,
    resolved: ticketsData.filter(t => t.status === "resolved").length,
  };
  const activeTicketsCount = ticketsData.filter(t => t.status !== "resolved").length;

  const filteredTickets = ticketsData.filter((t) => {
    if (activeTab === "All") return true;
    if (activeTab === "Open") return t.status === "open";
    if (activeTab === "In Progress") return t.status === "in-progress";
    if (activeTab === "Escalated") return t.status === "escalated";
    if (activeTab === "Resolved") return t.status === "resolved";
    return true;
  });

  const selectedTicket = ticketsData.find(t => t.id === selectedTicketId) || filteredTickets[0] || ticketsData[0];

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      await api.updateTicket(ticketId, { status: newStatus });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets });
      toast.success(`Status updated to ${newStatus}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    }
  };

  const handleUpdatePriority = async (ticketId: string, newPriority: string) => {
    try {
      await api.updateTicket(ticketId, { priority: newPriority });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets });
      toast.success(`Priority updated to ${newPriority}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update priority");
    }
  };

  const handleUpdateAssignee = async (ticketId: string, newAssignee: string) => {
    try {
      await api.updateTicket(ticketId, { assigned: newAssignee });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets });
      toast.success(`Assignee updated to ${newAssignee}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update assignee");
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    try {
      const existingReplies = selectedTicket.replies || [];
      const newReply = {
        sender: "Support Agent",
        text: replyText.trim(),
        timestamp: new Date().toISOString()
      };
      await api.updateTicket(selectedTicket.id, {
        replies: [...existingReplies, newReply]
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets });
      toast.success("Reply saved and sent to customer", { description: `Ticket: ${selectedTicket.id}` });
      setReplyText("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit reply");
    }
  };

  return (
    <>
      <TopBar title="Ticketing Center" subtitle={`Support queue · SLA monitoring · ${activeTicketsCount} active tickets`} />
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { label: "Open", count: counts.open, tone: "warning" as const },
            { label: "In Progress", count: counts.progress, tone: "primary" as const },
            { label: "Escalated", count: counts.escalated, tone: "danger" as const },
            { label: "Resolved · 7d", count: counts.resolved, tone: "success" as const },
          ].map((s) => (
            <Surface key={s.label} className="!py-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</span>
                <StatusChip tone={s.tone}>{s.tone === "danger" ? "Action" : "Live"}</StatusChip>
              </div>
              <div className="mt-2 text-[26px] font-black tracking-tight">{s.count}</div>
            </Surface>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Surface padded={false} className="xl:col-span-2 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-muted p-0.5 text-[11.5px] font-bold">
                {["All","Open","In Progress","Escalated","Resolved"].map((t) => (
                  <button 
                    key={t} 
                    onClick={() => {
                      setActiveTab(t);
                      setSelectedTicketId(null);
                    }}
                    className={`px-2.5 py-1 rounded-md ${activeTab === t ? "bg-surface text-foreground shadow-card" : "text-muted-foreground hover:bg-accent"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <span className="text-[11.5px] text-muted-foreground">Avg first response · 14m</span>
            </div>
            <table className="w-full text-[12.5px]">
              <thead className="bg-surface-muted/40 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-2.5 text-left">Ticket</th><th className="px-4 py-2.5 text-left">Priority</th><th className="px-4 py-2.5 text-left">Status</th><th className="px-4 py-2.5 text-left">SLA</th><th className="px-4 py-2.5 text-left">Assigned</th></tr>
              </thead>
              <tbody>
                {filteredTickets.map((t) => (
                  <tr 
                    key={t.id} 
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`border-t border-border hover:bg-surface-muted/40 cursor-pointer ${selectedTicket?.id === t.id ? "bg-surface-muted" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-foreground">{t.subject}</div>
                      <div className="text-[11px] text-muted-foreground">{t.id} · {t.customer} · {t.created}</div>
                    </td>
                    <td className="px-4 py-3"><StatusChip tone={PRIO[t.priority || "low"]}>{t.priority}</StatusChip></td>
                    <td className="px-4 py-3"><StatusChip tone={STAT[t.status || "open"]}>{t.status}</StatusChip></td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1 text-[11.5px] font-bold ${t.sla === "Breached" ? "text-destructive" : "text-foreground"}`}>
                        <Clock className="h-3 w-3" /> {t.sla}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.assigned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Surface>

          <Surface>
            {selectedTicket ? (
              <>
                <SectionTitle title={selectedTicket.id} sub={selectedTicket.subject} />
                <div className="space-y-4 text-[12.5px] mt-4">
                  <div className="flex items-center gap-2">
                    <StatusChip tone={STAT[selectedTicket.status || "open"]}>{selectedTicket.status}</StatusChip>
                    <StatusChip tone={PRIO[selectedTicket.priority || "low"]}>{selectedTicket.priority}</StatusChip>
                    {selectedTicket.sla === "Breached" && <span className="text-[11px] text-destructive font-bold">SLA breached</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-b border-border py-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                      <Select value={selectedTicket.status || "open"} onValueChange={(val) => handleUpdateStatus(selectedTicket.id, val)}>
                        <SelectTrigger className="h-8 text-[12px] font-semibold rounded-xl bg-surface border border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="escalated">Escalated</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Priority</label>
                      <Select value={selectedTicket.priority || "low"} onValueChange={(val) => handleUpdatePriority(selectedTicket.id, val)}>
                        <SelectTrigger className="h-8 text-[12px] font-semibold rounded-xl bg-surface border border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assigned Handler</label>
                    <Select value={selectedTicket.assigned || "Unassigned"} onValueChange={(val) => handleUpdateAssignee(selectedTicket.id, val === "Unassigned" ? "" : val)}>
                      <SelectTrigger className="h-8 text-[12px] font-semibold rounded-xl bg-surface border border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Unassigned">Unassigned</SelectItem>
                        {staffData.map((s) => (
                          <SelectItem key={s.id ?? s.name} value={s.name}>
                            {s.name}{s.role ? ` · ${s.role}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-xl border border-border bg-surface-muted/40 p-3">
                    <div className="flex items-center gap-2 text-[11.5px] font-bold"><User className="h-3.5 w-3.5 text-muted-foreground" /> {selectedTicket.customer}</div>
                    <p className="mt-2 text-foreground/80 leading-relaxed">
                      {selectedTicket.description || `${selectedTicket.subject} — detailed description request from customer queue log.`}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground"><Paperclip className="h-3 w-3" /> 2 attachments · photo evidence</div>
                  </div>

                  {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                    <div className="space-y-2 border-t border-border pt-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Conversation Log</div>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {selectedTicket.replies.map((reply, index) => (
                          <div key={index} className={`p-2.5 rounded-xl border ${reply.sender === "Support Agent" ? "bg-primary/5 border-primary/20" : "bg-surface-muted/30 border-border"}`}>
                            <div className="flex items-center justify-between text-[10.5px] font-bold text-muted-foreground">
                              <span>{reply.sender}</span>
                              <span>{reply.timestamp ? new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                            </div>
                            <p className="mt-1 text-foreground/95 text-[12px] leading-relaxed">{reply.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleReplySubmit} className="flex gap-2 pt-1 border-t border-border pt-3">
                    <input 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Reply to customer…" 
                      className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-[12.5px] outline-none focus:border-primary" 
                    />
                    <button type="submit" className="rounded-xl bg-primary px-3 text-[12px] font-bold text-primary-foreground hover:bg-primary/90"><MessageSquare className="h-3.5 w-3.5" /></button>
                  </form>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">Select a ticket from the list to view its details.</div>
            )}
          </Surface>
        </div>
      </div>
    </>
  );
}
