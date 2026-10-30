import { useEffect, useState } from 'react';
import { departments, imageUrl } from '../../../features/team/model';
import { teamRequest } from '../../../features/team/api';
import '../../../features/team/team.css';
export default function TeamTabs() {
  const [activeTab, setActiveTab] = useState('founders');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    teamRequest().then(data => {
      if (active) {
        if (!data.configured) throw new Error('Team directory is not configured.');
        setMembers(data.members ?? []);
        setFailed(false);
      }
    }).catch(() => {
      if (active) { setMembers([]); setFailed(true); }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [attempt]);
  const filtered = members.filter(m => m.department === activeTab && m.status === 'published').sort((a, b) => Number(a.order) - Number(b.order));
  const grouped = ['finance', 'region'].includes(activeTab);
  const groups = grouped ? [...new Set(filtered.map(m => (activeTab === 'finance' ? m.subDept : m.region) || 'Other'))] : [''];
  return <section className="team-directory" aria-label="Our team">
    <div className="team-tabs" role="group" aria-label="Team departments">
      {departments.map(([key, label]) => <button key={key} aria-pressed={key === activeTab} onClick={() => setActiveTab(key)}>{label}</button>)}
    </div>
    {failed && <p className="team-notice" role="status">The team directory is temporarily unavailable. <button onClick={() => setAttempt(a => a + 1)}>Retry</button></p>}
    {loading ? <div className="team-grid" aria-label="Loading team" aria-busy="true">{[1, 2, 3].map(i => <div className="team-skeleton" key={i} />)}</div> : failed ? null : filtered.length ? groups.map(group => <div key={group} className="team-group">
      {group && <h2>{group}</h2>}
      <div className="team-grid">{filtered.filter(m => !grouped || ((activeTab === 'finance' ? m.subDept : m.region) || 'Other') === group).map(member => <article className="team-person" key={member.id}>
        <div className="team-photo"><img key={member.image} src={imageUrl(member.image)} alt={member.name} loading="lazy" onLoad={e => { e.currentTarget.style.display = ""; }} onError={e => {
              e.currentTarget.style.display = 'none';
            }} /><span aria-hidden="true">{member.name.split(' ').slice(-2).map(n => n[0]).join('')}</span></div>
        <div className="team-person-copy"><h3>{member.name}</h3><p>{member.title}</p></div>
      </article>)}</div>
    </div>) : <p className="team-empty">Team updates are coming soon.</p>}
  </section>;
}
