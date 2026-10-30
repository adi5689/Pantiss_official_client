# Team directory administration

Open `/admin/team` to manage the team. The public page remains at `/whoweare/team`.

## Connect Google

1. In a Google Cloud project enable **Google Sheets API** and **Google Drive API**. Configure an OAuth consent screen and create a Web application OAuth client. This integration uses an authorized Google user, so photos can be uploaded into a normal My Drive folder without service account storage limitations.
2. Authorize the account that owns the team sheet and photo folder for `https://www.googleapis.com/auth/spreadsheets` and `https://www.googleapis.com/auth/drive`. Obtain an **offline refresh token** using your OAuth client (for example, Google OAuth Playground with “Use your own OAuth credentials” and `https://developers.google.com/oauthplayground` as an authorized redirect URI). Keep the token private. For an external OAuth app, move the consent screen out of Testing before production; testing refresh tokensnow i want to  can expire after seven days. Follow Google's consent/verification requirements for your organization.
3. Create a spreadsheet with a worksheet named **Team**. Leave it completely empty to import the website roster, or add these exact headers in A1:I1:

   `id | name | title | image | department | subDept | region | order | status`

   The pipes above represent separate cells. Do not paste them into one cell. Every row needs a unique nonempty ID. Use `published` or `draft` for status, and the department keys listed below. Keep this sheet dedicated to the directory: do not insert columns or sort it while an admin save is in progress.
4. Create a Drive folder for team photos. The authorized account needs write access. Public photo sharing must be permitted by your Google Workspace administrator. Uploaded photos are set to “Anyone with the link: Viewer”; the spreadsheet itself stays private. Existing Drive share links can also be pasted into the photo field, provided the file allows public viewing.
5. Copy `.env.example` settings into `.env.local` for local use and configure the same **server** settings in Vercel:

   - `TEAM_ADMIN_PASSWORD`: a unique password of at least 16 characters.
   - `TEAM_SESSION_SECRET`: a random secret of at least 32 characters; generate with `openssl rand -hex 32`.
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`: OAuth credentials from steps 1–2.
   - `GOOGLE_TEAM_SHEET_ID`: the ID between `/d/` and `/edit` in the spreadsheet URL.
   - `GOOGLE_TEAM_SHEET_TAB`: `Team` (or your worksheet name).
   - `GOOGLE_TEAM_DRIVE_FOLDER_ID`: the ID after `/folders/` in the Drive folder URL.

   **Never use a `VITE_` prefix for these values. Never commit real credentials.**
6. Restart `npm run dev`, or redeploy Vercel after changing settings. Sign in at `/admin/login`, then choose Team. For an empty worksheet, choose **Import existing roster** once to preserve all existing members and photos. Existing local photo URLs remain valid; replacing a photo uploads it to Drive.

## Editing

Add or edit a member, choose a department and optional group/state, set the display order, then save as draft or publish. Lower order values appear first within each department. Published changes appear when visitors next load the team page. A successfully connected empty sheet intentionally displays an empty team directory. The public team page reads only Google Sheets. Without configuration or when Google is unavailable, it displays an unavailable state and Retry button; it never falls back to the old roster. Draft rows are never sent by the public API.

Remove asks for confirmation and clears the member row without shifting other rows. Drive files are retained to avoid deleting an image another member may use. Uploading then canceling also retains the photo; periodically review unused files in the dedicated folder. All uploaded photos become public, including photos attached to drafts. Draft privacy applies to roster records, not image files.

Department keys: `founders`, `foundersOffice`, `leadership`, `projectManagement`, `monitoring`, `finance`, `knowledge`, `region`. Finance groups: `Finance`, `Human Resources`, `Communication`. Regions can use any state label.

## Hosting and access

Vercel deploys `api/team.js` as a Node function; use Node 22 or later. `npm run dev` includes a local adapter for the same API. `vite preview` serves only static assets; use development mode or Vercel to test the admin API.

Sessions use a signed HttpOnly SameSite cookie with an eight-hour expiry, plus origin checks on every write. Rotating the session secret invalidates every session. This panel uses one shared admin password; give it only to trusted editors. For production, configure a Vercel Firewall rate limit on `POST /api/team?action=login` (five attempts per 15 minutes per IP). The built-in limiter protects individual function instances and is not a distributed rate limiter. Use one editor at a time: Sheets does not provide transactional row edits, so simultaneous edits are last-write-wins. Avoid sheet edits/sorting while using the panel.

Google references: [Sheets values](https://developers.google.com/workspace/sheets/api/guides/values), [Drive uploads](https://developers.google.com/workspace/drive/api/guides/manage-uploads), [OAuth web server flow](https://developers.google.com/identity/protocols/oauth2/web-server).
