import { useCallback, useEffect, useState } from 'react';
import { teamRequest } from '../team/api';
export function useContent(resource) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const retry = useCallback(() => setVersion(v => v + 1), []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setRecords([]);
    teamRequest('list', undefined, false, resource).then(data => {
      if (!data.configured) throw new Error('Content is not available yet.');
      if (active) setRecords((data.members || []).sort((a, b) => Number(a.order) - Number(b.order)));
    }).catch(e => {
      if (active) setError(e.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [resource, version]);
  return {
    records,
    loading,
    error,
    retry
  };
}
