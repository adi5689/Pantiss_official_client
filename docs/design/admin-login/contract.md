# Shared admin login design contract

Purpose: authorized Pantiss staff sign in once and enter Team, Jobs, Tenders or Our Impact. The footer and /admin route open /admin/login; direct section URLs show the same login with the requested destination selected.

Local reference: the supplied screenshot shows a team-specific headline, fake text logo, unrelated team navigation and a tall empty layout. Replace those with the real public/assets/pantiss_logo.png, a compact two-column staff workspace entry, and a functional four-section destination chooser. Keep the existing password/session API and server authorization.

Tone: quiet, editorial, practical. Neutral surfaces and a restrained red primary action; actual logo retains its green/red identity. No stock imagery or decorative motion. Use shared CSS tokens and existing Lucide icons. Shared brand component also appears in the authenticated workspace headers.

Hierarchy: logo and website return; section choice; welcome heading; password; submit; protected staff-access note. Desktop 1280x720 and mobile 390x844 must fit readable text without horizontal overflow. Mobile sections collapse to a compact two-column chooser above the form. Light/dark themes, visible focus, minimum 44px controls, connected labels/errors, show/hide password and reduced-motion support.

States: loading disables authentication while checking configuration; empty password uses native required validation; error shows inline recovery feedback; partial Google setup allows authenticated access with each section's existing configuration message; success routes to the chosen section; permission failure shows an admin configuration message without exposing credentials. Exercise the available states in an isolated fixture; do not change real Google content.

Expanded scope: all authenticated admin sections share a proper logo header, quiet desktop sidebar, compact mobile navigation, separate summary cards, searchable content tables with avatars/media thumbnails, and wider two-column content editors. Preserve row actions, drafts/publishing, Google uploads and tender toggles. Theme preference persists across sections. Review a long tender title and the job editor at desktop and mobile sizes; scope changes must not touch live Google data.
