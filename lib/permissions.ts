import { Permission, Role } from './types';
const matrix: Record<Role, Permission[]> = {
  owner:['view_project','manage_project','log_site_update','view_financials','manage_variations','manage_delays','manage_safety','manage_defects','view_client_portal','manage_team','sync_drive','send_emails','view_timesheets','approve_timesheets'],
  admin:['view_project','manage_project','log_site_update','view_financials','manage_variations','manage_delays','manage_safety','manage_defects','view_client_portal','manage_team','sync_drive','send_emails','view_timesheets','approve_timesheets'],
  project_manager:['view_project','manage_project','log_site_update','manage_variations','manage_delays','manage_safety','manage_defects','send_emails','view_timesheets','approve_timesheets'],
  builder:['view_project','manage_project','log_site_update','manage_variations','manage_delays','manage_defects','send_emails','view_timesheets'],
  contractor:['view_project','log_site_update','manage_delays','manage_defects','view_timesheets'],
  subcontractor:['view_project','log_site_update','manage_defects','view_timesheets'],
  architect:['view_project','view_client_portal','send_emails'],
  client:['view_project','view_client_portal'],
  worker:['view_project','log_site_update','manage_safety','view_timesheets'],
  safety_officer:['view_project','log_site_update','manage_safety','manage_defects','send_emails','view_timesheets'],
  finance:['view_project','view_financials','manage_variations','send_emails']
};
export function can(role: Role, permission: Permission){ return matrix[role]?.includes(permission) ?? false; }
export function rolePermissions(role: Role){ return matrix[role] ?? []; }
