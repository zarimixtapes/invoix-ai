'use client';

import Nav from '@/components/Nav';
import Card from '@/components/Card';

export default function Pricing() {
  async function checkout() {
    const res = await fetch('/api/checkout', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert(data.error || 'Stripe is not configured yet.');
  }

  return (
    <main className="min-h-screen bg-ink">
      <Nav />
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-center text-5xl font-black">Simple fair pricing</h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-slate-400">Start free. Upgrade when AI and unlimited invoices save you time.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card><h2 className="text-2xl font-black">Free</h2><p className="mt-3 text-4xl font-black">$0</p><ul className="mt-6 space-y-3 text-slate-300"><li>✓ 5 invoices/month</li><li>✓ Basic invoice preview</li><li>✓ Customer search</li></ul></Card>
          <Card className="border-violet-500/60"><h2 className="text-2xl font-black">Pro</h2><p className="mt-3 text-4xl font-black">$4.99/mo</p><ul className="mt-6 space-y-3 text-slate-300"><li>✓ Unlimited invoices</li><li>✓ AI invoice writer</li><li>✓ Multilingual invoice help</li><li>✓ Premium templates</li><li>✓ Payment reminder writer</li></ul><button onClick={checkout} className="mt-8 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 py-4 font-black">Upgrade to Pro</button></Card>
        </div>
      </section>
    </main>
  );
}
