import { Card } from "@/components/ui/primitives";
import { AiInvoiceGenerator } from "@/components/AiInvoiceGenerator";
import { Sparkles } from "lucide-react";

export default function AiGeneratorPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">AI Invoice Generator</h1>
      <p className="mt-1 max-w-xl text-sm text-ink-600">
        Describe the job in plain English — hours, parts, callouts, due date — and Invoix builds the
        invoice draft for you, ready to review and save.
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <AiInvoiceGenerator />
        </Card>

        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
            <Sparkles size={16} className="text-teal-600" />
            Tips for better drafts
          </div>
          <ul className="space-y-2.5 text-sm text-ink-600">
            <li>• Name the customer clearly: "for ABC Plumbing" or "invoice Daniel Reyes".</li>
            <li>• State quantities and rates: "4 hours labour at $85 per hour".</li>
            <li>• Mention parts or materials separately: "2 replacement parts at $45 each".</li>
            <li>• Add a due date: "due in 7 days" or "due on receipt".</li>
            <li>• Mention GST explicitly if it isn't the default: "GST included" or "GST free".</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
