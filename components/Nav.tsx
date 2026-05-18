import Link from 'next/link';

export default function Nav() {
  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <Link href="/" className="text-2xl font-black">Invoix<span className="text-violet-400">AI</span></Link>
      <div className="flex gap-4 text-sm text-slate-300">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/ai">AI Invoice</Link>
        <Link href="/pricing">Pricing</Link>
      </div>
    </nav>
  );
}
