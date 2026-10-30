import { useAdminTheme } from './useAdminTheme';
/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, Eye, EyeOff, FileText, LayoutGrid, LockKeyhole, Moon, ShieldCheck, Sun, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { teamRequest } from '../team/api';
import AdminBrand from './AdminBrand';
import '../team/team.css';
import './admin-login.css';
const sections = [{
  key: 'team',
  label: 'Team',
  description: 'People, roles and departments',
  icon: Users
}, {
  key: 'jobs',
  label: 'Job postings',
  description: 'Opportunities to join our mission',
  icon: BriefcaseBusiness
}, {
  key: 'tenders',
  label: 'Tenders',
  description: 'Procurement notices and deadlines',
  icon: FileText
}, {
  key: 'impact',
  label: 'Our Impact',
  description: 'Stories, reports and publications',
  icon: LayoutGrid
}];
export default function AdminLogin({
  session: providedSession,
  onAuthenticated,
  initialSection = 'team',
  error: providedError = ''
}) {
  const navigate = useNavigate();
  const [session, setSession] = useState(providedSession ?? null);
  const [section, setSection] = useState(initialSection);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useAdminTheme();
  const [capsLock, setCapsLock] = useState(false);
  useEffect(() => {
    setError(providedError);
  }, [providedError]);
  useEffect(() => {
    if (providedSession !== undefined) setSession(providedSession);
  }, [providedSession]);
  useEffect(() => {
    if (providedSession !== undefined) return;
    let active = true;
    teamRequest('session').then(data => {
      if (active) setSession(data);
    }).catch(() => {
      if (active) setError('We couldn’t check your access. Please try again.');
    });
    return () => {
      active = false;
    };
  }, [providedSession]);
  const retry = async () => {
    setError('');
    setBusy(true);
    try {
      setSession(await teamRequest('session'));
    } catch {
      setError('Unable to reach the workspace. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };
  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (!session?.authenticated) await teamRequest('login', {
        password
      });
      const next = await teamRequest('session');
      if (!next.authenticated) throw new Error('Your session could not be established. Please sign in again.');
      setPassword('');
      setSession(next);
      await onAuthenticated?.(next);
      navigate(`/admin/${section}`, {
        replace: true
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const selected = sections.find(item => item.key === section) || sections[0];
  const displayedError = error;
  return <main className="team-admin admin-login" data-theme={theme}>
    <header className="auth-header"><AdminBrand /><div className="auth-header-actions"><button className="ta-icon" type="button" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}</button><Link to="/" className="auth-back"><ArrowLeft size={15} aria-hidden="true" />Back to website</Link></div></header>
    <div className="auth-layout">
      <section className="auth-context" aria-labelledby="auth-context-title"><p className="auth-eyebrow">PANTISS FOUNDATION · ADMINISTRATION</p><h1 id="auth-context-title">Your website.<br /><span>One workspace.</span></h1><p className="auth-description">Keep the people, opportunities and stories behind our work up to date.</p>
        <div className="auth-sections" role="group" aria-label="Choose a section to open after sign-in">{sections.map(({
            key,
            label,
            description,
            icon: Icon
          }) => <button key={key} type="button" className="auth-section" aria-pressed={section === key} disabled={busy} onClick={() => setSection(key)}><span className="auth-section-icon"><Icon size={20} aria-hidden="true" /></span><span className="auth-section-text"><strong>{label}</strong><small>{description}</small></span><span className="auth-selection" aria-hidden="true">{section === key ? <Check size={16} /> : <ArrowRight size={16} />}</span></button>)}</div>
        <div className="auth-context-note"><ShieldCheck size={18} aria-hidden="true" /><p>One sign-in. Access to all four sections.</p></div>
      </section>
      <section className="auth-form-panel" aria-labelledby="auth-form-title"><div className="auth-form-content"><div className="auth-lock"><LockKeyhole size={23} aria-hidden="true" /></div><p className="auth-eyebrow">AUTHORIZED STAFF ACCESS</p><h2 id="auth-form-title">Welcome back.</h2><p className="auth-form-intro">Sign in to manage the Pantiss website.</p>
        <form onSubmit={submit} aria-busy={busy}><div className="auth-destination"><selected.icon size={16} aria-hidden="true" /><span>Opening <strong>{selected.label}</strong></span><span className="auth-destination-dot" aria-hidden="true" /></div>
          {!session?.authenticated && <><label htmlFor="workspace-password">Admin password</label><div className="auth-password"><input id="workspace-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} disabled={busy || !session?.authConfigured} aria-invalid={Boolean(displayedError)} aria-describedby={displayedError ? 'auth-login-error' : 'auth-password-help'} onChange={e => {
                  setPassword(e.target.value);
                  setError('');
                }} onKeyUp={e => setCapsLock(e.getModifierState('CapsLock'))} /><button type="button" className="auth-reveal" disabled={busy} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button></div><p id="auth-password-help" className="auth-help">Use the admin password provided by your website administrator.</p>{capsLock && <p className="auth-help" role="status">Caps Lock is on.</p>}</>}
          <div className="auth-feedback" aria-live="polite">{displayedError ? <div id="auth-login-error" className="ta-alert" role="alert">{displayedError}</div> : session === null ? <p role="status">Checking workspace access…</p> : !session.authConfigured ? <p className="ta-alert">Admin access hasn’t been configured. Contact your website administrator.</p> : session.authenticated ? <p className="auth-session"><Check size={15} aria-hidden="true" />You’re already signed in.</p> : null}</div>
          <button className="auth-submit" disabled={busy || !session?.authConfigured}>{busy ? 'Signing in…' : session?.authenticated ? 'Continue to workspace' : 'Sign in to workspace'}<ArrowRight size={18} aria-hidden="true" /></button>
          {session === null && displayedError && <button type="button" className="auth-retry" disabled={busy} onClick={retry}>Try connecting again</button>}
        </form><div className="auth-security"><LockKeyhole size={13} aria-hidden="true" /><span>Protected access for authorized Pantiss staff</span></div>
      </div></section>
    </div><footer className="auth-footer"><span>Pantiss Foundation</span><span>People. Purpose. Progress.</span></footer>
  </main>;
}
