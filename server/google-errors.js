// Only fixed, actionable messages reach the browser; never echo Google responses
// that may contain account details, request URLs or credential material.
export class GoogleRequestError extends Error {
  constructor(status, reason, message) {
    super(message);
    this.name = 'GoogleRequestError';
    this.status = status;
    this.reason = reason;
  }
}
export function googleFailure(status, data) {
  const reason = data.error?.errors?.[0]?.reason || data.error?.status || 'unknown';
  const messages = {
    storageQuotaExceeded: 'Google Drive storage is full. Free up space in the connected Google account, then retry the upload.',
    insufficientFilePermissions: 'The connected Google account cannot upload to this Drive folder. Give it Editor access or choose a folder it owns.',
    insufficientPermissions: 'Google authorization is missing Drive permissions. Reauthorize with the Google Drive scope and update the refresh token.',
    accessNotConfigured: 'Enable Google Drive API and Google Sheets API in the OAuth client’s Google Cloud project, then retry.',
    SERVICE_DISABLED: 'Enable Google Drive API and Google Sheets API in the OAuth client’s Google Cloud project, then retry.',
    notFound: 'The configured Google file or folder was not found. Check its ID and the connected account’s access.',
    sharingOutsideDomainNotAllowed: 'Your Google Workspace policy blocks public file sharing. Ask the Workspace administrator to allow viewing website media.',
    domainPolicy: 'Your Google Workspace policy blocks this operation. Ask the Workspace administrator to allow Drive uploads and public media viewing.',
    rateLimitExceeded: 'Google is limiting requests. Wait a moment and retry.',
    userRateLimitExceeded: 'Google is limiting requests. Wait a moment and retry.',
  };
  return new GoogleRequestError(status, reason, messages[reason] || (status === 401 ? 'Google authorization expired or was revoked. Reconnect the Google account.' : 'Google could not complete this request. Check the connected account’s file and folder permissions, then retry.'));
}
