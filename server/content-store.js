import { google } from './team-store.js';
import { collections, contentColumns } from '../src/features/content/model.js';
const sheetUrl = () => `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(process.env.GOOGLE_TEAM_SHEET_ID)}`;
const json = body => ({
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
});
function range(resource, cells) {
  return `${sheetUrl()}/values/${encodeURIComponent(`'${collections[resource].tab}'!${cells}`)}`;
}
function lastColumn(resource) {
  return String.fromCharCode(64 + contentColumns(resource).length);
}
async function tabExists(resource) {
  const result = await google(`${sheetUrl()}?fields=sheets.properties.title`);
  return result.sheets?.some(s => s.properties.title === collections[resource].tab);
}
export async function readContent(resource) {
  if (!(await tabExists(resource))) return [];
  const {
    values = []
  } = await google(range(resource, `A:${lastColumn(resource)}`));
  const columns = contentColumns(resource);
  if (values.length && columns.some((key, i) => values[0][i] !== key)) throw new Error('Content sheet headers do not match.');
  return values.slice(1).map((row, i) => ({
    ...Object.fromEntries(columns.map((key, j) => [key, row[j] ?? ''])),
    row: i + 2
  })).filter(record => record.id);
}
export async function initializeContent(resource) {
  if (!(await tabExists(resource))) {
    await google(`${sheetUrl()}:batchUpdate`, {
      method: 'POST',
      ...json({
        requests: [{
          addSheet: {
            properties: {
              title: collections[resource].tab
            }
          }
        }]
      })
    });
  }
  const {
    values = []
  } = await google(range(resource, `A1:${lastColumn(resource)}1`));
  const columns = contentColumns(resource);
  if (values.length && columns.some((key, i) => values[0][i] !== key)) throw new Error('Existing worksheet has different headers. Use a dedicated worksheet.');
  if (!values.length) await google(`${range(resource, 'A1')}?valueInputOption=RAW`, {
    method: 'PUT',
    ...json({
      values: [columns]
    })
  });
}
export async function writeContent(resource, record, row) {
  await initializeContent(resource);
  const values = [contentColumns(resource).map(key => record[key] ?? '')];
  return google(row ? `${range(resource, `A${row}:${lastColumn(resource)}${row}`)}?valueInputOption=RAW` : `${range(resource, `A:${lastColumn(resource)}`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: row ? 'PUT' : 'POST',
    ...json({
      values
    })
  });
}
export async function removeContent(resource, row) {
  return google(`${range(resource, `A${row}:${lastColumn(resource)}${row}`)}:clear`, {
    method: 'POST',
    ...json({})
  });
}
export async function importContent(resource, records) {
  await initializeContent(resource);
  return google(`${range(resource, 'A2')}?valueInputOption=RAW`, {
    method: 'PUT',
    ...json({
      values: records.map(record => contentColumns(resource).map(key => record[key] ?? ''))
    })
  });
}
