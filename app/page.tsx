'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Role = 'owner' | 'builder' | 'project_manager' | 'contractor' | 'subcontractor' | 'worker' | 'client' | 'architect';
type Status = 'open' | 'approved' | 'closed' | 'draft' | 'sent' | 'paid' | 'active' | 'expired' | 'past_due' | 'trialing';
type ModuleKey = 'dashboard' | 'projects' | 'diaries' | 'delays' | 'variations' | 'hazards' | 'defects' | 'timesheets' | 'reports' | 'memory' | 'team' | 'billing' | 'settings' | 'landing' | 'pricing' | 'login';

type Project = { id: string; name: string; client: string; location: string; progress: number; budget: number; deadline: string; status: Status; createdAt: string };
type RecordItem = { id: string; projectId: string; title: string; details: string; severity?: 'low' | 'medium' | 'high' | 'critical'; value?: number; status: Status; assignedTo?: string; recipientType?: 'client' | 'hq' | 'architect' | 'contractor'; body?: string; hours?: number; createdAt: string; approvedForClient?: boolean };
type TeamMember = { id: string; name: string; email: string; role: Role; access: string; status: Status; createdAt: string };
type Billing = { status: 'trialing' | 'active' | 'expired' | 'past_due'; trialStartedAt: string; plan: 'starter' | 'pro' | 'company'; seats: number };
type AppState = {
  role: Role;
  active: ModuleKey;
  projects: Project[];
  diaries: RecordItem[];
  delays: RecordItem[];
  variations: RecordItem[];
  hazards: RecordItem[];
  defects: RecordItem[];
  timesheets: RecordItem[];
  reports: RecordItem[];
  memory: RecordItem[];
  team: TeamMember[];
  audit: RecordItem[];
  billing: Billing;
};

type CollectionKey = 'projects' | 'diaries' | 'delays' | 'variations' | 'hazards' | 'defects' | 'timesheets' | 'reports' | 'memory' | 'team' | 'audit';

const STORE_KEY = 'buildmind-ai-production-mvp-v1';
const fullRoles: Role[] = ['owner', 'builder', 'project_manager'];
const tradeRoles: Role[] = ['contractor', 'subcontractor'];
const roles: Role[] = ['owner', 'builder', 'project_manager', 'contractor', 'subcontractor', 'worker', 'client', 'architect'];

