/* eslint-disable react/prop-types */
import '../team/team.css';
export default function ContentState({
  loading,
  error,
  retry,
  empty = false
}) {
  if (!loading && !error && !empty) return null;
  return <div className="team-directory content-state" role="status" aria-busy={loading}>
    {loading ? <><p>Loading the latest updates…</p><div className="team-grid">{[1, 2, 3].map(i => <div className="team-skeleton" key={i} />)}</div></> : error ? <><p>Updates are temporarily unavailable. Please try again.</p><button className="ta-button" onClick={retry}>Retry</button></> : <p>New updates will appear here when published.</p>}
  </div>;
}
