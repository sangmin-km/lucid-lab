const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateProjects(projects) {
  if (!Array.isArray(projects)) throw new Error('Projects must be an array.');
  const ids = new Set(), keys = new Set();
  for (const project of projects) {
    for (const field of ['key', 'title', 'projectId', 'investigator', 'institution', 'agency', 'program', 'funding']) {
      if (typeof project[field] !== 'string' || !project[field].trim()) throw new Error(`Missing project field: ${field}`);
    }
    if (!/^[a-zA-Z0-9-]+$/.test(project.key) || keys.has(project.key)) throw new Error('Invalid or duplicate project key.');
    const id = project.projectId.trim().toLowerCase();
    if (ids.has(id)) throw new Error(`Duplicate project ID: ${project.projectId}`);
    if (!validDate(project.startDate) || !validDate(project.endDate) || project.endDate < project.startDate) throw new Error(`Invalid research period: ${project.projectId}`);
    keys.add(project.key); ids.add(id);
  }
}

function groupProjects(projects) {
  validateProjects(projects);
  function dateLabel(value, short) {
    const [year, month, day] = value.split('-').map(Number);
    return short ? `${months[month - 1].slice(0, 3)} ${year}` : `${months[month - 1]} ${day}, ${year}`;
  }
  const sorted = [...projects].sort((a, b) => b.startDate.localeCompare(a.startDate));
  return [...new Set(sorted.map(p => p.startDate.slice(0, 4)))].map(year => ({
    year,
    projects: sorted.filter(p => p.startDate.startsWith(year)).map(p => ({
      ...p,
      subtitle: p.subtitle || '',
      periodShort: `${dateLabel(p.startDate, true)} – ${dateLabel(p.endDate, true)}`,
      periodLong: `${dateLabel(p.startDate, false)} – ${dateLabel(p.endDate, false)}`
    }))
  }));
}
function koreaDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now);
  const value = type => parts.find(part => part.type === type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function groupProjectSections(projects, today = koreaDate()) {
  validateProjects(projects);
  if (!validDate(today)) throw new Error('Invalid reference date.');
  return [
    { id: 'ongoing', title: 'Ongoing Projects', projects: projects.filter(p => p.endDate >= today) },
    { id: 'completed', title: 'Completed Projects', projects: projects.filter(p => p.endDate < today) }
  ].map(section => ({ ...section, years: groupProjects(section.projects) }));
}
module.exports = { validDate, validateProjects, groupProjects, koreaDate, groupProjectSections };