function id(prefix = 'id') { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
function now() { return new Date().toISOString(); }
function money(n?: number) { return `$${Math.round(n || 0).toLocaleString()}`; }
function todayPlus(days: number) { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }
function prettyRole(r: Role) { return r.replaceAll('_', ' '); }

const seedState = (): AppState => ({
  role: 'owner',
  active: 'dashboard',
  projects: [
    { id: 'p1', name: 'Riverstone Townhouses', client: 'GreenPeak Developments', location: 'Riverstone NSW', progress: 62, budget: 980000, deadline: todayPlus(47), status: 'active', createdAt: now() },
    { id: 'p2', name: 'Blacktown Cafe Fitout', client: 'Urban Bean Pty Ltd', location: 'Blacktown NSW', progress: 28, budget: 185000, deadline: todayPlus(21), status: 'active', createdAt: now() }
  ],
  diaries: [{ id: 'd1', projectId: 'p1', title: 'Level 1 framing complete', details: 'Carpenters completed level 1 framing. Delivery of roof trusses confirmed for Friday.', status: 'approved', createdAt: now(), approvedForClient: true }],
  delays: [{ id: 'dl1', projectId: 'p1', title: 'Rain delay - slab works', details: 'Heavy rain stopped external slab preparation for 4 hours.', severity: 'medium', status: 'open', value: 850, createdAt: now() }],
  variations: [{ id: 'v1', projectId: 'p1', title: 'Client requested extra retaining wall', details: 'Additional retaining wall requested near driveway. Awaiting approval.', status: 'draft', value: 6400, createdAt: now() }],
  hazards: [{ id: 'h1', projectId: 'p1', title: 'Unprotected edge near scaffold bay', details: 'Temporary exclusion zone created and supervisor notified.', severity: 'high', status: 'open', createdAt: now() }],
  defects: [{ id: 'df1', projectId: 'p2', title: 'Paint finish uneven near counter wall', details: 'Painter to rectify before handover.', severity: 'low', status: 'open', createdAt: now() }],
  timesheets: [{ id: 't1', projectId: 'p1', title: 'Ali - labourer shift', details: 'Site clean-up and material handling.', hours: 7.5, status: 'approved', createdAt: now(), assignedTo: 'Ali' }],
  reports: [{ id: 'r1', projectId: 'p1', title: 'Client weekly update', details: 'Progress steady. One rain delay logged. Variation awaiting approval.', body: 'Hi, this week framing progressed well. We recorded one rain delay and one pending variation for the retaining wall.', recipientType: 'client', status: 'draft', createdAt: now(), approvedForClient: true }],
  memory: [{ id: 'm1', projectId: 'p1', title: 'Waterproofing query', details: 'Client asked for confirmation that balcony waterproofing photos will be stored before tiling.', status: 'open', createdAt: now() }],
  team: [
    { id: 'tm1', name: 'Sam Owner', email: 'owner@demo.com', role: 'owner', access: 'Full company access', status: 'active', createdAt: now() },
    { id: 'tm2', name: 'Mina Worker', email: 'worker@demo.com', role: 'worker', access: 'Timesheets and hazards only', status: 'active', createdAt: now() },
    { id: 'tm3', name: 'Ava Architect', email: 'architect@demo.com', role: 'architect', access: 'Variations, reports and technical notes', status: 'active', createdAt: now() }
  ],
  audit: [{ id: 'a1', projectId: 'p1', title: 'Demo workspace created', details: 'Seed data loaded for BuildMind AI MVP.', status: 'open', createdAt: now() }],
  billing: { status: 'trialing', trialStartedAt: now(), plan: 'pro', seats: 6 }
});

function canView(role: Role, module: ModuleKey): boolean {
  if (['landing', 'pricing', 'login'].includes(module)) return true;
  if (fullRoles.includes(role)) return true;
  if (role === 'worker') return ['dashboard', 'diaries', 'hazards', 'timesheets', 'settings'].includes(module);
  if (role === 'client') return ['dashboard', 'projects', 'reports', 'billing', 'settings'].includes(module);
  if (role === 'architect') return ['dashboard', 'projects', 'variations', 'reports', 'memory', 'settings'].includes(module);
  if (tradeRoles.includes(role)) return ['dashboard', 'projects', 'diaries', 'hazards', 'defects', 'timesheets', 'reports', 'memory', 'settings'].includes(module);
  return false;
}
function canEdit(role: Role, module: ModuleKey): boolean {
  if (fullRoles.includes(role)) return true;
  if (role === 'worker') return ['hazards', 'timesheets'].includes(module);
  if (role === 'contractor' || role === 'subcontractor') return ['diaries', 'hazards', 'defects', 'timesheets'].includes(module);
  if (role === 'architect') return ['variations', 'memory'].includes(module);
  return false;
}

const nav: { key: ModuleKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' }, { key: 'projects', label: 'Projects' }, { key: 'diaries', label: 'Site Diary' }, { key: 'delays', label: 'Delays' },
  { key: 'variations', label: 'Variations' }, { key: 'hazards', label: 'Safety' }, { key: 'defects', label: 'Defects' }, { key: 'timesheets', label: 'Timesheets' },
  { key: 'reports', label: 'Reports & Emails' }, { key: 'memory', label: 'Construction Memory' }, { key: 'team', label: 'Team Access' }, { key: 'billing', label: 'Billing' }, { key: 'settings', label: 'Settings' }
];

const moduleMeta: Record<string, { title: string; singular: string; desc: string }> = {
  projects: { title: 'Projects', singular: 'project', desc: 'Manage live construction jobs, clients, budgets and progress.' },
  diaries: { title: 'Site Diary', singular: 'site diary', desc: 'Daily notes, labour, weather, progress and site evidence.' },
  delays: { title: 'Delay Register', singular: 'delay', desc: 'Track rain delays, supplier issues, permit problems and EOT evidence.' },
  variations: { title: 'Variation Tracker', singular: 'variation', desc: 'Capture scope changes, cost impact and approval status.' },
  hazards: { title: 'Safety & Hazards', singular: 'hazard', desc: 'Log risks, incidents, corrective actions and severity.' },
  defects: { title: 'Defects', singular: 'defect', desc: 'Record defects, assign rectification and close-out status.' },
  timesheets: { title: 'Timesheets', singular: 'timesheet', desc: 'Workers and contractors can log hours against projects.' },
  reports: { title: 'Reports & Email Drafts', singular: 'report/email', desc: 'Client, HQ, architect and contractor draft communications.' },
  memory: { title: 'Construction Memory', singular: 'memory', desc: 'Searchable project knowledge from reports, notes and events.' },
};

export default function App() {
  const [state, setState] = useState<AppState>(seedState());
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [aiText, setAiText] = useState('Concrete truck arrived 3 hours late due to rain. Client requested extra retaining wall. Open trench near driveway needs barrier. Draft update for architect and HQ.');
  const [editing, setEditing] = useState<{ key: CollectionKey; item?: any } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(STORE_KEY, JSON.stringify(state)); }, [state, loaded]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t); } }, [toast]);

  const project = state.projects[0];
  const daysLeft = Math.max(0, 14 - Math.floor((Date.now() - new Date(state.billing.trialStartedAt).getTime()) / 86400000));
  const restricted = !canView(state.role, state.active);
  const stats = useMemo(() => ({
    openDelays: state.delays.filter(x => x.status !== 'closed').length,
    openVariations: state.variations.filter(x => x.status !== 'approved' && x.status !== 'closed').length,
    safetyRisk: state.hazards.filter(x => x.status !== 'closed').length,
    defects: state.defects.filter(x => x.status !== 'closed').length,
    variationValue: state.variations.reduce((a, b) => a + (b.value || 0), 0),
    recent: [...state.audit, ...state.memory, ...state.reports, ...state.hazards].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6)
  }), [state]);

  function patch(updater: (s: AppState) => AppState, message?: string) { setState(updater); if (message) setToast(message); }
  function setActive(active: ModuleKey) { setState(s => ({ ...s, active })); }
  function addAudit(title: string, details: string, projectId = project?.id || 'p1') {
    setState(s => ({ ...s, audit: [{ id: id('audit'), projectId, title, details, status: 'open' as Status, createdAt: now() }, ...s.audit].slice(0, 100) }));
  }
  function resetDemo() { const fresh = seedState(); setState(fresh); localStorage.setItem(STORE_KEY, JSON.stringify(fresh)); setToast('Demo data reset.'); }

  async function runAiWorkflow() {
    const lower = aiText.toLowerCase();
    const projectId = project?.id || 'p1';
    const create: Partial<Record<CollectionKey, RecordItem[]>> = {};
    const base = { projectId, createdAt: now() };
    if (lower.includes('rain') || lower.includes('delay') || lower.includes('late') || lower.includes('storm')) create.delays = [{ ...base, id: id('delay'), title: 'AI detected delay', details: aiText, severity: lower.includes('storm') ? 'high' : 'medium', status: 'open', value: 1200 } as RecordItem];
    if (lower.includes('variation') || lower.includes('extra') || lower.includes('client requested') || lower.includes('change')) create.variations = [{ ...base, id: id('var'), title: 'AI variation draft', details: aiText, status: 'draft', value: 2500 } as RecordItem];
    if (lower.includes('hazard') || lower.includes('unsafe') || lower.includes('trench') || lower.includes('barrier') || lower.includes('injury')) create.hazards = [{ ...base, id: id('haz'), title: 'AI safety hazard', details: aiText, severity: lower.includes('injury') ? 'critical' : 'high', status: 'open' } as RecordItem];
    if (lower.includes('defect') || lower.includes('crack') || lower.includes('leak') || lower.includes('damage')) create.defects = [{ ...base, id: id('def'), title: 'AI defect record', details: aiText, severity: 'medium', status: 'open' } as RecordItem];
    create.diaries = [{ ...base, id: id('diary'), title: 'AI generated site diary', details: aiText, status: 'draft' } as RecordItem];
    create.reports = [{ ...base, id: id('mail'), title: 'AI draft email - project update', details: 'Draft email generated from site update.', body: `Hi team,\n\nSite update: ${aiText}\n\nBuildMind has logged related diary, delay, variation and safety records where relevant.\n\nRegards,`, recipientType: lower.includes('architect') ? 'architect' : lower.includes('hq') ? 'hq' : 'client', status: 'draft' } as RecordItem];
    create.memory = [{ ...base, id: id('mem'), title: 'AI project memory entry', details: aiText, status: 'open' } as RecordItem];

    patch(s => ({
      ...s,
      diaries: [...(create.diaries || []), ...s.diaries], delays: [...(create.delays || []), ...s.delays], variations: [...(create.variations || []), ...s.variations], hazards: [...(create.hazards || []), ...s.hazards], defects: [...(create.defects || []), ...s.defects], reports: [...(create.reports || []), ...s.reports], memory: [...(create.memory || []), ...s.memory], audit: [{ id: id('audit'), projectId, title: 'Voice-to-Everything workflow ran', details: `Created ${Object.values(create).flat().length} structured records.`, status: 'open' as Status, createdAt: now() }, ...s.audit]
    }), 'AI workflow generated project records.');
  }

  function saveItem(key: CollectionKey, item: any) {
    const isProject = key === 'projects';
    const isTeam = key === 'team';
    const itemWithDefaults = item.id ? item : { ...item, id: id(key), createdAt: now(), status: item.status || 'open', projectId: item.projectId || project?.id || 'p1' };
    patch(s => ({ ...s, [key]: (s[key] as any[]).some(x => x.id === itemWithDefaults.id) ? (s[key] as any[]).map(x => x.id === itemWithDefaults.id ? itemWithDefaults : x) : [itemWithDefaults, ...(s[key] as any[])] } as AppState), `${isProject ? 'Project' : isTeam ? 'Team member' : 'Record'} saved.`);
    addAudit(`${String(key)} updated`, itemWithDefaults.title || itemWithDefaults.name || 'Record saved', itemWithDefaults.projectId || project?.id || 'p1');
    setEditing(null);
  }
  function deleteItem(key: CollectionKey, itemId: string) {
    patch(s => ({ ...s, [key]: (s[key] as any[]).filter(x => x.id !== itemId) } as AppState), 'Deleted.');
  }
  function setStatus(key: CollectionKey, itemId: string, status: Status) {
    patch(s => ({ ...s, [key]: (s[key] as any[]).map(x => x.id === itemId ? { ...x, status } : x) } as AppState), `Marked ${status}.`);
  }

  function viewRecords(records: RecordItem[]) {
    if (state.role === 'client') return records.filter(r => r.approvedForClient || r.status === 'approved' || r.recipientType === 'client');
    return records;
  }

  const content = restricted ? <Blocked role={state.role} active={state.active} /> : state.active === 'landing' ? <Landing setActive={setActive} /> : state.active === 'pricing' ? <Pricing setActive={setActive} /> : state.active === 'login' ? <LoginDemo setActive={setActive} /> : state.active === 'dashboard' ? dashboard() : state.active === 'billing' ? billing() : state.active === 'settings' ? settings() : state.active === 'team' ? team() : genericModule(state.active);

  function dashboard() {
    return <main className="screen">
      <section className="hero-card">
        <div><p className="eyebrow">AI Construction Operating System</p><h1>Speak once. BuildMind updates the site diary, claims, safety and client records.</h1><p className="muted">Functional local demo mode is active. Records persist in your browser until reset.</p></div>
        <div className="trial"><b>{daysLeft}</b><span>trial days left</span><button onClick={() => setActive('billing')}>Manage billing</button></div>
      </section>
      <section className="stats-grid">
        <Stat label="Project progress" value={`${project?.progress || 0}%`} detail={project?.name || 'No project'} />
        <Stat label="Open delays" value={stats.openDelays} detail="EOT evidence risk" />
        <Stat label="Open variations" value={stats.openVariations} detail={money(stats.variationValue)} />
        <Stat label="Safety risk" value={stats.safetyRisk} detail={`${stats.defects} open defects`} />
      </section>
      <section className="grid two">
        <div className="panel big">
          <h2>Voice-to-Everything</h2><p className="muted">Type or paste a site update. The demo parser creates real records you can edit/delete in each module.</p>
          <textarea value={aiText} onChange={e => setAiText(e.target.value)} rows={6} />
          <div className="actions"><button onClick={runAiWorkflow}>Generate diary, delay, variation, hazard & email</button><button className="ghost" onClick={() => setActive('reports')}>View drafts</button></div>
        </div>
        <div className="panel">
          <h2>Recent activity</h2>{stats.recent.map(r => <div className="activity" key={r.id}><b>{r.title}</b><small>{new Date(r.createdAt).toLocaleString()}</small><p>{r.details}</p></div>)}
        </div>
      </section>
      <section className="grid four">
        {nav.filter(n => !['dashboard', 'billing', 'settings'].includes(n.key)).slice(0, 8).map(n => <button className="module-card" key={n.key} onClick={() => setActive(n.key)}><b>{n.label}</b><span>{canView(state.role, n.key) ? 'Open module' : 'Restricted for role'}</span></button>)}
      </section>
    </main>;
  }

  function genericModule(active: ModuleKey) {
    const key = active as CollectionKey;
    const meta = moduleMeta[active];
    if (!meta) return <main className="screen"><h1>Module</h1></main>;
    const data = (state[key] as any[]) || [];
    const records = active === 'projects' || active === 'team' ? data : viewRecords(data as RecordItem[]);
    const editable = canEdit(state.role, active);
    return <main className="screen">
      <div className="head-row"><div><p className="eyebrow">{prettyRole(state.role)}</p><h1>{meta.title}</h1><p className="muted">{meta.desc}</p></div>{editable ? <button onClick={() => setEditing({ key })}>Add {meta.singular}</button> : <span className="badge warn">View only for this role</span>}</div>
      <div className="tools"><input placeholder={`Search ${meta.title.toLowerCase()}...`} value={search} onChange={e => setSearch(e.target.value)} /><button className="ghost" onClick={() => setSearch('')}>Clear</button></div>
      {records.length === 0 ? <div className="empty">No records yet. {editable ? 'Click add to create one.' : 'Your role cannot see private records here.'}</div> : <div className="table-card">
        {records.filter((r: any) => JSON.stringify(r).toLowerCase().includes(search.toLowerCase())).map((r: any) => <RecordRow key={r.id} item={r} type={key} projects={state.projects} canEdit={editable} onEdit={() => setEditing({ key, item: r })} onDelete={() => deleteItem(key, r.id)} onStatus={(st) => setStatus(key, r.id, st)} />)}
      </div>}
    </main>;
  }

  function team() {
    return <main className="screen"><div className="head-row"><div><h1>Team permissions</h1><p className="muted">Invite and control what each person can access. Role switcher above lets you test it.</p></div>{canEdit(state.role, 'team') && <button onClick={() => setEditing({ key: 'team' })}>Add member</button>}</div><div className="table-card">{state.team.map(m => <div className="row" key={m.id}><div><b>{m.name}</b><p>{m.email}</p><small>{m.access}</small></div><span className="badge">{prettyRole(m.role)}</span><div className="row-actions"><button className="ghost" onClick={() => setEditing({ key: 'team', item: m })}>Edit</button><button className="danger" onClick={() => deleteItem('team', m.id)}>Delete</button></div></div>)}</div></main>;
  }
  function billing() {
    return <main className="screen"><div className="head-row"><div><h1>Billing & Paywall</h1><p className="muted">Demo mode shows trial logic without requiring Stripe keys.</p></div><span className="badge good">{state.billing.status}</span></div><section className="grid three"><div className="panel"><h2>Trial</h2><p><b>{daysLeft}</b> days remaining</p><button onClick={() => patch(s => ({ ...s, billing: { ...s.billing, status: 'active' } }), 'Demo subscription activated.')}>Activate demo subscription</button></div><div className="panel"><h2>Paywall test</h2><p>Set expired/past due to test blocked states.</p><button className="ghost" onClick={() => patch(s => ({ ...s, billing: { ...s.billing, status: 'expired' } }), 'Trial expired demo set.')}>Set expired</button><button className="ghost" onClick={() => patch(s => ({ ...s, billing: { ...s.billing, status: 'past_due' } }), 'Past due demo set.')}>Set past due</button></div><div className="panel"><h2>Stripe hook</h2><p>Production checkout route exists at <code>/api/stripe/checkout</code>.</p><button onClick={async () => { const res = await fetch('/api/stripe/checkout', { method: 'POST' }); const j = await res.json(); setToast(j.message || 'Stripe route checked.'); }}>Test checkout route</button></div></section></main>;
  }
  function settings() {
    return <main className="screen"><h1>Settings</h1><section className="grid two"><div className="panel"><h2>Role tester</h2><p className="muted">Switch roles to see permissions change.</p><select value={state.role} onChange={e => patch(s => ({ ...s, role: e.target.value as Role }), 'Role changed.')}>{roles.map(r => <option key={r} value={r}>{prettyRole(r)}</option>)}</select></div><div className="panel"><h2>Demo controls</h2><button className="danger" onClick={resetDemo}>Reset demo data</button><button className="ghost" onClick={() => navigator.clipboard.writeText(JSON.stringify(state, null, 2)).then(() => setToast('State copied.'))}>Copy state JSON</button></div></section><section className="panel"><h2>Production connection status</h2><p>OpenAI, Stripe, Google Drive and Supabase hooks are included. Without keys, routes return demo-safe responses instead of crashing.</p></section></main>;
  }

  return <div className="app">
    <aside className="sidebar"><div className="brand" onClick={() => setActive('landing')}><span>BM</span><div><b>BuildMind AI</b><small>Construction OS</small></div></div><button className="price" onClick={() => setActive('pricing')}>Pricing</button><button className="price" onClick={() => setActive('login')}>Login demo</button>{nav.map(n => <button key={n.key} onClick={() => setActive(n.key)} className={state.active === n.key ? 'active' : ''}>{n.label}{!canView(state.role, n.key) && <small>locked</small>}</button>)}</aside>
    <div className="main"><header><div><b>{state.active === 'landing' ? 'Home' : nav.find(n => n.key === state.active)?.label || state.active}</b><small>{state.billing.status === 'trialing' ? `${daysLeft} trial days left` : state.billing.status}</small></div><select value={state.role} onChange={e => setState(s => ({ ...s, role: e.target.value as Role }))}>{roles.map(r => <option key={r} value={r}>{prettyRole(r)}</option>)}</select></header>{content}</div>
    {editing && <EditorModal collection={editing.key} item={editing.item} projects={state.projects} onClose={() => setEditing(null)} onSave={(item) => saveItem(editing.key, item)} />}
    {toast && <div className="toast">{toast}</div>}
  </div>;
}

