/* eslint-disable react/prop-types */
import { ArrowUpRight, LogOut, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminBrand from './AdminBrand';
export default function AdminHeader({
  theme,
  onThemeChange,
  publicPath,
  onSignOut,
  busy = false
}) {
  return <header className="ta-header"><AdminBrand /><div className="ta-header-actions"><Link className="ta-button admin-view-page" to={publicPath}>View live page<ArrowUpRight size={15} aria-hidden="true" /></Link><button className="ta-icon" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} onClick={onThemeChange}>{theme === 'light' ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}</button><span className="admin-user-role">Administrator</span><button className="ta-icon" aria-label="Sign out" title="Sign out" disabled={busy} onClick={onSignOut}><LogOut size={17} aria-hidden="true" /></button></div></header>;
}
