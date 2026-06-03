'use client';

import { useEffect, useMemo, useState } from 'react';

type Role = 'owner' | 'builder' | 'pm' | 'contractor' | 'subcontractor' | 'worker' | 'client' | 'architect';
type Section = 'dashboard'|'projects'|'copilot'|'diary'|'delays'|'variations'|'safety'|'defects'|'timesheets'|'emails'|'drive'|'memory'|'team'|'billing'|'audit';
type EntityType = 'project'|'diary'|'delay'|'variation'|'hazard'|'defect'|'timesheet'|'email'|'document'|'memory'|'team';
type Status = 'open'|'closed'|'draft'|'sent'|'approved'|'pending'|'high'|'medium'|'low';

type Item = {
  id: string;
  type: EntityType;
  title: string;
  body: string;
  projectId?: string;
  status?: Status;
  amount?: number;
  date: string;
  owner?: string;
  role?: Role;
  hours?: number;
  meta?: Record<string, string>;
};

type AppState = {
  role: Role;
  plan: 'trial'|'paid'|'expired';
  trialStarted: string;
  items: Item[];
  audit: string[];
};

const nav: { id: Section; label: string }[] = [
  {id:'dashboard',label:'Command Centre'}, {id:'projects',label:'Projects'}, {id:'copilot',label:'Voice-to-Everything'}, {id:'diary',label:'Site Diary'}, {id:'delays',label:'Delays'}, {id:'variations',label:'Variations'}, {id:'safety',label:'Safety/Hazards'}, {id:'defects',label:'Defects'}, {id:'timesheets',label:'Timesheets'}, {id:'emails',label:'Reports & Emails'}, {id:'drive',label:'Drive Sync'}, {id:'memory',label:'Construction Memory'}, {id:'team',label:'Team Access'}, {id:'billing',label:'Billing'}, {id:'audit',label:'Audit Log'}
];

const canEdit = (role: Role, type: EntityType) => {
  if (['owner','builder','pm'].includes(role)) return true;
  if (role === 'contractor') return ['diary','delay','variation','hazard','defect','timesheet','document','memory'].includes(type);
  if (role === 'subcontractor') return ['diary','hazard','defect','timesheet','memory'].includes(type);
  if (role === 'worker') return ['hazard','timesheet','diary'].includes(type);
  return false;
};
const canView = (role: Role, type: EntityType) => {
  if (['owner','builder','pm'].includes(role)) return true;
  if (role === 'architect') return ['project','diary','defect','email','document','memory'].includes(type);
  if (role === 'client') return ['project','diary','email','document','memory'].includes(type);
  if (role === 'contractor') return !['billing'].includes(type as any);
  if (role === 'subcontractor') return ['project','diary','hazard','defect','timesheet','memory'].includes(type);
  if (role === 'worker') return ['project','diary','hazard','timesheet'].includes(type);
  return false;
};

const seedItems: Item[] = [
  {id:'p1',type:'project',title:'Harbour Apartments - Level 3',body:'Mixed-use apartment build. Current focus: concrete, services rough-in, façade prep.',status:'open',date:'2026-06-03',owner:'BuildMind Demo'},
  {id:'p2',type:'project',title:'Blacktown Townhouse Duplex',body:'Residential duplex with external works, brickwork and roofing underway.',status:'open',date:'2026-06-03',owner:'BuildMind Demo'},
  {id:'d1',type:'diary',projectId:'p1',title:'Level 3 concrete pour completed',body:'Concrete pour completed after a two-hour supplier delay. Eight workers on site. Rain affected access between 1pm and 2pm.',status:'open',date:'2026-06-03',owner:'Site Supervisor'},
  {id:'v1',type:'variation',projectId:'p1',title:'Client requested extra retaining wall',body:'Client requested additional retaining wall to west boundary. Requires labour, materials and written approval.',status:'pending',amount:4200,date:'2026-06-03',owner:'Project Manager'},
  {id:'h1',type:'hazard',projectId:'p1',title:'Open trench near north access',body:'Temporary barricade required. Worker submitted hazard from mobile.',status:'high',date:'2026-06-03',owner:'Worker'},
  {id:'e1',type:'email',projectId:'p1',title:'Draft to architect: Level 3 update',body:'Draft email ready: progress, delay evidence, and information request for revised detail.',status:'draft',date:'2026-06-03',owner:'AI Copilot'},
  {id:'t1',type:'timesheet',projectId:'p1',title:'Ali - 7.5 hours',body:'Concrete works and cleanup. Logged from worker dashboard.',status:'pending',hours:7.5,date:'2026-06-03',owner:'Ali'},
  {id:'m1',type:'memory',projectId:'p1',title:'Waterproofing issue timeline',body:'AI memory: waterproofing issues have appeared in two diary notes, one defect and one email draft.',status:'open',date:'2026-06-03',owner:'AI Memory'},
  {id:'team1',type:'team',title:'Sarah Nguyen',body:'Project manager with full project access.',role:'pm',status:'open',date:'2026-06-03',owner:'BuildMind Demo'},
  {id:'team2',type:'team',title:'ABC Electrical',body:'Subcontractor access: diary, defects, hazards and timesheets only.',role:'subcontractor',status:'open',date:'2026-06-03',owner:'BuildMind Demo'}
];

