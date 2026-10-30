# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Team admin

The team directory supports Google Sheets records and Google Drive photos through `/admin/team`. Setup and deployment instructions: [docs/team-admin.md](docs/team-admin.md).

Jobs, tenders and Our Impact are managed in the same workspace and Google spreadsheet. See [docs/content-admin.md](docs/content-admin.md) for admin routes, publishing, deadlines, uploads and optional migration. Teams reads exclusively from the connected Sheet.
