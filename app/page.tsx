import Link from "next/link";
import {
  Receipt,
  Mic,
  FileText,
  Users,
  Clock,
  Mail,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { LandingAiDemo } from "@/components/LandingAiDemo";

const AUDIENCES = [
  "Freelancers",
  "Sole traders",
  "Tradies",
  "Cleaners",
  "Mobile services",
  "eBay & Amazon sellers",
];

const FEATURES = [
  {
    icon: Mic,
    title: "Speak or type the job",
    body: "Describe the work in plain English. Invoix turns it into a structured invoice with line items, tax, and totals.",
  },
  {
    icon: FileText,
    title: "Quotes that become invoices",
    body: "Send a quote, get it accepted, convert it to an invoice in one click — no retyping line items.",
  },
  {
    icon: Mail,
    title: "Follow-ups that write themselves",
    body: "Reminder and overdue emails are drafted for you, ready to send the moment a due date passes.",
  },
  {
    icon: Clock,
    title: "Status, automatically",
    body: "Invoices move from sent to overdue on their own when a due date passes unpaid — no manual bookkeeping.",
  },
  {
    icon: Users,
    title: "Customers & catalogue",
    body: "Save customers and your price list once, then drop them into any invoice or quote in seconds.",
  },
  {
    icon: ShieldCheck,
    title: "GST handled correctly",
    body: "Per-line tax rates, GST-inclusive or exclusive instructions, discounts and shipping — all calculated for you.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-paper-100">
      {/* Nav */}
      <header className="border-b border-ink-200/60 bg-paper-100/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Receipt size={17} />
            </span>
            Invoix AI
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink-700 sm:flex">
            <Link href="/pricing" className="hover:text-ink-900">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-ink-900">
              Log in
            </Link>
          </nav>
          <Link
            href="/login"
            className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-800"
          >
            Start free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal-700">
            Invoicing &amp; quoting, for people who'd rather be on the job
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] text-ink-900 sm:text-5xl">
            Tell it the job.
            <br />
            It writes the invoice.
          </h1>
          <p className="mt-5 max-w-md text-base text-ink-600">
            Invoix AI turns a plain-English instruction into a finished invoice — line items, GST,
            totals, and a customer email — in seconds. Built for the businesses that run on jobs,
            not spreadsheets.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {AUDIENCES.map((a) => (
              <span
                key={a}
                className="rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-medium text-ink-600"
              >
                {a}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-3 text-sm font-medium text-white shadow-card hover:bg-teal-700"
            >
              Start free — no card required
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-medium text-ink-900 hover:bg-paper-50"
            >
              See pricing
            </Link>
          </div>
        </div>

        <LandingAiDemo />
      </section>

      {/* Features */}
      <section className="border-t border-ink-200/60 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
            Everything between "job done" and "money in"
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <f.icon size={18} />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-ink-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-ink-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink-950 py-16 text-center text-white sm:py-20">
        <div className="mx-auto max-w-2xl px-5">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            Your first invoice is two sentences away.
          </h2>
          <p className="mt-3 text-sm text-white/70">
            No setup, no card, no waiting on a developer. Try the full app in demo mode right now.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex items-center gap-1.5 rounded-xl bg-teal-500 px-6 py-3 text-sm font-medium text-white hover:bg-teal-400"
          >
            Open the demo
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink-200/60 bg-paper-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-xs text-ink-500 sm:flex-row">
          <span>© {new Date().getFullYear()} Invoix AI. Built as a demo MVP.</span>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:text-ink-800">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-ink-800">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
