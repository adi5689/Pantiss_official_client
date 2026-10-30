import { prepareUpload } from '../features/content/upload';
import AdminNav from '../features/content/AdminNav';
import '../features/content/content.css';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, ImagePlus, LogOut, Plus, Search, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { departments, imageUrl, subDepartments, validateMember } from '../features/team/model';
import { teamRequest } from '../features/team/api';
import '../features/team/team.css';
const blank = {
  name: '',
  title: '',
  department: 'founders',
  subDept: '',
  region: '',
  image: '',
  order: 0,
  status: 'draft'
};
export default function TeamAdmin() {
  const [session, setSession] = useState(null);
  const [password, setPassword] = useState('');
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('all');
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [theme, setTheme] = useState('light');
  const editor = useRef(null);
  const trigger = useRef(null);
  const load = async () => {
    const data = await teamRequest('list', undefined, true);
    setMembers(data.members || []);
  };
  useEffect(() => {
    teamRequest('session').then(setSession).catch(e => setError(e.message));
  }, []);
  useEffect(() => {
    if (session?.authenticated) load().catch(e => setError(e.message));
  }, [session?.authenticated]);
  const dialogOpen = Boolean(editing || removing);
  useEffect(() => {
    if (!dialogOpen) return;
    trigger.current = document.activeElement;
    editor.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
      trigger.current?.focus();
    };
  }, [dialogOpen]);
  const run = async task => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await task();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const login = e => {
    e.preventDefault();
    run(async () => {
      await teamRequest('login', {
        password
      });
      setPassword('');
      setSession(await teamRequest('session'));
    });
  };
  const save = e => {
    e.preventDefault();
    run(async () => {
      const member = validateMember(editing);
      await teamRequest('save', member);
      await load();
      setEditing(null);
      setNotice(member.status === 'published' ? 'Member published. The team page is up to date.' : 'Draft saved. This member is hidden from the team page.');
    });
  };
  const upload = e => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    run(async () => {
      const payload = await prepareUpload(file);
      const result = await teamRequest('upload', payload);
      setEditing(m => ({
        ...m,
        image: result.image
      }));
    });
  };
  const close = () => {
    if (!busy) {
      setEditing(null);
      setRemoving(null);
      setError('');
    }
  };
  const trapFocus = e => {
    if (e.key === 'Escape') close();
    if (e.key !== 'Tab') return;
    const nodes = [...e.currentTarget.querySelectorAll('button,input,select,a[href]')].filter(n => !n.disabled);
    const first = nodes[0],
      last = nodes.at(-1);
    if (e.shiftKey && (document.activeElement === first || document.activeElement === editor.current)) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  };
  const visible = members.filter(m => (department === 'all' || m.department === department) && `${m.name} ${m.title}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => Number(a.order) - Number(b.order));
  return <main className="team-admin" data-theme={theme}>
    <header className="ta-header"><Link to="/" className="ta-brand">P<span>ANTISS</span><small>Workspace</small></Link><div className="ta-header-actions"><button className="ta-button ta-quiet" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>{theme === 'light' ? 'Dark' : 'Light'} mode</button><Link className="ta-button ta-quiet" to="/whoweare/team">View website <ArrowUpRight size={16} /></Link>{session?.authenticated && <button className="ta-icon" aria-label="Sign out" disabled={busy} onClick={() => run(async () => {
          await teamRequest('logout', {});
          setSession(s => ({
            ...s,
            authenticated: false
          }));
          setMembers([]);
        })}><LogOut size={18} /></button>}</div></header>
    <AdminNav />
    {!session?.authenticated ? <div className="ta-login"><div className="ta-symbol"><Users size={26} /></div><p className="ta-eyebrow">PANTISS ADMIN</p><h1>Your people.<br />One place.</h1><p>Manage the people behind our impact.</p>{session === null && !error ? <p role="status">Checking access…</p> : <form onSubmit={login}><label htmlFor="admin-password">Admin password</label><input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /><button className="ta-button ta-primary" disabled={busy || !session?.authConfigured}>{busy ? 'Signing in…' : 'Sign in to workspace'} <ArrowUpRight size={16} /></button></form>}{session && !session.authConfigured && <p className="ta-alert">Admin access needs server configuration. See docs/team-admin.md.</p>}{error && <p className="ta-alert" role="alert">{error}</p>}<Link className="ta-back" to="/whoweare/team"><ArrowLeft size={15} /> Back to our team</Link></div> : <div className="ta-content">
      <div className="ta-heading"><div><p className="ta-eyebrow">PEOPLE & CULTURE</p><h1>Our team<span>.</span></h1><p>A living directory of the people moving Pantiss forward.</p></div><button className="ta-button ta-primary" disabled={!session.configured || busy} onClick={() => {
          setError('');
          setEditing({
            ...blank,
            order: members.length + 1
          });
        }}><Plus size={18} /> Add member</button></div>
      {!session.configured && <div className="ta-alert">Connect Google Sheets and Drive using the server settings in docs/team-admin.md. The public team directory displays an unavailable state until connected.</div>}
      {error && !editing && !removing && <p className="ta-alert" role="alert">{error}</p>}{notice && <p className="ta-success" role="status"><Check size={16} />{notice}</p>}
      <div className="ta-stats">{[['Total members', members.length], ['Published', members.filter(m => m.status === 'published').length], ['Drafts', members.filter(m => m.status === 'draft').length]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value.toString().padStart(2, '0')}</strong></div>)}<div className="ta-connection"><span className={session.configured ? 'ta-dot' : ''} /><div><strong>{session.configured ? 'Google connected' : 'Setup required'}</strong><span>Sheets directory · Drive photos</span></div></div></div>
      <section className="ta-roster" aria-label="Team directory"><div className="ta-toolbar"><div className="ta-search"><Search size={18} /><input aria-label="Search team" placeholder="Search people or roles…" value={query} onChange={e => setQuery(e.target.value)} /></div><select aria-label="Filter department" value={department} onChange={e => setDepartment(e.target.value)}><option value="all">All departments</option>{departments.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><button className="ta-button ta-quiet" disabled={busy} onClick={() => run(load)}>Refresh</button></div>
        {visible.length ? <div className="ta-table-wrap"><table><thead><tr><th>Team member</th><th>Department</th><th>Status</th><th>Order</th><th><span className="ta-sr">Actions</span></th></tr></thead><tbody>{visible.map(m => <tr key={m.id}><td><div className="ta-member"><div className="ta-avatar">{m.image ? <img src={imageUrl(m.image)} alt="" loading="lazy" /> : <Users size={20} />}</div><div><strong>{m.name}</strong><span>{m.title}</span></div></div></td><td><span className="ta-department">{departments.find(([key]) => key === m.department)?.[1] || m.department}</span><small>{m.subDept || m.region}</small></td><td><span className={`ta-badge ${m.status}`}>{m.status === 'published' ? 'Published' : 'Draft'}</span></td><td>{m.order}</td><td><div className="ta-row-actions"><button className="ta-button ta-quiet" disabled={busy} onClick={() => {
                      setError('');
                      setEditing(m);
                    }}>Edit<span className="ta-sr"> {m.name}</span></button><button className="ta-button ta-quiet ta-danger" disabled={busy} onClick={() => {
                      setError('');
                      setRemoving(m);
                    }}>Remove<span className="ta-sr"> {m.name}</span></button></div></td></tr>)}</tbody></table></div> : <div className="ta-empty"><Users size={32} /><h2>{query || department !== 'all' ? 'No matching people' : 'A place for your people'}</h2><p>{query || department !== 'all' ? 'Try another search or department.' : 'Add your first member or import the existing website roster.'}</p>{!members.length && session.configured && <button className="ta-button" disabled={busy} onClick={() => run(async () => {
            await teamRequest('seed', {});
            await load();
            setNotice('Existing team imported and published.');
          })}>{busy ? 'Importing…' : 'Import existing roster'}</button>}</div>}
        <div className="ta-table-footer">{visible.length} of {members.length} members <span>Published changes appear on the next team page load.</span></div>
      </section><p className="ta-footnote">Built around people. Managed with care.</p>
    </div>}
    {(editing || removing) && <div className="ta-overlay" onClick={e => {
      if (e.target === e.currentTarget) close();
    }}><section className="ta-dialog" role="dialog" aria-modal="true" aria-labelledby="editor-title" ref={editor} tabIndex={-1} onKeyDown={trapFocus}><div className="ta-dialog-heading"><div><p className="ta-eyebrow">TEAM DIRECTORY</p><h2 id="editor-title">{removing ? 'Remove member?' : editing.id ? 'Edit team member' : 'Welcome someone new'}</h2></div><button className="ta-icon" aria-label="Close dialog" disabled={busy} onClick={close}><X size={20} /></button></div>
      {error && <p className="ta-alert" role="alert">{error}</p>}
      {removing ? <><p>Remove {removing.name} from the directory? Their Drive photo will be kept. This cannot be undone from this panel.</p><div className="ta-dialog-actions"><button className="ta-button" disabled={busy} onClick={close}>Cancel</button><button className="ta-button ta-primary" disabled={busy} onClick={() => run(async () => {
              await teamRequest('delete', {
                id: removing.id
              });
              await load();
              setRemoving(null);
              setNotice('Member removed.');
            })}>{busy ? 'Removing…' : 'Remove member'}</button></div></> : <form onSubmit={save}><fieldset disabled={busy} className="ta-fields"><div className="ta-photo-edit"><div className="ta-avatar ta-avatar-large">{editing.image ? <img src={imageUrl(editing.image)} alt="Member preview" /> : <Users size={26} />}</div><div><label className="ta-button ta-upload"><ImagePlus size={16} /> Upload photo<input type="file" accept="image/*" onChange={upload} /></label><small>Images · Up to 2 MB · Converted when needed</small></div></div>
      <label>Photo URL<input type="text" value={editing.image} placeholder="Or paste a Google Drive share link" onChange={e => setEditing({
                ...editing,
                image: e.target.value
              })} /></label>
      <div className="ta-form-grid"><label>Full name<input required maxLength={120} value={editing.name} onChange={e => setEditing({
                  ...editing,
                  name: e.target.value
                })} placeholder="e.g. Ms. Priya Sharma" /></label><label>Role / designation<input required maxLength={240} value={editing.title} onChange={e => setEditing({
                  ...editing,
                  title: e.target.value
                })} placeholder="e.g. Programme Lead" /></label></div>
      <label>Department<select value={editing.department} onChange={e => setEditing({
                ...editing,
                department: e.target.value,
                subDept: e.target.value === 'finance' ? 'Finance' : ''
              })}>{departments.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      {editing.department === 'finance' && <label>Group<select value={editing.subDept} onChange={e => setEditing({
                ...editing,
                subDept: e.target.value
              })}>{subDepartments.map(label => <option key={label}>{label}</option>)}</select></label>}
      {editing.department === 'region' && <label>State / region<input required maxLength={80} value={editing.region} onChange={e => setEditing({
                ...editing,
                region: e.target.value
              })} placeholder="e.g. Odisha" /></label>}
      <div className="ta-form-grid"><label>Display order<input type="number" min="0" max="100000" required value={editing.order} onChange={e => setEditing({
                  ...editing,
                  order: e.target.value
                })} /></label><label>Visibility<select value={editing.status} onChange={e => setEditing({
                  ...editing,
                  status: e.target.value
                })}><option value="draft">Draft — hidden</option><option value="published">Published — visible</option></select></label></div>
      <p className="ta-hint">Published members appear on the website immediately after saving. Use a draft to prepare changes privately. Drive photos must allow public viewing.</p></fieldset><div className="ta-dialog-actions"><button type="button" className="ta-button" disabled={busy} onClick={close}>Cancel</button><button className="ta-button ta-primary" disabled={busy}>{busy ? 'Saving…' : editing.status === 'published' ? 'Save & publish' : 'Save draft'}</button></div></form>}
    </section></div>}
  </main>;
}
