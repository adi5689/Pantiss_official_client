export async function teamRequest(action = 'list', body, admin = false, resource = 'team') {
  const response = await fetch(`/api/team?action=${action}${admin ? '&admin=1' : ''}&resource=${encodeURIComponent(resource)}`, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'same-origin',
    headers: body === undefined ? {} : {
      'Content-Type': 'application/json'
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(30000)
  });
  const data = await response.json().catch(() => {
    throw new Error('The workspace API is unavailable. Run npm run dev or deploy to Vercel.');
  });
  if (!response.ok) throw new Error(data.error || 'Request failed. Please try again.');
  return data;
}
