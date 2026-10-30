// These definitions drive both server validation and the admin form.
const field = (key, label, type = 'text', required = false, options) => ({
  key,
  label,
  type,
  required,
  options
});
const visibility = [field('order', 'Display order', 'number', true), field('status', 'Visibility', 'select', true, ['draft', 'published'])];
export const impactCategories = ['Dashboards & Data Analytics', 'Insights', 'Impact Reports', 'Publications', 'Videos', 'Podcasts', 'Fact Sheets'];
export const collections = {
  jobs: {
    title: 'Job postings',
    singular: 'job posting',
    tab: 'Jobs',
    publicPath: '/careers/jobs',
    fields: [field('title', 'Job title', 'text', true), field('category', 'Career area', 'text', true), field('location', 'Location', 'text', true), field('type', 'Employment type', 'select', true, ['Full-time', 'Part-time', 'Contract', 'Internship', 'Consultancy']), field('salaryRange', 'Salary / compensation'), field('googleFormLink', 'Application URL or email link', 'url', true), field('deadline', 'Application deadline', 'date'), field('jobStatus', 'Recruitment status', 'select', true, ['open', 'closed']), ...['description', 'qualifications', 'experience', 'benefits', 'skills', 'contact', 'applyNote'].map(key => field(key, {
      description: 'Responsibilities',
      qualifications: 'Qualifications',
      experience: 'Experience',
      benefits: 'Benefits',
      skills: 'Skills',
      contact: 'Contact details',
      applyNote: 'Application instructions'
    }[key], 'textarea', key === 'description')), field('document', 'Job description PDF', 'document'), ...visibility]
  },
  tenders: {
    title: 'Tenders',
    singular: 'tender',
    tab: 'Tenders',
    publicPath: '/tenders',
    fields: [field('title', 'Tender title', 'text', true), field('location', 'Location', 'text', true), field('startDate', 'Published date', 'date', true), field('deadline', 'Submission deadline', 'date', true), field('tenderStatus', 'Tender status', 'select', true, ['open', 'closed']), field('description', 'Summary / instructions', 'textarea'), field('link', 'Tender notice PDF or URL', 'document', true), ...visibility]
  },
  impact: {
    title: 'Our Impact',
    singular: 'impact item',
    tab: 'Impact',
    publicPath: '/impact',
    fields: [field('title', 'Title', 'text', true), field('category', 'Section', 'select', true, impactCategories), field('description', 'Summary', 'textarea'), field('body', 'Full article / story', 'textarea'), field('image', 'Cover image', 'image'), field('date', 'Publication date', 'date'), field('link', 'Read / watch / download URL', 'document'), field('availability', 'Availability', 'select', true, ['available', 'coming-soon']), field('featured', 'Featured item', 'select', true, ['no', 'yes']), ...visibility]
  }
};
export function contentColumns(resource) {
  return ['id', ...collections[resource].fields.map(f => f.key)];
}
export function blankRecord(resource) {
  return Object.fromEntries(collections[resource].fields.map(f => [f.key, f.key === 'status' ? 'draft' : f.type === 'select' ? f.options[0] : f.type === 'number' ? '0' : '']));
}
export function safeLink(value, {
  email = false,
  local = true
} = {}) {
  if (!value) return true;
  if (local && /^\/(?!\/)[\w/ .?=&%#-]+$/.test(value)) return true;
  if (email && /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}
export function validateContent(resource, input) {
  const config = collections[resource];
  if (!config) throw new Error('Unknown content section.');
  const record = {
    id: String(input.id || '').trim()
  };
  for (const f of config.fields) {
    const value = String(input[f.key] ?? '').trim();
    if (f.required && !value) throw new Error(`${f.label} is required.`);
    if (value.length > (f.type === 'textarea' ? 20000 : 2000)) throw new Error(`${f.label} is too long.`);
    if (f.type === 'select' && !f.options.includes(value)) throw new Error(`Choose a valid ${f.label.toLowerCase()}.`);
    if (['url', 'document', 'image'].includes(f.type) && !safeLink(value, {
      email: resource === 'jobs' && f.key === 'googleFormLink'
    })) throw new Error(`${f.label} must use HTTPS${f.key === 'googleFormLink' ? ' or mailto:' : ' or a local file path'}.`);
    if (f.type === 'date' && value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || new Date(value).toISOString().slice(0, 10) !== value)) throw new Error(`${f.label} must be a valid YYYY-MM-DD date.`);
    if (f.type === 'number' && (!Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > 100000)) throw new Error('Display order must be from 0 to 100000.');
    record[f.key] = value;
  }
  if (resource === 'tenders' && record.deadline < record.startDate) throw new Error('Deadline must be on or after the published date.');
  if (resource === 'impact' && record.status === 'published' && record.availability === 'available' && !record.link && !record.body) throw new Error('Add a destination URL or full article before publishing an available item.');
  return record;
}
export function isOpen(record, now = new Date()) {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
  return (record.jobStatus || record.tenderStatus) === 'open' && (!record.deadline || record.deadline >= today);
}
export function displayDate(value) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : '';
}
