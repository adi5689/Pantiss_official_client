import { useState } from 'react';
import { ArrowUpRight, FileText, Search } from 'lucide-react';
import Hero from '../Components/Publications/Hero';
import { useContent } from '../features/content/useContent';
import ContentState from '../features/content/ContentState';
import ContentDialog from '../features/content/ContentDialog';
import { impactCategories, displayDate, safeLink } from '../features/content/model';
import { imageUrl } from '../features/team/model';
import '../features/team/team.css';
import '../features/content/content.css';
export default function Publications() {
  const {
    records,
    loading,
    error,
    retry
  } = useContent('impact');
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [article, setArticle] = useState(null);
  const visible = records.filter(r => (category === 'All' || r.category === category) && `${r.title} ${r.description}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="impact-page"><Hero />
    <main className="impact-library team-directory" id="impact-library">
      <div className="impact-heading"><div><p className="ta-eyebrow">EVIDENCE. STORIES. CHANGE.</p><h2>Our impact, in focus.</h2><p>Explore the ideas and outcomes shaping stronger communities.</p></div><label className="impact-search"><Search size={18} /><input aria-label="Search impact content" placeholder="Find a story or publication…" value={query} onChange={e => setQuery(e.target.value)} /></label></div>
      <nav className="team-tabs" aria-label="Impact sections">{['All', ...impactCategories].map(label => <button key={label} aria-pressed={category === label} onClick={() => setCategory(label)}>{label}</button>)}</nav>
      <ContentState loading={loading} error={error} retry={retry} empty={!records.length} />
      {!loading && !error && records.length > 0 && (visible.length ? <div className="impact-grid">{visible.map(item => <article key={item.id} className={`impact-card ${item.featured === 'yes' ? 'impact-featured' : ''}`}>
        <div className="impact-cover">{item.image ? <img src={imageUrl(item.image)} alt="" loading="lazy" /> : <FileText size={40} aria-hidden="true" />}{item.featured === 'yes' && <span className="impact-featured-label">Featured</span>}</div>
        <div className="impact-card-copy"><div className="impact-meta"><span>{item.category}</span>{item.date && <time dateTime={item.date}>{displayDate(item.date)}</time>}</div><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}
        {item.availability === 'coming-soon' ? <span className="impact-coming">Coming soon</span> : item.body ? <button className="ta-button" onClick={() => setArticle(item)}>Read story <ArrowUpRight size={16} /></button> : item.link && safeLink(item.link) ? <a className="ta-button" href={item.link} target={item.link.startsWith('/') ? undefined : '_blank'} rel="noopener noreferrer">{['Videos', 'Podcasts'].includes(item.category) ? 'Watch / listen' : 'Explore'} <ArrowUpRight size={16} /></a> : null}</div>
      </article>)}</div> : <p className="team-empty">No results. Try another search or section.</p>)}
    </main>
    {article && <ContentDialog title={article.title} onClose={() => setArticle(null)}><div className="impact-article">{article.date && <p>{displayDate(article.date)}</p>}{article.body.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}{article.link && safeLink(article.link) && <a className="ta-button" href={article.link} target="_blank" rel="noopener noreferrer">Open related resource <ArrowUpRight size={16} /></a>}</div></ContentDialog>}
  </div>;
}
