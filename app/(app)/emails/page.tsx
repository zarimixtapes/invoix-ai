"use client";

import { useState } from "react";
import { Mail, Copy, Trash2, Send, ExternalLink } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { EmailDraft } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Button, Card, ConfirmDialog, EmptyState, Modal, Textarea } from "@/components/ui/primitives";

const TYPE_LABELS: Record<EmailDraft["type"], string> = {
  send_invoice: "Send invoice",
  payment_reminder: "Payment reminder",
  overdue_notice: "Overdue notice",
  quote_follow_up: "Quote follow-up",
  thank_you_payment: "Thank you",
};

export default function EmailsPage() {
  const drafts = useStore((s) => s.emailDrafts);
  const deleteEmailDraft = useStore((s) => s.deleteEmailDraft);
  const markEmailSent = useStore((s) => s.markEmailSent);
  const updateEmailDraft = useStore((s) => s.updateEmailDraft);
  const push = useToastStore((s) => s.push);

  const [open, setOpen] = useState<EmailDraft | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bodyDraft, setBodyDraft] = useState("");

  const sorted = [...drafts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  function openDraft(d: EmailDraft) {
    setOpen(d);
    setBodyDraft(d.body);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard?.writeText(text).then(
      () => push("Copied to clipboard."),
      () => push("Couldn't copy automatically — select and copy manually.", "error")
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Email Drafts</h1>
      <p className="mt-1 text-sm text-ink-600">
        Drafts generated from invoices and quotes. Copy the text or open in your email client to send.
      </p>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<Mail size={28} />}
          title="No email drafts yet"
          description="Generate one from an invoice or quote — try Send invoice, Reminder, or Overdue notice."
          action={<></>}
        />
      ) : (
        <div className="mt-6 grid gap-3">
          {sorted.map((d) => (
            <Card key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-paper-200 px-2 py-0.5 text-xs font-medium text-ink-700">
                    {TYPE_LABELS[d.type]}
                  </span>
                  {d.status === "sent" && (
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
                      Sent
                    </span>
                  )}
                </div>
                <button onClick={() => openDraft(d)} className="mt-1.5 block truncate text-left text-sm font-medium text-ink-900 hover:underline">
                  {d.subject}
                </button>
                <p className="truncate text-xs text-ink-500">
                  To {d.recipientEmail || "—"} · {formatDate(d.createdAt)}
                </p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => copyToClipboard(`Subject: ${d.subject}\n\n${d.body}`)} title="Copy" className="rounded-lg p-1.5 text-ink-500 hover:bg-paper-200 hover:text-ink-900">
                  <Copy size={15} />
                </button>
                <a
                  href={`mailto:${d.recipientEmail}?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(d.body)}`}
                  title="Open in email client"
                  className="rounded-lg p-1.5 text-ink-500 hover:bg-paper-200 hover:text-ink-900"
                >
                  <ExternalLink size={15} />
                </a>
                {d.status !== "sent" && (
                  <button onClick={() => { markEmailSent(d.id); push("Marked as sent."); }} title="Mark as sent" className="rounded-lg p-1.5 text-ink-500 hover:bg-teal-50 hover:text-teal-700">
                    <Send size={15} />
                  </button>
                )}
                <button onClick={() => setDeleteId(d.id)} title="Delete" className="rounded-lg p-1.5 text-ink-500 hover:bg-coral-50 hover:text-coral-500">
                  <Trash2 size={15} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={Boolean(open)} onClose={() => setOpen(null)} title={open ? TYPE_LABELS[open.type] : ""} width="max-w-xl">
        {open && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">To</p>
            <p className="mb-3 text-sm text-ink-800">{open.recipientEmail || "—"}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Subject</p>
            <p className="mb-3 text-sm text-ink-800">{open.subject}</p>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-500">Body</p>
            <Textarea
              rows={10}
              value={bodyDraft}
              onChange={(e) => setBodyDraft(e.target.value)}
            />
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(`Subject: ${open.subject}\n\n${bodyDraft}`)}>
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  updateEmailDraft(open.id, { body: bodyDraft });
                  push("Draft updated.");
                  setOpen(null);
                }}
              >
                Save changes
              </Button>
              <a
                href={`mailto:${open.recipientEmail}?subject=${encodeURIComponent(open.subject)}&body=${encodeURIComponent(bodyDraft)}`}
              >
                <Button size="sm">Open in email client</Button>
              </a>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this email draft?"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteEmailDraft(deleteId);
            push("Draft deleted.");
          }
          setDeleteId(null);
        }}
      />
    </div>
  );
}
