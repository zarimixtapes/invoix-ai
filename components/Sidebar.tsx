'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { Building2, Brain, CalendarClock, ClipboardCheck, DollarSign, FileText, HardHat, Home, ShieldAlert, Users, WalletCards, Search, Cloud, Mail, BarChart3, Map, Camera, ClipboardList } from 'lucide-react';

type SidebarLink = {
  label: string;
  href: string;
  Icon: LucideIcon;
};

const links: SidebarLink[] = [
  { label: 'Command Centre', href: '/dashboard', Icon: Home },
  { label: 'Voice Copilot', href: '/dashboard/copilot', Icon: Brain },
  { label: 'Projects', href: '/dashboard/projects', Icon: Building2 },
  { label: 'Project Memory', href: '/dashboard/memory', Icon: Search },
  { label: 'Site Diary', href: '/dashboard/site-diary', Icon: FileText },
  { label: 'Delays', href: '/dashboard/delays', Icon: CalendarClock },
  { label: 'Variations', href: '/dashboard/variations', Icon: DollarSign },
  { label: 'Defects', href: '/dashboard/defects', Icon: ClipboardCheck },
  { label: 'Safety', href: '/dashboard/safety', Icon: ShieldAlert },
  { label: 'Photo Intelligence', href: '/dashboard/photos', Icon: Camera },
  { label: 'Programme', href: '/dashboard/programme', Icon: Map },
  { label: 'Timesheets', href: '/dashboard/timesheets', Icon: HardHat },
  { label: 'Reports & Emails', href: '/dashboard/reports', Icon: Mail },
  { label: 'Drive Sync', href: '/dashboard/drive', Icon: Cloud },
  { label: 'Analytics', href: '/dashboard/analytics', Icon: BarChart3 },
  { label: 'Team Access', href: '/dashboard/team', Icon: Users },
  { label: 'Billing', href: '/dashboard/billing', Icon: WalletCards },
  { label: 'Audit Log', href: '/dashboard/audit', Icon: ClipboardList }
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="sidebar">
      <div className="sideHeader">
        <div className="logo">BuildMind <span>AI</span></div>
        <p className="muted">AI Construction OS</p>
        <span className="badge ok">14 day trial active</span>
      </div>
      {links.map(({ label, href, Icon }) => (
        <Link className={`sideLink ${path === href ? 'active' : ''}`} href={href} key={href}>
          <Icon size={18} />
          {label}
        </Link>
      ))}
      <div className="sideFooter glass">
        <b>Site Pulse</b>
        <p className="muted">3 risks detected today. 2 drafts ready for approval.</p>
      </div>
    </aside>
  );
}
