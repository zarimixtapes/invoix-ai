import Nav from '@/components/Nav';
import Card from '@/components/Card';
import Link from 'next/link';

const invoices = [
  { id: 'INV-00029', name: 'Apex Plumbing', price: '$250.00', status: 'Paid' },
  { id: 'INV-00030', name: 'Bright Cleaning Co', price: '$180.00', status: 'Unpaid' },
  { id: 'INV-00031', name: 'Metro Lawn Care', price: '$320.00', status: 'Viewed' },
];

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-ink">
      <Nav />
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div><h1 className="text-4xl font-black">Dashboard</h1><p className="mt-2 text-slate-400">Track invoices, payments and customers.</p></div>
          <Link href="/ai" className="rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 px-5 py-3 font-bold">+ AI Invoice</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          { [['12','Invoices'],['$1,240','Paid'],['$500','Unpaid'],['1','Overdue']].map(([value,label]) => (
            <Card key={label}><div className="text-3xl font-black text-blue-300">{value}</div><div className="mt-1 text-slate-400">{label}</div></Card>
          ))}
        </div>
        <div className="mt-8 grid gap-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="flex items-center justify-between">
              <div><h3 className="text-xl font-black">{invoice.id}</h3><p className="text-slate-400">{invoice.name}</p></div>
              <div className="text-right"><p className="text-xl font-black">{invoice.price}</p><p className="text-emerald-300">{invoice.status}</p></div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