function today(){ return new Date().toISOString().slice(0,10); }
function uid(){ return Math.random().toString(36).slice(2,10); }

function loadState(): AppState {
  if (typeof window === 'undefined') return { role:'owner', plan:'trial', trialStarted: today(), items: seedItems, audit: [] };
  const raw = localStorage.getItem('buildmind-functional-mvp');
  if (!raw) return { role:'owner', plan:'trial', trialStarted: today(), items: seedItems, audit: ['Demo workspace created'] };
  try { return JSON.parse(raw) as AppState; } catch { return { role:'owner', plan:'trial', trialStarted: today(), items: seedItems, audit: [] }; }
}

export default function Page(){
  const [state,setState] = useState<AppState>({ role:'owner', plan:'trial', trialStarted: today(), items: seedItems, audit: [] });
  const [section,setSection] = useState<Section>('dashboard');
  const [editor,setEditor] = useState<{type:EntityType; item?:Item}|null>(null);
  const [toast,setToast] = useState('');
  const [query,setQuery] = useState('');
  const [voice,setVoice] = useState('Concrete truck arrived two hours late. Level 3 pour completed. Eight workers on site. Open trench near north access needs barricade. Client requested additional retaining wall. Send update to client and architect.');
  const [selectedProject,setSelectedProject] = useState('p1');

  useEffect(()=>setState(loadState()),[]);
  useEffect(()=>{ localStorage.setItem('buildmind-functional-mvp', JSON.stringify(state)); },[state]);
  useEffect(()=>{ if(toast){ const t=setTimeout(()=>setToast(''),2200); return ()=>clearTimeout(t);} },[toast]);

  const trialDays = Math.max(0, 14 - Math.floor((Date.now() - new Date(state.trialStarted).getTime()) / 86400000));
  const locked = state.plan === 'expired';
  const items = useMemo(()=>state.items.filter(i=>canView(state.role,i.type)),[state.items,state.role]);
  const byType = (type:EntityType) => items.filter(i=>i.type===type);
  const log = (msg:string) => setState(s=>({...s,audit:[`${new Date().toLocaleString()}: ${msg}`,...s.audit].slice(0,100)}));
  const saveItem = (item: Item) => {
    if(!canEdit(state.role,item.type)){ setToast('Permission blocked for this role'); return; }
    setState(s=>{
      const exists=s.items.some(x=>x.id===item.id);
      return {...s,items: exists ? s.items.map(x=>x.id===item.id?item:x) : [item,...s.items],audit:[`${new Date().toLocaleString()}: ${exists?'Updated':'Created'} ${item.type}: ${item.title}`,...s.audit]};
    });
    setEditor(null); setToast(`${item.type} saved`);
  };
  const removeItem = (id:string) => {
    const target=state.items.find(i=>i.id===id); if(!target) return;
    if(!canEdit(state.role,target.type)){ setToast('Permission blocked for this role'); return; }
    setState(s=>({...s,items:s.items.filter(i=>i.id!==id),audit:[`${new Date().toLocaleString()}: Deleted ${target.type}: ${target.title}`,...s.audit]}));
    setToast('Deleted');
  };
  const updateStatus = (id:string,status:Status) => {
    const target=state.items.find(i=>i.id===id); if(!target || !canEdit(state.role,target.type)){ setToast('Permission blocked'); return; }
    setState(s=>({...s,items:s.items.map(i=>i.id===id?{...i,status}:i),audit:[`${new Date().toLocaleString()}: Marked ${target.title} as ${status}`,...s.audit]}));
  };

  const generateWorkflow = () => {
    if(locked){ setSection('billing'); setToast('Paywall active'); return; }
    const text = voice.trim(); if(!text){ setToast('Add a site update first'); return; }
    if(!canEdit(state.role,'diary')){ setToast('This role cannot generate full records'); return; }
    const delay = /late|delay|rain|weather/i.test(text);
    const variation = /client requested|extra|additional|variation|changed/i.test(text);
    const hazard = /hazard|trench|unsafe|barricade|ppe|danger/i.test(text);
    const now=today();
    const created: Item[] = [
      {id:uid(),type:'diary',projectId:selectedProject,title:'AI site diary from voice update',body:text,status:'open',date:now,owner:'AI Copilot'},
      {id:uid(),type:'memory',projectId:selectedProject,title:'AI memory entry',body:`Indexed update for future search: ${text}`,status:'open',date:now,owner:'AI Memory'},
      {id:uid(),type:'email',projectId:selectedProject,title:'Draft client / HQ / architect update',body:`Subject: Site update and evidence pack\n\nHi team,\n\nToday's site update: ${text}\n\nActions requested: please review any approvals, delay impacts, and design responses required.\n\nRegards,\nBuildMind AI`,status:'draft',date:now,owner:'AI Copilot'}
    ];
    if(delay) created.push({id:uid(),type:'delay',projectId:selectedProject,title:'AI detected delay event',body:`Potential delay/evidence extracted: ${text}`,status:'open',date:now,owner:'AI Copilot'});
    if(variation) created.push({id:uid(),type:'variation',projectId:selectedProject,title:'AI detected variation draft',body:`Potential variation requiring client approval: ${text}`,status:'pending',amount:0,date:now,owner:'AI Copilot'});
    if(hazard) created.push({id:uid(),type:'hazard',projectId:selectedProject,title:'AI detected safety hazard',body:`Safety item requiring supervisor review: ${text}`,status:'high',date:now,owner:'AI Copilot'});
    setState(s=>({...s,items:[...created,...s.items],audit:[`${new Date().toLocaleString()}: Voice-to-everything generated ${created.length} records`,...s.audit]}));
    setToast(`${created.length} records generated`); setSection('dashboard');
  };

  const driveSync = () => {
    if(!canEdit(state.role,'document')){ setToast('This role cannot sync documents'); return; }
    const pack: Item = {id:uid(),type:'document',projectId:selectedProject,title:`Drive evidence pack ${today()}`,body:'Created pack containing site diaries, delays, variations, hazards, defects and draft emails for selected project.',status:'open',date:today(),owner:'Drive Sync'};
    setState(s=>({...s,items:[pack,...s.items],audit:[`${new Date().toLocaleString()}: Google Drive evidence pack prepared`,...s.audit]}));
    setToast('Drive pack prepared');
  };

  const filteredMemory = items.filter(i => !query || `${i.title} ${i.body} ${i.type}`.toLowerCase().includes(query.toLowerCase()));

  return <div className="app">
    <aside className="sidebar">
      <div className="logo">BuildMind AI</div>
      <div className="tag">Functional MVP • not a static mockup</div>
      <div className="field"><label>Test as role</label><select className="input" value={state.role} onChange={e=>setState(s=>({...s,role:e.target.value as Role}))}>
        {['owner','builder','pm','contractor','subcontractor','worker','client','architect'].map(r=><option key={r}>{r}</option>)}
      </select></div>
      <nav className="nav">{nav.map(n=><button key={n.id} onClick={()=>setSection(n.id)} className={section===n.id?'active':''}>{n.label}</button>)}</nav>
      <div className="trial"><strong>{state.plan==='paid'?'Paid plan active':state.plan==='expired'?'Trial expired':`${trialDays} trial days left`}</strong><div className="bar"><span style={{width:`${state.plan==='paid'?100:(trialDays/14)*100}%`}} /></div><button className="btn secondary" onClick={()=>setSection('billing')}>Manage billing</button></div>
    </aside>
    <main className="main">
      <div className="top"><div><span className="pill">Role: {state.role}</span> <span className="pill">Plan: {state.plan}</span></div><div className="actions"><button className="btn secondary" onClick={()=>{localStorage.removeItem('buildmind-functional-mvp'); setState({ role:'owner', plan:'trial', trialStarted: today(), items: seedItems, audit:['Demo reset'] }); setToast('Demo reset')}}>Reset demo</button><button className="btn" onClick={()=>setSection('copilot')}>Run killer workflow</button></div></div>
      {locked && section!=='billing' && <div className="notice">Trial expired. Actions are locked until subscription is activated. Use Billing to test the paywall logic.</div>}
      {section==='dashboard' && <Dashboard items={items} setSection={setSection} setEditor={setEditor}/>}      
      {section==='projects' && <Crud title="Projects" type="project" items={byType('project')} onAdd={()=>setEditor({type:'project'})} onEdit={i=>setEditor({type:'project',item:i})} onDelete={removeItem} onStatus={updateStatus} editable={canEdit(state.role,'project')&&!locked}/>}      
      {section==='copilot' && <section className="grid grid2"><div className="card"><h2>Voice-to-Everything</h2><p className="muted">Paste or speak one site update. The app creates real demo records across diary, delays, variations, hazards, email drafts and construction memory.</p><div className="field"><label>Project</label><select className="input" value={selectedProject} onChange={e=>setSelectedProject(e.target.value)}>{state.items.filter(i=>i.type==='project').map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></div><div className="field"><label>Site update</label><textarea value={voice} onChange={e=>setVoice(e.target.value)} /></div><div className="actions"><button className="btn" onClick={generateWorkflow} disabled={locked}>Generate records</button><button className="btn secondary" onClick={()=>{setVoice('Rain stopped work from 10am to 1pm. Scaffold access incomplete. Electrician requested revised drawing from architect. Worker logged missing edge protection.');}}>Use another sample</button></div></div><div className="card"><h2>What will be created</h2><div className="list"><div className="row"><b>Site diary</b><span className="status open">record</span></div><div className="row"><b>Delay notice</b><span className="status open">if detected</span></div><div className="row"><b>Variation draft</b><span className="status open">if detected</span></div><div className="row"><b>Hazard record</b><span className="status high">if detected</span></div><div className="row"><b>Email draft</b><span className="status">client/HQ/architect</span></div><div className="row"><b>Construction Memory</b><span className="status closed">searchable</span></div></div></div></section>}
      {section==='diary' && <Crud title="Site Diary" type="diary" items={byType('diary')} onAdd={()=>setEditor({type:'diary'})} onEdit={i=>setEditor({type:'diary',item:i})} onDelete={removeItem} onStatus={updateStatus} editable={canEdit(state.role,'diary')&&!locked}/>}      
      {section==='delays' && <Crud title="Delay Register" type="delay" items={byType('delay')} onAdd={()=>setEditor({type:'delay'})} onEdit={i=>setEditor({type:'delay',item:i})} onDelete={removeItem} onStatus={updateStatus} editable={canEdit(state.role,'delay')&&!locked}/>}      
      {section==='variations' && <Crud title="Variation Tracker" type="variation" items={byType('variation')} onAdd={()=>setEditor({type:'variation'})} onEdit={i=>setEditor({type:'variation',item:i})} onDelete={removeItem} onStatus={updateStatus} editable={canEdit(state.role,'variation')&&!locked}/>}      
      {section==='safety' && <Crud title="Safety & Hazards" type="hazard" items={byType('hazard')} onAdd={()=>setEditor({type:'hazard'})} onEdit={i=>setEditor({type:'hazard',item:i})} onDelete={removeItem} onStatus={updateStatus} editable={canEdit(state.role,'hazard')&&!locked}/>}      
      {section==='defects' && <Crud title="Defects" type="defect" items={byType('defect')} onAdd={()=>setEditor({type:'defect'})} onEdit={i=>setEditor({type:'defect',item:i})} onDelete={removeItem} onStatus={updateStatus} editable={canEdit(state.role,'defect')&&!locked}/>}      
      {section==='timesheets' && <Crud title="Timesheets" type="timesheet" items={byType('timesheet')} onAdd={()=>setEditor({type:'timesheet'})} onEdit={i=>setEditor({type:'timesheet',item:i})} onDelete={removeItem} onStatus={updateStatus} editable={canEdit(state.role,'timesheet')&&!locked}/>}      
      {section==='emails' && <Crud title="Reports & Email Drafts" type="email" items={byType('email')} onAdd={()=>setEditor({type:'email'})} onEdit={i=>setEditor({type:'email',item:i})} onDelete={removeItem} onStatus={updateStatus} editable={canEdit(state.role,'email')&&!locked}/>}      
      {section==='drive' && <section className="card"><h2>Google Drive Evidence Packs</h2><p className="muted">This creates a Drive-ready document record in demo mode. In production, connect Google OAuth and the /api/drive/sync route uploads the evidence file.</p><div className="actions"><button className="btn" onClick={driveSync} disabled={locked}>Prepare Drive pack</button></div><Crud title="Documents" type="document" items={byType('document')} onAdd={()=>setEditor({type:'document'})} onEdit={i=>setEditor({type:'document',item:i})} onDelete={removeItem} onStatus={updateStatus} editable={canEdit(state.role,'document')&&!locked} compact /></section>}
      {section==='memory' && <section className="card"><h2>Construction Memory Search</h2><p className="muted">Search across all project records you are allowed to view.</p><input className="input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search waterproofing, delays, client request, hazard..."/><div style={{height:12}}/><div className="list">{filteredMemory.slice(0,20).map(i=><Row key={i.id} item={i}/>)}</div></section>}
      {section==='team' && <Crud title="Team Access" type="team" items={byType('team')} onAdd={()=>setEditor({type:'team'})} onEdit={i=>setEditor({type:'team',item:i})} onDelete={removeItem} onStatus={updateStatus} editable={canEdit(state.role,'team')&&!locked}/>}      
      {section==='billing' && <Billing state={state} setState={setState} log={log}/>}      
      {section==='audit' && <section className="card"><h2>Audit Log</h2><p className="muted">Every demo action writes here.</p><div className="list">{state.audit.map((a,idx)=><div className="row" key={idx}>{a}</div>)}</div></section>}
    </main>
    {editor && <Editor item={editor.item} type={editor.type} onClose={()=>setEditor(null)} onSave={saveItem}/>} 
    {toast && <div className="toast">{toast}</div>}
  </div>;
}

function Dashboard({items,setSection,setEditor}:{items:Item[];setSection:(s:Section)=>void;setEditor:(e:{type:EntityType;item?:Item})=>void}){
  const count=(t:EntityType)=>items.filter(i=>i.type===t).length;
  const openMoney=items.filter(i=>i.type==='variation').reduce((a,b)=>a+(b.amount||0),0);
  return <section className="grid"><div className="hero"><h1>AI construction operating system that actually responds</h1><p className="muted">This demo now has connected actions: add, edit, delete, status changes, role restrictions, voice-generated records, Drive pack simulation, email drafts and audit logs.</p><div className="actions"><button className="btn" onClick={()=>setSection('copilot')}>Speak once → create records</button><button className="btn secondary" onClick={()=>setEditor({type:'project'})}>Add project</button></div></div><div className="grid grid3"><Metric title="Projects" value={count('project')} /><Metric title="Open variations" value={`$${openMoney.toLocaleString()}`} /><Metric title="Hazards" value={count('hazard')} /></div><div className="grid grid2"><div className="card"><h2>Recent activity</h2><div className="list">{items.slice(0,6).map(i=><Row key={i.id} item={i}/>)}</div></div><div className="card"><h2>Killer workflows</h2><div className="list"><button className="row" onClick={()=>setSection('copilot')}><b>Voice-to-Everything</b><span className="status closed">works</span></button><button className="row" onClick={()=>setSection('memory')}><b>Construction Memory Search</b><span className="status closed">works</span></button><button className="row" onClick={()=>setSection('drive')}><b>Drive Evidence Pack</b><span className="status open">hook-ready</span></button><button className="row" onClick={()=>setSection('billing')}><b>Trial / Paywall</b><span className="status open">demo logic</span></button></div></div></div></section>
}
function Metric({title,value}:{title:string;value:string|number}){return <div className="card"><div className="muted">{title}</div><div className="metric">{value}</div></div>}
function Row({item}:{item:Item}){return <div className="row"><div><div className="row-title">{item.title}</div><small>{item.type} • {item.date} • {item.owner||'Unassigned'}</small><p className="muted">{item.body}</p>{item.amount!==undefined&&<small>Amount: ${item.amount.toLocaleString()}</small>}{item.hours!==undefined&&<small> Hours: {item.hours}</small>}</div><span className={`status ${item.status}`}>{item.status||'open'}</span></div>}
function Crud({title,type,items,onAdd,onEdit,onDelete,onStatus,editable,compact}:{title:string;type:EntityType;items:Item[];onAdd:()=>void;onEdit:(i:Item)=>void;onDelete:(id:string)=>void;onStatus:(id:string,s:Status)=>void;editable:boolean;compact?:boolean}){return <section className={compact?'':'card'}><div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><div><h2>{title}</h2><p className="muted">{editable?'You can add, edit, approve, close and delete records here.':'Your current role can view this area but cannot edit it.'}</p></div>{editable&&<button className="btn" onClick={onAdd}>Add {type}</button>}</div><div className="list">{items.length===0&&<div className="notice">No records yet.</div>}{items.map(i=><div className="row" key={i.id}><div style={{flex:1}}><div className="row-title">{i.title}</div><small>{i.date} • {i.owner||'Unassigned'} {i.amount!==undefined?`• $${i.amount}`:''} {i.hours!==undefined?`• ${i.hours} hrs`:''}</small><p className="muted">{i.body}</p></div><div className="actions">{editable&&<><button className="btn secondary" onClick={()=>onEdit(i)}>Edit</button><button className="btn success" onClick={()=>onStatus(i.id,'approved')}>Approve</button><button className="btn secondary" onClick={()=>onStatus(i.id,'closed')}>Close</button><button className="btn danger" onClick={()=>onDelete(i.id)}>Delete</button></>}<span className={`status ${i.status}`}>{i.status||'open'}</span></div></div>)}</div></section>}
function Editor({item,type,onClose,onSave}:{item?:Item;type:EntityType;onClose:()=>void;onSave:(i:Item)=>void}){const [draft,setDraft]=useState<Item>(item||{id:uid(),type,title:'',body:'',status:'open',date:today(),owner:'Current user'});return <div className="drawer"><h2>{item?'Edit':'Add'} {type}</h2><div className="field"><label>Title</label><input className="input" value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></div><div className="field"><label>Details</label><textarea value={draft.body} onChange={e=>setDraft({...draft,body:e.target.value})}/></div><div className="grid grid2"><div className="field"><label>Status</label><select className="input" value={draft.status||'open'} onChange={e=>setDraft({...draft,status:e.target.value as Status})}>{['open','pending','draft','sent','approved','closed','high','medium','low'].map(s=><option key={s}>{s}</option>)}</select></div><div className="field"><label>Date</label><input className="input" type="date" value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})}/></div></div>{type==='variation'&&<div className="field"><label>Amount</label><input className="input" type="number" value={draft.amount||0} onChange={e=>setDraft({...draft,amount:Number(e.target.value)})}/></div>}{type==='timesheet'&&<div className="field"><label>Hours</label><input className="input" type="number" value={draft.hours||0} onChange={e=>setDraft({...draft,hours:Number(e.target.value)})}/></div>}{type==='team'&&<div className="field"><label>Role</label><select className="input" value={draft.role||'worker'} onChange={e=>setDraft({...draft,role:e.target.value as Role})}>{['owner','builder','pm','contractor','subcontractor','worker','client','architect'].map(r=><option key={r}>{r}</option>)}</select></div>}<div className="actions"><button className="btn" onClick={()=>onSave(draft)} disabled={!draft.title.trim()}>Save</button><button className="btn secondary" onClick={onClose}>Cancel</button></div></div>}
function Billing({state,setState,log}:{state:AppState;setState:React.Dispatch<React.SetStateAction<AppState>>;log:(m:string)=>void}){return <section className="grid grid2"><div className="card"><h2>Trial and Paywall</h2><p className="muted">Test the subscription state. Production checkout route is included at <span className="kbd">/api/stripe/checkout</span>.</p><div className="actions"><button className="btn" onClick={()=>{setState(s=>({...s,plan:'paid'}));log('Subscription activated in demo')}}>Activate paid demo</button><button className="btn secondary" onClick={()=>{setState(s=>({...s,plan:'trial',trialStarted:today()}));log('Trial restarted in demo')}}>Restart trial demo</button><button className="btn danger" onClick={()=>{setState(s=>({...s,plan:'expired'}));log('Trial expired in demo')}}>Expire trial demo</button></div></div><div className="card"><h2>Plans</h2><div className="list"><div className="row"><b>Starter</b><span>$49/mo</span></div><div className="row"><b>Team</b><span>$199/mo</span></div><div className="row"><b>Company</b><span>$499/mo</span></div></div></div></section>}
