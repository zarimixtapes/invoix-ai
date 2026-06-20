"use client";

import { useState } from "react";
import { CheckCircle2, CreditCard, Info } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { formatCurrency, formatDate } from "@/lib/format";
import { SubscriptionPlan } from "@/lib/types";
import { Button, Card } from "@/components/ui/primitives";

const PLAN_DETAILS: Record<SubscriptionPlan, { name: string; price: string; features: string[] }> = {
  free: {
    name: "Free / Demo",
    price: "$0/mo",
    features: ["5 invoices/month", "3 AI generations/month", "Basic template"],
  },
  starter: {
    name: "Starter",
    price: "$15/mo",
    features: ["Unlimited invoices", "Quotes & email drafts", "PDF export"],
  },
  pro: {
    name: "Pro",
    price: "$29/mo",
    features: ["AI invoice generator", "Payment reminders", "Branding & analytics"],
  },
};

export default function BillingPage() {
  const subscription = useStore((s) => s.subscription);
  const setSubscription = useStore((s) => s.setSubscription);
  const setPlan = useStore((s) => s.setPlan);
  const payments = useStore((s) => s.payments);
  const invoices = useStore((s) => s.invoices);
  const push = useToastStore((s) => s.push);
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);

  async function handleUpgrade(plan: "starter" | "pro") {
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();

      if (data.mode === "live" && data.url) {
        window.location.href = data.url;
        return;
      }

      // Demo billing mode: simulate the upgrade locally so the button always works.
      setSubscription({ plan, state: "trialing" });
      push(data.message || `Demo billing mode: started a trial of the ${plan} plan.`, "info");
    } catch {
      push("Couldn't reach billing — please try again.", "error");
    } finally {
      setLoadingPlan(null);
    }
  }

  function handleDowngrade() {
    setPlan("free");
    setSubscription({ state: "active" });
    push("Switched to the Free plan.");
  }

  const enrichedPayments = payments
    .map((p) => ({ ...p, invoice: invoices.find((i) => i.id === p.invoiceId) }))
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Billing &amp; Payments</h1>

      <Card className="mt-5 flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <CreditCard size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">
              Current plan: {PLAN_DETAILS[subscription.plan].name}
            </p>
            <p className="text-xs text-ink-500 capitalize">
              {subscription.state === "trialing" && subscription.trialEndsAt
                ? `Trial active — Pro features unlocked until ${formatDate(subscription.trialEndsAt)}`
                : `Status: ${subscription.state}`}
            </p>
          </div>
        </div>
        {subscription.plan !== "free" && (
          <Button variant="outline" size="sm" onClick={handleDowngrade}>
            Switch to Free
          </Button>
        )}
      </Card>

      <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
        <Info size={14} className="mt-0.5 shrink-0" />
        Stripe isn't connected in this environment, so upgrades run in demo billing mode — your plan
        updates instantly here without a real charge. Add STRIPE_SECRET_KEY to enable real checkout.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        {(Object.keys(PLAN_DETAILS) as SubscriptionPlan[]).map((plan) => (
          <Card key={plan} className={`p-5 ${subscription.plan === plan ? "ring-2 ring-teal-500/40" : ""}`}>
            <p className="text-sm font-semibold text-ink-900">{PLAN_DETAILS[plan].name}</p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">{PLAN_DETAILS[plan].price}</p>
            <ul className="mt-3 space-y-1.5">
              {PLAN_DETAILS[plan].features.map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-ink-600">
                  <CheckCircle2 size={13} className="text-teal-600" /> {f}
                </li>
              ))}
            </ul>
            {plan !== "free" && subscription.plan !== plan && (
              <Button
                size="sm"
                className="mt-4 w-full"
                onClick={() => handleUpgrade(plan as "starter" | "pro")}
                disabled={loadingPlan === plan}
              >
                {loadingPlan === plan ? "Redirecting…" : `Upgrade to ${PLAN_DETAILS[plan].name}`}
              </Button>
            )}
            {subscription.plan === plan && (
              <span className="mt-4 block text-center text-xs font-medium text-teal-700">Current plan</span>
            )}
          </Card>
        ))}
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-ink-900">Payment history</h2>
        </div>
        {enrichedPayments.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-ink-500">No payments recorded yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-y border-ink-200/60 text-xs uppercase tracking-wide text-ink-500">
                <th className="px-5 py-2.5 font-medium">Date</th>
                <th className="px-5 py-2.5 font-medium">Invoice</th>
                <th className="px-5 py-2.5 font-medium">Method</th>
                <th className="px-5 py-2.5 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {enrichedPayments.map((p) => (
                <tr key={p.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-5 py-2.5 text-ink-600">{formatDate(p.receivedAt)}</td>
                  <td className="px-5 py-2.5 text-ink-900">{p.invoice?.number || "—"}</td>
                  <td className="px-5 py-2.5 text-ink-600">{p.method}</td>
                  <td className="px-5 py-2.5 text-right font-medium text-ink-900">{formatCurrency(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
