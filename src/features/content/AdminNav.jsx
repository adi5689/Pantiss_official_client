import { NavLink, Link } from 'react-router-dom';
import { ArrowUpRight, BriefcaseBusiness, FileText, LayoutGrid, ShieldCheck, Users } from 'lucide-react';
const sections = [['team', 'Team directory', Users], ['jobs', 'Job postings', BriefcaseBusiness], ['tenders', 'Tenders', FileText], ['impact', 'Our Impact', LayoutGrid]];
export default function AdminNav() {
  return <nav className="content-admin-nav" aria-label="Manage website content"><p className="admin-nav-label">WORKSPACE</p><div className="admin-nav-items">{sections.map(([key, label, Icon]) => <NavLink key={key} to={`/admin/${key}`} className={({
        isActive
      }) => isActive ? 'active' : ''}><Icon size={18} aria-hidden="true" /><span>{label}</span><span className="admin-nav-active-dot" aria-hidden="true" /></NavLink>)}</div><div className="admin-nav-bottom"><Link to="/">Open website<ArrowUpRight size={14} aria-hidden="true" /></Link><div><ShieldCheck size={16} aria-hidden="true" /><span>Staff workspace<small>Pantiss Foundation</small></span></div></div></nav>;
}
