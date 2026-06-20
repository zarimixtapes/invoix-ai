import Link from "next/link";
import { Check, Receipt, ArrowLeft } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free / Demo",
    price: "$0",
    cadence: "forever",
    description: "Try the whole workflow before you commit.",
    features: [
      "5 invoices per month",
      "3 AI generations per month",
      "Basic invoice template",
      "Customers & products",
    ],
    cta: "Start free",
  },
  {
    id: "starter",
    name: "Starter",
    price: "$15",
    cadence: "/month",
    description: "For businesses sending invoices every week.",
    features: [
      "Unlimited invoices",
      "Unlimited customers",
      "Quotes & quote conversion",
      "Email drafts",
      "PDF / printable export",
    ],
    cta: "Start 14-day trial",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    cadence: "/month",
    description: "For businesses that want the AI to do the writing.",
    features: [
      "Everything in Starter",
      "AI invoice generator",
      "Automated payment reminders",
      "Branding & templates",
      "Reports & analytics",
      "Multi-business support (coming soon)",
    ],
    cta: "Start 14-day trial",
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-paper-100">
      <header className="border-b border-ink-200/60 bg-paper-100/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Receipt size={17} />
            </span>
            Invoix AI
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-900">
            <ArrowLeft size={15} />
            Back home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-14 text-center sm:py-20">
        <h1 className="font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
          Simple pricing, built around real invoicing
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-ink-600">
          Every plan includes a 14-day trial of every Pro feature, so you can see exactly what
          you'd be paying for before you decide.
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-5 pb-20 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`flex flex-col rounded-xl2 border bg-white p-6 shadow-card ${
              plan.highlighted ? "border-teal-500 ring-1 ring-teal-500/30" : "border-ink-200/60"
            }`}
          >
            {plan.highlighted && (
              <span className="mb-3 inline-block w-fit rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                Most popular
              </span>
            )}
            <h2 className="font-display text-lg font-semibold text-ink-900">{plan.name}</h2>
            <p className="mt-1 text-sm text-ink-600">{plan.description}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-semibold text-ink-900">{plan.price}</span>
              <span className="text-sm text-ink-500">{plan.cadence}</span>
            </div>
            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink-700">
                  <Check size={16} className="mt-0.5 shrink-0 text-teal-600" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={`/login?plan=${plan.id}`}
              className={`mt-6 rounded-xl px-4 py-2.5 text-center text-sm font-medium ${
                plan.highlighted
                  ? "bg-teal-600 text-white hover:bg-teal-700"
                  : "border border-ink-200 text-ink-900 hover:bg-paper-50"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}
