export default function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-line bg-card p-6 shadow-2xl ${className}`}>{children}</div>;
}
