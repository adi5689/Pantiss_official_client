# Website content workspace

The existing Google OAuth account, spreadsheet and Drive folder are reused. No new OAuth scopes or environment variables are required.

## Admin pages

`/admin/login` is the shared sign-in for every section. Choose the section to open after signing in. Direct section links show the same login when signed out, and the footer Admin Login shortcut opens this shared entry.

- `/admin/team`: members and photos.
- `/admin/jobs`: careers postings.
- `/admin/tenders`: procurement notices and PDFs.
- `/admin/impact`: articles, dashboards, reports, publications, videos, podcasts and fact sheets.

Sign in once at `/admin/login` with `TEAM_ADMIN_PASSWORD`, then switch sections using the workspace navigation. Sessions are shared across these sections using the existing API. Changes become visible on the next public page load, without a rebuild.

## Worksheets

Team uses the existing `GOOGLE_TEAM_SHEET_TAB` worksheet (normally `Team`). Jobs, tenders and impact use `Jobs`, `Tenders` and `Impact` tabs in `GOOGLE_TEAM_SHEET_ID`. New tabs and headers are created on the first save or optional import. An empty or missing content tab returns an empty list; GET requests never create tabs. Existing incompatible headers produce an error rather than overwriting data.

Keep the ID and header columns intact. When editing directly in Sheets, use `published` or `draft` for visibility, whole numbers for order, and YYYY-MM-DD dates. Published rows must meet the same validation rules as admin forms. Lower display orders appear first. Use one editor at a time and do not sort the sheet during a save; Google Sheets is not a transactional database.

## Jobs

Enter a title, career area, location, employment type, application link, recruitment status, responsibilities and visibility. An application link can be HTTPS (including Google Forms) or a `mailto:` email link. Qualifications, experience, benefits, skills, contact and application instructions use one bullet per line. Optional job description PDFs can be uploaded or linked.

Only published, open jobs appear in the public directory and landing-page counts. An optional deadline closes applications after the end of that date in Asia/Kolkata, even if the sheet still says `open`. The admin workspace retains closed postings so they can be edited or reopened.

## Tenders

Enter a title, location, published date, deadline, open/closed status and notice URL or uploaded PDF. A summary is optional. Dates must be valid, and the deadline cannot precede publication. Publication visibility and open/closed status are separate: a published closed tender remains in the archive. A passed deadline automatically places an open tender in the closed list. The listing and archive use the same worksheet.

## Our Impact

Choose the section, add a title, summary, cover image and optional publication date. Add full article text or a destination link for available published items. Article text is rendered as plain paragraphs, never executable HTML. Links can point to reports in Drive, videos, podcasts, external HTTPS resources, or internal website routes.

Items marked `coming-soon` can be published without a working resource link and show a Coming soon label. A featured item receives a badge. Visitors can search and filter by section. Full articles open in an accessible dialog.

## Media

All sections upload into `GOOGLE_TEAM_DRIVE_FOLDER_ID`. Images support JPEG, PNG and WebP, detected from their contents even if the extension is wrong. Other browser-readable image formats are converted to JPEG before uploading; unsupported formats must be exported as JPEG or PNG. Documents support PDF. Maximum upload size is 2 MB. File signatures and size are checked on the server. Uploads are made publicly viewable so visitors can access them, including uploads attached to drafts. The worksheet itself remains private. Workspace policies must allow public file viewing.

Removing a record or canceling an editor does not delete Drive files, which may be reused by other records. Review unused files in the folder periodically.

## Previous content

The public pages never read historical arrays or use static content as a fallback. Teams now reads exclusively from the connected Sheet, including when that Sheet is empty. Failures display a retry state.

For jobs, tenders and impact, **Import previous content as drafts** is available only for an empty section and asks for confirmation. It copies the old content into the Sheet without publishing it. Review each record and its dates, destinations and accuracy before publishing. Source copies live only on the server in `server/seeds/content.json`, not in the browser bundle.

Existing team migration remains an explicit admin import for an empty roster. It is never a public fallback.

## Validation

Run `node --test tests/*.test.js` and `npm run build`. Configure the Vercel login rate limit described in `docs/team-admin.md` for production. Deploy all new server files along with the client. Keep server credentials in Vercel environment variables, never in `VITE_` variables.
