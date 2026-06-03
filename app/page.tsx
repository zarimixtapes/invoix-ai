import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Mic, ShieldCheck, Clock, DollarSign, Search, Cloud, ArrowRight } from 'lucide-react';

type Feature = {
  title: string;
  Icon: LucideIcon;
  body: string;
};

const features: Feature[] = [
  { title: 'Voice-to-everything', Icon: Mic, body: 'Speak once; BuildMind updates the whole project record.' },
  { title: 'Delay defence', Icon: Clock, body: 'Weather, labour and supplier delays become claim-ready evidence.' },
  { title: 'Variation revenue', Icon: DollarSign, body: 'Client changes become approval-ready variation drafts.' },
  { title: 'Safety scanner', Icon: ShieldCheck, body: 'Hazards, SWMS, toolbox talks and photo risks stay controlled.' },
  { title: 'Construction Memory', Icon: Search, body: 'Ask questions across photos, diaries, emails and records.' },
  { title: 'Drive-ready packets', Icon: Cloud, body: 'Daily report bundles sync to Google Drive project folders.' }
];

export default function Home() {
  return (
    <main className="container">
      <nav className="nav">
        <div className="logo">BuildMind <span>AI</span></div>
        <div className="navlinks">
          <a href="#features">Features</a>
          <Link href="/pricing">Pricing</Link>
          <Link href="/login">Login</Link>
          <Link className="btn" href="/signup">Start trial</Link>
        </div>
      </nav>

      <section className="hero">
        <div>
          <div className="eyebrow">AI construction operating system</div>
          <h1>Speak once. Your site paperwork is done.</h1>
          <p>BuildMind turns a 60-second site update into site diaries, delay records, variation drafts, defect logs, safety actions, client emails, project memory and Drive-ready evidence packs.</p>
          <div className="actions">
            <Link className="btn" href="/signup">Start 14-day trial <ArrowRight size={17} /></Link>
            <Link className="btn secondary" href="/dashboard">View demo dashboard</Link>
          </div>
          <div className="actions">
            <span className="pill">Built for small-to-medium builders</span>
            <span className="pill">Role-based team access</span>
            <span className="pill">Paywall ready</span>
          </div>
        </div>

        <div className="card">
          <div className="mockBrowser">
            <div className="mockTop">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span className="muted" style={{ marginLeft: 10 }}>BuildMind Command Centre</span>
            </div>
            <div className="miniDash">
              <div className="miniGrid">
                <div className="glass">
                  <b>Voice Copilot</b>
                  <div className="wave">REC → Diary + Delay + Variation</div>
                </div>
                <div className="glass">
                  <b>Forecast</b>
                  <h2>11 day risk</h2>
                  <p className="muted">Weather + supplier delay detected.</p>
                </div>
              </div>
              <div className="grid">
                <div className="feature"><b>$42.8k</b><span className="muted">Variation value waiting</span></div>
                <div className="feature"><b>24</b><span className="muted">Open defects</span></div>
                <div className="feature"><b>6</b><span className="muted">Safety alerts</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <h2>The wedge: AI project memory, not another form app.</h2>
        <p className="lead">You are not trying to beat Procore on every enterprise module first. You win with the workflow builders hate most: documentation, evidence, variation capture, delay defence and team communication.</p>
        <div className="grid">
          {features.map(({ title, Icon, body }) => (
            <div className="feature" key={title}>
              <Icon size={24} />
              <b>{title}</b>
              <p className="muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section grid2">
        <div className="card">
          <h2>Killer workflow</h2>
          <p className="lead">A foreman records: “Rain delay, concrete completed, client requested extra retaining wall, hazard near scaffold.”</p>
          <div className="timeline">
            <div className="event"><b>1. AI extracts facts</b><p className="muted">Weather, labour, progress, client request, hazard and stakeholders.</p></div>
            <div className="event"><b>2. Records are created</b><p className="muted">Site diary, delay notice, variation, hazard, timesheet note, email draft.</p></div>
            <div className="event"><b>3. Evidence is stored</b><p className="muted">Drive folder, audit trail, searchable construction memory.</p></div>
          </div>
        </div>
        <div className="phone">
          <div className="phoneNotch" />
          <h3>Mobile site mode</h3>
          <p className="muted">Designed for workers and supervisors on site.</p>
          <div className="record">Hold to record<br />site update</div>
          <button className="btn" style={{ width: '100%' }}>Generate records</button>
          <div className="timeline" style={{ marginTop: 14 }}>
            <div className="event">Diary ready</div>
            <div className="event">Delay draft ready</div>
            <div className="event">Client email ready</div>
          </div>
        </div>
      </section>
    </main>
  );
}
