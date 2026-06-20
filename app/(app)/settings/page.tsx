"use client";

import { useState } from "react";
import { Download, RotateCcw, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { Button, Card, ConfirmDialog, Field, Input } from "@/components/ui/primitives";

export default function SettingsPage() {
  const business = useStore((s) => s.business);
  const updateBusiness = useStore((s) => s.updateBusiness);
  const resetToDemoData = useStore((s) => s.resetToDemoData);
  const clearAllData = useStore((s) => s.clearAllData);
  const fullState = useStore((s) => s);
  const push = useToastStore((s) => s.push);

  const [showReset, setShowReset] = useState(false);
  const [showClear, setShowClear] = useState(false);

  function handleExport() {
    const { customers, products, invoices, quotes, emailDrafts, payments, subscription, business } = fullState;
    const data = { exportedAt: new Date().toISOString(), business, customers, products, invoices, quotes, emailDrafts, payments, subscription };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoix-ai-data-export.json";
    a.click();
    URL.revokeObjectURL(url);
    push("Data exported.");
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Settings</h1>

      <Card className="mt-5 p-5">
        <h2 className="text-sm font-semibold text-ink-900">Invoice &amp; quote numbering</h2>
        <p className="mt-1 text-xs text-ink-500">
          Numbers auto-increment on every new invoice or quote. Adjust the next number if you need to
          match an existing sequence.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <Field label="Invoice prefix">
            <Input value={business.invoicePrefix} onChange={(e) => updateBusiness({ invoicePrefix: e.target.value.toUpperCase() })} />
          </Field>
          <Field label="Next invoice number">
            <Input
              type="number"
              value={business.nextInvoiceNumber}
              onChange={(e) => updateBusiness({ nextInvoiceNumber: parseInt(e.target.value, 10) || 1 })}
            />
          </Field>
          <Field label="Next quote number">
            <Input
              type="number"
              value={business.nextQuoteNumber}
              onChange={(e) => updateBusiness({ nextQuoteNumber: parseInt(e.target.value, 10) || 1 })}
            />
          </Field>
        </div>
      </Card>

      <Card className="mt-5 p-5">
        <h2 className="text-sm font-semibold text-ink-900">Your data</h2>
        <p className="mt-1 text-xs text-ink-500">
          Everything in this demo is stored locally in your browser (localStorage) — nothing is sent to
          a server unless you connect Supabase.
        </p>
        <Button variant="outline" size="sm" className="mt-3" icon={<Download size={14} />} onClick={handleExport}>
          Export data as JSON
        </Button>
      </Card>

      <Card className="mt-5 border-coral-200 p-5">
        <h2 className="text-sm font-semibold text-coral-600">Danger zone</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Button variant="outline" size="sm" icon={<RotateCcw size={14} />} onClick={() => setShowReset(true)}>
            Reset to demo data
          </Button>
          <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => setShowClear(true)}>
            Clear all data
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={showReset}
        title="Reset to demo data?"
        description="This replaces everything with the original sample customers, products, and invoices."
        confirmLabel="Reset"
        tone="primary"
        onCancel={() => setShowReset(false)}
        onConfirm={() => {
          resetToDemoData();
          push("Reset to demo data.");
          setShowReset(false);
        }}
      />
      <ConfirmDialog
        open={showClear}
        title="Clear all data?"
        description="This permanently deletes every customer, invoice, quote, and email draft in this browser. This can't be undone."
        confirmLabel="Clear everything"
        onCancel={() => setShowClear(false)}
        onConfirm={() => {
          clearAllData();
          push("All data cleared.");
          setShowClear(false);
        }}
      />
    </div>
  );
}
