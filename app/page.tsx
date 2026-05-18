import Link from 'next/link';
import Nav from '@/components/Nav';
import Card from '@/components/Card';
import { Bot, FileText, Languages, Send } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-ink">
      <Nav />
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-6 py-14 md:grid-cols-2">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm text-violet-200">AI invoices for small businesses</div>
          <h1 className="text-5xl font-black leading-tight md:text-6xl">Create invoices by typing like a normal person.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">Perfect for tradies, cleaners, mobile mechanics, lawn care, party hire and small service businesses.</p>
          <div className="mt-8 flex gap-4">
            <Link href="/ai" className="rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 px-6 py-4 font-bold">Try AI Invoice</Link>
            <Link href="/pricing" className="rounded-2xl border border-line px-6 py-4 font-bold">Pricing</Link>
          </div>
        </div>
        <div className="glow rounded-[2rem] border border-line bg-card p-5">
          <div className="rounded-[1.5rem] bg-card2 p-5">
            <div className="mb-5 flex items-center justify-between">
              <span className="font-bold">Invoice Draft</span>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-300">AI Ready</span>
            </div>
            <div className="space-y-3 text-slate-300">
              <p>Customer: Ahmed</p><p>Service: Garden cleaning, 3 hours</p><p>Amount: $180 AUD</p><p>Due: Next Friday</p>
            </div>
            <button className="mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 py-4 font-black">Generate PDF</button>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-5 px-6 pb-16 md:grid-cols-4">
        {[[Bot,'AI Invoice Writer','Turns messy notes into clean invoices.'],[Languages,'Multilingual','Arabic, English, Urdu, Hindi, Somali and more.'],[FileText,'PDF Invoices','Professional invoice previews and PDF export.'],[Send,'Payment Reminders','Generate polite overdue messages instantly.']].map(([Icon,title,body]: any) => (
          <Card key={title}><Icon className="mb-4 text-violet-300" /><h3 className="text-xl font-black">{title}</h3><p className="mt-2 text-slate-400">{body}</p></Card>
        ))}
      </section>
    </main>
  );
}