function Landing({ setActive }: { setActive: (m: ModuleKey) => void }) { return <main className="screen landing"><section className="hero-card landing-hero"><div><p className="eyebrow">AI-first construction management</p><h1>Turn one site update into diaries, delays, variations, hazards, emails and evidence.</h1><p className="muted">Built for small-to-medium builders who need documentation discipline without Procore-level complexity.</p><div className="actions"><button onClick={() => setActive('dashboard')}>Open live demo</button><button className="ghost" onClick={() => setActive('pricing')}>View pricing</button></div></div><div className="fake-phone"><b>Voice update</b><p>Rain delay. Client changed wall scope. Safety barrier needed.</p><span>6 records generated</span></div></section></main>; }
function Pricing({ setActive }: { setActive: (m: ModuleKey) => void }) { return <main className="screen"><h1>Pricing</h1><p className="muted">14-day trial. Demo billing works without Stripe keys.</p><section className="grid three">{['Starter $49/mo', 'Pro $149/mo', 'Company $399/mo'].map((p, i) => <div className="panel price-card" key={p}><h2>{p}</h2><p>{i === 0 ? 'Solo builders' : i === 1 ? 'Growing teams' : 'Multi-project companies'}</p><ul><li>Site diaries</li><li>AI records</li><li>Team permissions</li><li>{i === 2 ? 'Advanced audit controls' : 'Drive-ready exports'}</li></ul><button onClick={() => setActive('billing')}>Start trial</button></div>)}</section></main>; }
function LoginDemo({ setActive }: { setActive: (m: ModuleKey) => void }) { const [email, setEmail] = useState('owner@demo.com'); return <main className="screen"><section className="panel login"><h1>Login/signup demo</h1><p className="muted">Production can connect Supabase Auth. Demo continues locally.</p><input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" /><input type="password" value="password123" readOnly /><button onClick={() => setActive('dashboard')}>Continue to workspace</button></section></main>; }
function Stat({ label, value, detail }: { label: string; value: React.ReactNode; detail: string }) { return <div className="stat"><span>{label}</span><b>{value}</b><small>{detail}</small></div>; }
function Blocked({ role, active }: { role: Role; active: ModuleKey }) { return <main className="screen"><div className="blocked"><h1>Restricted access</h1><p>The <b>{prettyRole(role)}</b> role cannot access <b>{active}</b>. Switch role in the top-right selector or Settings to test permissions.</p></div></main>; }

function RecordRow({ item, type, projects, canEdit, onEdit, onDelete, onStatus }: { item: any; type: string; projects: Project[]; canEdit: boolean; onEdit: () => void; onDelete: () => void; onStatus: (s: Status) => void }) {
  const projectName = projects.find(p => p.id === item.projectId)?.name;
  return <div className="row"><div><b>{item.title || item.name}</b><p>{item.details || item.location || item.email}</p><small>{projectName ? `${projectName} • ` : ''}{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}{item.value ? ` • ${money(item.value)}` : ''}{item.hours ? ` • ${item.hours} hrs` : ''}</small>{item.body && <pre>{item.body}</pre>}</div><span className={`badge ${item.severity === 'high' || item.severity === 'critical' ? 'bad' : item.status === 'approved' || item.status === 'active' ? 'good' : ''}`}>{item.severity || item.status}</span>{canEdit && <div className="row-actions"><button className="ghost" onClick={onEdit}>Edit</button><button className="ghost" onClick={() => onStatus('approved')}>Approve</button><button className="ghost" onClick={() => onStatus('closed')}>Close</button><button className="danger" onClick={onDelete}>Delete</button></div>}</div>;
}

function EditorModal({ collection, item, projects, onClose, onSave }: { collection: CollectionKey; item?: any; projects: Project[]; onClose: () => void; onSave: (item: any) => void }) {
  const [form, setForm] = useState<any>(item || (collection === 'projects' ? { name: '', client: '', location: '', progress: 0, budget: 0, deadline: todayPlus(30), status: 'active' } : collection === 'team' ? { name: '', email: '', role: 'worker', access: '', status: 'active' } : { projectId: projects[0]?.id || 'p1', title: '', details: '', status: 'open', severity: 'medium', value: 0, hours: 0, recipientType: 'client', body: '', approvedForClient: false }));
  function update(k: string, v: any) { setForm((f: any) => ({ ...f, [k]: v })); }
  return <div className="modal-backdrop"><div className="modal"><div className="head-row"><h2>{item ? 'Edit' : 'Add'} {collection}</h2><button className="ghost" onClick={onClose}>Close</button></div>{collection === 'projects' ? <>
    <label>Project name<input value={form.name} onChange={e => update('name', e.target.value)} /></label><label>Client<input value={form.client} onChange={e => update('client', e.target.value)} /></label><label>Location<input value={form.location} onChange={e => update('location', e.target.value)} /></label><label>Progress %<input type="number" value={form.progress} onChange={e => update('progress', Number(e.target.value))} /></label><label>Budget<input type="number" value={form.budget} onChange={e => update('budget', Number(e.target.value))} /></label><label>Deadline<input type="date" value={form.deadline} onChange={e => update('deadline', e.target.value)} /></label>
  </> : collection === 'team' ? <>
    <label>Name<input value={form.name} onChange={e => update('name', e.target.value)} /></label><label>Email<input value={form.email} onChange={e => update('email', e.target.value)} /></label><label>Role<select value={form.role} onChange={e => update('role', e.target.value)}>{roles.map(r => <option key={r} value={r}>{prettyRole(r)}</option>)}</select></label><label>Access<input value={form.access} onChange={e => update('access', e.target.value)} /></label>
  </> : <>
    <label>Project<select value={form.projectId} onChange={e => update('projectId', e.target.value)}>{projects.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}</select></label><label>Title<input value={form.title} onChange={e => update('title', e.target.value)} /></label><label>Details<textarea value={form.details} onChange={e => update('details', e.target.value)} /></label><label>Status<select value={form.status} onChange={e => update('status', e.target.value)}>{['open', 'draft', 'approved', 'closed', 'sent', 'paid'].map(s => <option key={s}>{s}</option>)}</select></label><label>Severity<select value={form.severity || 'medium'} onChange={e => update('severity', e.target.value)}>{['low', 'medium', 'high', 'critical'].map(s => <option key={s}>{s}</option>)}</select></label><label>Value / cost impact<input type="number" value={form.value || 0} onChange={e => update('value', Number(e.target.value))} /></label><label>Hours<input type="number" step="0.5" value={form.hours || 0} onChange={e => update('hours', Number(e.target.value))} /></label><label>Recipient type<select value={form.recipientType || 'client'} onChange={e => update('recipientType', e.target.value)}>{['client', 'hq', 'architect', 'contractor'].map(s => <option key={s}>{s}</option>)}</select></label><label>Email/report body<textarea value={form.body || ''} onChange={e => update('body', e.target.value)} /></label><label className="check"><input type="checkbox" checked={!!form.approvedForClient} onChange={e => update('approvedForClient', e.target.checked)} /> Approved for client view</label>
  </>}<button onClick={() => onSave(form)} disabled={collection === 'projects' ? !form.name : collection === 'team' ? !form.name : !form.title}>Save</button></div></div>;
}
