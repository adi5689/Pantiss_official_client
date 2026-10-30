export const departments = [['founders', 'Founders'], ['foundersOffice', 'Founders Office'], ['leadership', 'Leadership & Strategy'], ['projectManagement', 'Project Management'], ['monitoring', 'Monitoring, Evaluation & Compliances'], ['finance', 'Finance, HR & Communication'], ['knowledge', 'Knowledge Management & Analytics'], ['region', 'Regional/State Operations']];
export const subDepartments = ['Finance', 'Human Resources', 'Communication'];
export const columns = ['id', 'name', 'title', 'image', 'department', 'subDept', 'region', 'order', 'status'];
export function driveImageId(value = '') {
  try {
    const url = new URL(value);
    if (url.hostname !== 'drive.google.com') return '';
    const id = url.pathname.match(/^\/file\/d\/([\w-]+)/)?.[1] || url.searchParams.get('id') || '';
    return /^[\w-]{1,200}$/.test(id) ? id : '';
  } catch { return ''; }
}
export function normalizeImageUrl(value = '') {
  const id = driveImageId(value);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w800` : value;
}
export function imageUrl(value = '') {
  const id = driveImageId(value);
  return id ? `/api/team?action=image&id=${encodeURIComponent(id)}` : value;
}
export function validateMember(input) {
  const member = Object.fromEntries(columns.map(key => [key, String(input[key] ?? '').trim()]));
  if (!member.name || member.name.length > 120 || !member.title || member.title.length > 240) throw new Error('Enter a name (up to 120 characters) and role (up to 240 characters).');
  if (!departments.some(([key]) => key === member.department)) throw new Error('Choose a valid department.');
  if (!['draft', 'published'].includes(member.status)) throw new Error('Choose a valid publication status.');
  if (member.department === 'finance' && !subDepartments.includes(member.subDept)) throw new Error('Choose a finance, HR or communication group.');
  if (member.department === 'region' && (!member.region || member.region.length > 80)) throw new Error('Enter a state or region.');
  member.image = normalizeImageUrl(member.image);
  if (member.image && !(/^https:\/\/[^\s]+$/.test(member.image) || /^\/assets\/[\w/ .-]+$/.test(member.image))) throw new Error('Use an HTTPS image URL or upload a photo.');
  if (member.status === 'published' && !member.image) throw new Error('Add a photo before publishing.');
  if (!Number.isInteger(Number(member.order)) || Number(member.order) < 0 || Number(member.order) > 100000) throw new Error('Display order must be a whole number from 0 to 100000.');
  if (member.department !== 'finance') member.subDept = '';
  if (member.department !== 'region') member.region = '';
  return member;
}
