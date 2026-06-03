import Link from 'next/link';

type Plan = {
  name: string;
  price: string;
  description: string;
  features: string[];
};

const plans: Plan[] = [
  {
    name: 'Solo',
    price: '49',
    description: 'For one supervisor validating the workflow',
    features: ['Voice-to-diary', 'Delay and variation drafts', 'PDF/report exports', 'Basic project memory']
  },
  {
    name: 'Company',
    price: '199',
    description: 'For builders running multiple jobs',
    features: ['Everything in Solo', 'Teams and permissions', 'Client/HQ/architect email drafts', 'Google Drive sync', 'Safety, defects and timesheets']
  },
  {
    name: 'Scale',
    price: '499',
    description: 'For growing contractors that need control',
    features: ['Everything in Company', 'Multiple workspaces', 'Advanced audit log', 'Priority support', 'Custom templates']
  }
];

export default function Pricing() {
  return (
    <main className="container">
      <nav className="nav">
        <Link className="logo" href="/">BuildMind <span>AI</span></Link>
        <Link className="btn secondary" href="/dashboard">Demo</Link>
      </nav>
      <section className="section">
        <div className="eyebrow">14-day trial included</div>
        <h1 style={{ fontSize: 58, letterSpacing: '-.07em', margin: '12px 0' }}>Pricing built for small builders first.</h1>
        <p className="lead">Start with the AI documentation wedge, then expand into project memory, reports, safety, defects and team controls.</p>
        <div className="pricing">
          {plans.map((plan, index) => (
            <div className="card" key={plan.name}>
              <span className={`badge ${index === 1 ? 'ok' : ''}`}>{index === 1 ? 'Recommended' : 'Plan'}</span>
              <h2>{plan.name}</h2>
              <div className="price">${plan.price}<span className="muted" style={{ fontSize: 16 }}>/mo</span></div>
              <p className="muted">{plan.description}</p>
              <div className="timeline">
                {plan.features.map((feature) => <div className="event" key={feature}>{feature}</div>)}
              </div>
              <Link className="btn" style={{ width: '100%', marginTop: 14 }} href="/signup">Start free trial</Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
