'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Brain, CalendarClock, ClipboardCheck, DollarSign, FileText, HardHat, Home, ShieldAlert, Users, WalletCards, Search, Cloud, Mail, BarChart3, Map, Camera, ClipboardList } from 'lucide-react';
const links = [
  ['Command Centre','/dashboard',Home],['Voice Copilot','/dashboard/copilot',Brain],['Projects','/dashboard/projects',Building2],['Project Memory','/dashboard/memory',Search],['Site Diary','/dashboard/site-diary',FileText],['Delays','/dashboard/delays',CalendarClock],['Variations','/dashboard/variations',DollarSign],['Defects','/dashboard/defects',ClipboardCheck],['Safety','/dashboard/safety',ShieldAlert],['Photo Intelligence','/dashboard/photos',Camera],['Programme','/dashboard/programme',Map],['Timesheets','/dashboard/timesheets',HardHat],['Reports & Emails','/dashboard/reports',Mail],['Drive Sync','/dashboard/drive',Cloud],['Analytics','/dashboard/analytics',BarChart3],['Team Access','/dashboard/team',Users],['Billing','/dashboard/billing',WalletCards],['Audit Log','/dashboard/audit',ClipboardList]
] as const;
export default function Sidebar(){
  const path = usePathname();
  return <aside className="sidebar"><div className="sideHeader"><div className="logo">BuildMind <span>AI</span></div><p className="muted">AI Construction OS</p><span className="badge ok">14 day trial active</span></div>{links.map(([label,href,Icon])=><Link className={`sideLink ${path===href?'active':''}`} href={href} key={href}><Icon size={18}/>{label}</Link>)}<div className="sideFooter glass"><b>Site Pulse</b><p className="muted">3 risks detected today. 2 drafts ready for approval.</p></div></aside>
}
