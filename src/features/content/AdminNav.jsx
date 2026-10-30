import { NavLink } from 'react-router-dom';
export default function AdminNav() {
  return <nav className="content-admin-nav" aria-label="Manage website content">{[['team', 'Team'], ['jobs', 'Job postings'], ['tenders', 'Tenders'], ['impact', 'Our Impact']].map(([key, label]) => <NavLink key={key} to={`/admin/${key}`} className={({
      isActive
    }) => isActive ? 'active' : ''}>{label}</NavLink>)}</nav>;
}
