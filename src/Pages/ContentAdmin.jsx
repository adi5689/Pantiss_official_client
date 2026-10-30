import { useAdminTheme } from '../features/admin/useAdminTheme';
import AdminLogin from '../features/admin/AdminLogin';
import AdminHeader from '../features/admin/AdminHeader';
import '../features/admin/admin-workspace.css';
import { prepareUpload } from '../features/content/upload';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, FileText, BriefcaseBusiness, LayoutGrid } from 'lucide-react';
import { collections, blankRecord, validateContent, isOpen } from '../features/content/model';
import { teamRequest } from '../features/team/api';
import { imageUrl } from '../features/team/model';
import AdminNav from '../features/content/AdminNav';
import ContentDialog from '../features/content/ContentDialog';
import '../features/team/team.css';
import '../features/content/content.css';
export default function ContentAdmin() {
  const {
    resource
  } = useParams();
  const config = Object.hasOwn(collections, resource) ? collections[resource] : null;
  const [session, setSession] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [importing, setImporting] = useState(false);
  const [theme, setTheme] = useAdminTheme();
  const request = useCallback((action, body) => teamRequest(action, body, true, resource), [resource]);
  const load = useCallback(async () => {
    const result = await request('list');
    setRecords((result.members || []).sort((a, b) => Number(a.order) - Number(b.order)));
  }, [request]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setRecords([]);
    setError('');
    setNotice('');
    setQuery('');
    setEditing(null);
    setRemoving(null);
    setImporting(false);
    teamRequest('session').then(async s => {
      if (!active) return;
      setSession(s);
      if (s.authenticated) {
        const data = await request('list');
        if (active) setRecords((data.members || []).sort((a, b) => Number(a.order) - Number(b.order)));
      }
    }).catch(e => {
      if (active) setError(e.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [request]);
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
  const toggleTenderStatus = record => run(async () => {
    const tenderStatus = record.tenderStatus === 'open' ? 'closed' : 'open';
    await request('tender-status', { id: record.id, tenderStatus });
    setRecords(items => items.map(item => item.id === record.id ? { ...item, tenderStatus } : item));
    const expired = record.deadline && record.deadline < new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    setNotice(tenderStatus === 'open' && expired
      ? 'Status saved as Open. Extend the expired deadline in Edit to reopen this tender on the website.'
      : `Tender marked ${tenderStatus === 'open' ? 'Open' : 'Closed'}.`);
  });
  const save = e => {
    e.preventDefault();
    run(async () => {
      const record = validateContent(resource, editing);
      await request('save', record);
      setEditing(null);
      setNotice(record.status === 'published' ? 'Published. Changes appear on the next page load.' : 'Draft saved. This item is hidden from visitors.');
      await load();
    });
  };
  const upload = async (file, field) => {
    if (!file) return;
    await run(async () => {
      const payload = await prepareUpload(file, field.type === 'image' ? 'image' : 'document');
      const result = await request('upload', payload);
      setEditing(record => ({
        ...record,
        [field.key]: result.image
      }));
    });
  };
  if (!config) return <main className="team-admin"><AdminNav /><p className="ta-content">Unknown content section.</p></main>;
  if (!session?.authenticated) return <AdminLogin session={session} error={error} initialSection={resource} onAuthenticated={async next => { setSession(next); await load().catch(e => setError(e.message)); }} />;
  const visible = records.filter(r => (visibility === 'all' || r.status === visibility) && `${r.title} ${r.category || ''} ${r.location || ''}`.toLowerCase().includes(query.toLowerCase()));
  const SectionIcon = resource === 'jobs' ? BriefcaseBusiness : resource === 'impact' ? LayoutGrid : FileText;
  const canEdit = session?.authenticated && session.configured;
  return <main className="team-admin" data-theme={theme}>
    <AdminHeader theme={theme} onThemeChange={() => setTheme(t => t === 'light' ? 'dark' : 'light')} publicPath={config.publicPath} busy={busy} onSignOut={() => run(async () => {
      await teamRequest('logout', {});
      setSession(s => ({ ...s, authenticated: false }));
      setRecords([]);
    })} />
    <AdminNav />
    <div className="ta-content">
      <div className="ta-heading"><div><p className="ta-eyebrow">WEBSITE CONTENT</p><h1>{config.title}<span>.</span></h1><p>{resource === 'jobs' ? 'Connect good people with meaningful work.' : resource === 'tenders' ? 'Clear opportunities. Transparent procurement.' : 'The stories, evidence and ideas behind our work.'}</p></div>{canEdit && <button className="ta-button ta-primary" disabled={busy || loading} onClick={() => {
          setError('');
          setEditing({
            ...blankRecord(resource),
            order: String(records.length + 1)
          });
        }}><Plus size={18} /> Add {config.singular}</button>}</div>
      {error && !editing && !removing && !importing && <p className="ta-alert" role="alert">{error}</p>}
      {notice && <p className="ta-success" role="status">{notice}</p>}
      {loading ? <p role="status">Loading workspace…</p> : !session.configured ? <p className="ta-alert">Google content storage is not connected. Ask your website administrator to connect it before making changes.</p> : <>
      <div className="ta-stats">{[['Total items', records.length], ['Published', records.filter(r => r.status === 'published').length], ['Drafts', records.filter(r => r.status === 'draft').length]].map(([label, n]) => <div key={label}><span>{label}</span><strong>{String(n).padStart(2, '0')}</strong></div>)}<div className="ta-connection"><div><strong>Google Sheets & Drive</strong><span>{config.tab} worksheet · Shared media folder</span></div></div></div>
      <section className="ta-roster" aria-label={config.title}><div className="ta-toolbar"><div className="ta-search"><Search size={18} /><input aria-label="Search content" placeholder="Search titles, categories or locations…" value={query} onChange={e => setQuery(e.target.value)} /></div><select aria-label="Filter visibility" value={visibility} onChange={e => setVisibility(e.target.value)}><option value="all">All visibility</option><option value="published">Published</option><option value="draft">Drafts</option></select><button className="ta-button ta-quiet" disabled={busy} onClick={() => run(load)}>Refresh</button></div>
      {visible.length ? <div className="ta-table-wrap"><table><thead><tr><th>Title</th><th>Category / location</th><th>Visibility</th>{resource === 'tenders' && <th>Tender status</th>}<th>Order</th><th>Actions</th></tr></thead><tbody>{visible.map(record => <tr key={record.id}><td><div className="admin-record-title"><span className="admin-record-icon">{record.image ? <img src={imageUrl(record.image)} alt="" loading="lazy"/> : <SectionIcon size={18} aria-hidden="true"/>}</span><div><strong>{record.title}</strong><small>{record.deadline ? `Deadline: ${record.deadline}` : record.date || config.singular}</small></div></div></td><td>{record.category || record.location}</td><td><span className={`ta-badge ${record.status}`}>{record.status}</span></td>{resource === 'tenders' && <td><button type="button" role="switch" aria-checked={record.tenderStatus === 'open'} aria-label={`Tender status: ${record.title}`} disabled={busy} onClick={() => toggleTenderStatus(record)} className="tender-status-toggle"><span className="tender-switch-track" aria-hidden="true"><span /></span><span>{record.tenderStatus === 'open' ? 'Open' : 'Closed'}</span></button>{!isOpen({ ...record, tenderStatus: 'open' }) && <small>Deadline passed — edit to reopen</small>}</td>}<td>{record.order}</td><td><div className="ta-row-actions"><button className="ta-button ta-quiet" disabled={busy} onClick={() => {
                        setError('');
                        setEditing(record);
                      }}>Edit<span className="ta-sr"> {record.title}</span></button><button className="ta-button ta-quiet ta-danger" disabled={busy} onClick={() => {
                        setError('');
                        setRemoving(record);
                      }}>Remove<span className="ta-sr"> {record.title}</span></button></div></td></tr>)}</tbody></table></div> : <div className="ta-empty"><FileText size={30} /><h2>{records.length ? 'No matching items' : 'Ready for your next update'}</h2><p>{records.length ? 'Try another search or visibility filter.' : 'Add your first item. Its worksheet is created automatically when you save.'}</p>{!records.length && <button className="ta-button" disabled={busy} onClick={() => {
              setError('');
              setImporting(true);
            }}>Import previous content as drafts</button>}</div>}
      <div className="ta-table-footer">{visible.length} of {records.length} items<span>Only published items are sent to public pages.</span></div></section>
      <p className="ta-footnote">Manage the content here or edit the matching worksheet directly.</p></>}
    </div>
    {editing && <ContentDialog title={editing.id ? `Edit ${config.singular}` : `New ${config.singular}`} busy={busy} onClose={() => {
      setEditing(null);
      setError('');
    }}>{error && <p className="ta-alert" role="alert">{error}</p>}<form onSubmit={save}><fieldset className="ta-fields content-fields" disabled={busy}>{config.fields.map(field => <label className={`content-field content-field-${field.type}`} key={field.key}>{field.label}{field.required ? ' *' : ''}
      {field.type === 'select' ? <select required={field.required} value={editing[field.key] || ''} onChange={e => setEditing({
              ...editing,
              [field.key]: e.target.value
            })}>{field.options.map(option => <option key={option} value={option}>{option}</option>)}</select> : field.type === 'textarea' ? <><textarea rows={field.key === 'body' ? 8 : 4} maxLength={20000} required={field.required} value={editing[field.key] || ''} onChange={e => setEditing({
                ...editing,
                [field.key]: e.target.value
              })} />{resource === 'jobs' && <small>One bullet point per line.</small>}</> : <input type={['date', 'number'].includes(field.type) ? field.type : 'text'} min={field.type === 'number' ? 0 : undefined} max={field.type === 'number' ? 100000 : undefined} required={field.required} value={editing[field.key] ?? ''} onChange={e => setEditing({
              ...editing,
              [field.key]: e.target.value
            })} maxLength={2000} />}
      {['image', 'document'].includes(field.type) && <><input type="file" aria-label={`Upload ${field.label}`} accept={field.type === 'image' ? 'image/*' : 'application/pdf'} onChange={e => {
                const file = e.target.files?.[0];
                e.target.value = '';
                upload(file, field);
              }} /><small>{field.type === 'image' ? 'JPEG, PNG or WebP' : 'PDF'} · Up to 2 MB · Uploaded files are publicly viewable.</small>{field.type === 'image' && editing[field.key] && <img className="content-cover-preview" src={imageUrl(editing[field.key])} alt="Cover preview" />}</>}
    </label>)}</fieldset><p className="ta-hint">Draft records are hidden from visitors. Uploads remain in Drive if you cancel or remove an item.</p><div className="ta-dialog-actions"><button type="button" className="ta-button" disabled={busy} onClick={() => {
            setEditing(null);
            setError('');
          }}>Cancel</button><button className="ta-button ta-primary" disabled={busy}>{busy ? 'Saving…' : editing.status === 'published' ? 'Save & publish' : 'Save draft'}</button></div></form></ContentDialog>}
    {removing && <ContentDialog title={`Remove ${config.singular}?`} busy={busy} onClose={() => {
      setRemoving(null);
      setError('');
    }}><p>Remove “{removing.title}” from the website and worksheet? This cannot be undone from this panel. Drive files are kept.</p>{error && <p className="ta-alert" role="alert">{error}</p>}<div className="ta-dialog-actions"><button className="ta-button" disabled={busy} onClick={() => setRemoving(null)}>Cancel</button><button className="ta-button ta-primary" disabled={busy} onClick={() => run(async () => {
          await request('delete', {
            id: removing.id
          });
          setRemoving(null);
          await load();
          setNotice('Item removed.');
        })}>{busy ? 'Removing…' : 'Remove item'}</button></div></ContentDialog>}
    {importing && <ContentDialog title="Import previous content?" busy={busy} onClose={() => {
      setImporting(false);
      setError('');
    }}><p>This copies the previous {config.title.toLowerCase()} into the empty worksheet as drafts. Review dates, links and details before publishing. Existing rows will not be overwritten.</p>{error && <p className="ta-alert" role="alert">{error}</p>}<div className="ta-dialog-actions"><button className="ta-button" disabled={busy} onClick={() => setImporting(false)}>Cancel</button><button className="ta-button ta-primary" disabled={busy} onClick={() => run(async () => {
          await request('seed', {});
          setImporting(false);
          await load();
          setNotice('Imported as drafts. Review each item before publishing.');
        })}>{busy ? 'Importing…' : 'Import as drafts'}</button></div></ContentDialog>}
  </main>;
}
