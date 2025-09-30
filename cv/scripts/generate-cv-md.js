#!/usr/bin/env node
'use strict';

const fs = require('fs/promises');
const path = require('path');
const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const monthYearFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  year: 'numeric'
});

async function main() {
  const cwd = process.cwd();

  const out = process.argv[2];

  if (!out) {
    console.error("Specify destination path");
    process.exit(1);
  }

  const schemaPath = path.resolve(cwd, 'src/cv-data.schema.json');
  const dataPath = path.resolve(cwd, 'src/cv-data.json');
  const outPath = path.resolve(cwd, out);

  const [schema, data] = await Promise.all([
    loadJson(schemaPath),
    loadJson(dataPath)
  ]);

  const ajv = new Ajv({strict: false, allErrors: true});
  addFormats(ajv);

  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    const messages = (validate.errors || []).map(describeAjvError).join('\n');
    throw new Error(`CV data failed schema validation:\n${messages}`);
  }

  const markdown = buildMarkdown(data);

  if (outPath) {
    await fs.writeFile(outPath, markdown, 'utf8');
    console.info(`Markdown written to ${outPath}`);
  } else {
    process.stdout.write(markdown);
  }
}

function describeAjvError(err) {
  const instance = err.instancePath && err.instancePath.length > 0 ? err.instancePath : '(root)';
  return `  - ${instance} ${err.message}`;
}

async function loadJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function buildMarkdown(data) {
  const identity = data.identity || {};
  const sections = [
    frontMatter(identity),
    renderIdentity(identity),
    renderAbout(identity.about),
    renderSnapshot(identity),
    renderSkills(data.skills),
    renderTimeline(data.timeline),
    renderExperiences(data.experiences)
  ];
  return sections.filter(Boolean).join('\n\n') + '\n';
}


function frontMatter(identity) {
  const title = [identity.name, identity.lastname].filter(Boolean).join(' ').trim() || 'Curriculum Vitae';
  return [
    '---',
    `title: ${title}`,
    '---'
  ].join('\n');
}

function renderIdentity(identity) {
  const lines = [];
  const fullName = [identity.name, identity.lastname].filter(Boolean).join(' ').trim();

  lines.push("# Curriculum Vitae")
  lines.push(`## About ${identity.name} ${identity.lastname}`)

  lines.push('<div class="grid cards" markdown>');

  lines.push(`:fontawesome-regular-user: ${fullName}`);

  if (identity.role) {
    lines.push(`:material-briefcase-outline: ${identity.role}`);
  }
  if (identity.experience) {
    lines.push(`:material-calendar-clock: ${identity.experience}`);
  }
  lines.push(":material-email-outline:  [Contact](contact.md)");

  lines.push('</div>');

  return lines.join('\n\n');
}

function formatLinkEntry(entry) {
  const label = entry.label || getDefaultLinkLabel(entry.link);
  const icon = resolveLinkIcon(entry);
  if (icon.type === 'image') {
    return `- ![${label} icon](${icon.value}){ width=18 } [${label}](${entry.link}) \n`;
  }
  return `- ${icon.value} [${label}](${entry.link}) \n`;
}

function resolveLinkIcon(entry) {
  if (entry.ico && /^https?:\/\//i.test(entry.ico)) {
    return {type: 'image', value: entry.ico};
  }
  if (entry.ico) {
    return {type: 'text', value: entry.ico};
  }
  const url = entry.link || '';
  if (/github\.com/i.test(url)) {
    return {type: 'text', value: ':material-github:'};
  }
  if (/linkedin\.com/i.test(url)) {
    return {type: 'text', value: ':material-linkedin:'};
  }
  if (/blog|medium|hashnode/i.test(url)) {
    return {type: 'text', value: ':material-pencil:'};
  }
  return {type: 'text', value: ':material-link:'};
}

function getDefaultLinkLabel(targetUrl) {
  try {
    const hostname = new URL(targetUrl).hostname;
    return hostname.replace(/^www\./i, '');
  } catch (err) {
    return targetUrl;
  }
}

function renderAbout(about) {
  const bulletLines = about.join('\n\n');
  return `${bulletLines}`;
}

function renderSnapshot(identity) {
  const cards = [];
  if (Array.isArray(identity.education) && identity.education.length > 0) {
    cards.push(createListCard(':material-school-outline:', 'Education', identity.education));
  }
  if (Array.isArray(identity.trainings) && identity.trainings.length > 0) {
    cards.push(createListCard(':material-certificate-outline:', 'Trainings', identity.trainings));
  }
  if (Array.isArray(identity.personal_projects) && identity.personal_projects.length > 0) {
    cards.push(createListCard(':material-lightbulb-outline:', 'Personal projects', identity.personal_projects));
  }
  if (Array.isArray(identity.languages) && identity.languages.length > 0) {
    const entries = identity.languages.map(lang => `${lang.language} — ${lang.level}`);
    cards.push(createListCard(':material-translate:', 'Languages', entries));
  }
  if (Array.isArray(identity.hobbies) && identity.hobbies.length > 0) {
    cards.push(createListCard(':material-heart-pulse:', 'Hobbies', identity.hobbies));
  }

  if (cards.length === 0) {
    return '';
  }

  return `## Snapshot\n\n<div class="grid cards" markdown>\n${cards.join('\n\n')}\n</div>`;
}

function createListCard(icon, title, entries) {
  const heading = `-   ${icon} **${title}**`;
  if (!Array.isArray(entries) || entries.length === 0) {
    return heading;
  }
  const list = entries.map(item => `    - ${item}`).join('\n');
  return `${heading}\n\n${list}`;
}

function renderSkills(skills) {
  if (!Array.isArray(skills) || skills.length === 0) {
    return '';
  }
  const cards = skills.map(skill => {
    const chips = Array.isArray(skill.items) ? skill.items.map(item => `\`${item}\``).join(' · ') : '';
    return `-   **${skill.category}**\n\n    ${chips}`;
  });

  return `## Skills\n\n<div class="grid cards" markdown>\n${cards.join('\n\n')}\n</div>`;
}

function renderTimeline(timeline) {
  if (!Array.isArray(timeline) || timeline.length === 0) {
    return '';
  }
  const rows = timeline
    .slice()
    .sort((a, b) => (b.year || 0) - (a.year || 0))
    .map(item => {
      const year = item.year || '';
      const role = item.role || '';
      const client = item.client || '';
      return `| ${year} | ${escapePipes(role)} | ${escapePipes(client)} |`;
    })
    .join('\n');

  return `## Timeline\n\n| Year | Role | Client |\n| --- | --- | --- |\n${rows}`;
}

function renderExperiences(experiences) {
  const blocks = experiences
    .slice()
    .sort((a, b) => {
      const aDate = parseMonthYear(a.start_date);
      const bDate = parseMonthYear(b.start_date);
      const aValue = aDate ? (aDate.year * 12 + aDate.month) : 0;
      const bValue = bDate ? (bDate.year * 12 + bDate.month) : 0;
      return bValue - aValue;
    })
    .map(createExperienceBlock);

  return `${blocks.join('\n\n')}`;
}

function createExperienceBlock(exp) {
  const title = escapeQuotes(`${exp.role || 'Role'} · ${exp.client_name || 'Client'}`);
  const lines = [`## ${title}\n\n`];

  if (exp.mission_name) {
    lines.push(`:material-briefcase: **Mission:** ${exp.mission_name}\n`);
  }

  if (exp.mission_image) {
    lines.push(`![${escapeMarkdown(exp.mission_name || 'Mission image')}](${exp.mission_image})\n`);
  }

  const range = formatDateRange(exp.start_date, exp.end_date);
  const duration = formatDuration(exp.start_date, exp.end_date);
  if (range || duration) {
    const durationSuffix = duration ? ` (${duration})` : '';
    lines.push(`:material-calendar: **When:** ${range}${durationSuffix}\n`);
  }

  if (exp.team_size) {
    lines.push(`:material-account-group-outline: **Team size:** ${exp.team_size}\n`);
  }

  if (Array.isArray(exp.mission_description) && exp.mission_description.length > 0) {
    lines.push('**Description**\n\n');
    lines.push(exp.mission_description.join("\n\n"));
    lines.push("\n")
  }

  if (Array.isArray(exp.roles_and_responsibilities) && exp.roles_and_responsibilities.length > 0) {
    lines.push('**Roles & responsibilities**\n');
    lines.push(exp.roles_and_responsibilities.join("\n  "));
    lines.push("\n");
  }

  if (Array.isArray(exp.ecosystem) && exp.ecosystem.length > 0) {
    const tech = exp.ecosystem.map(item => `\`${item}\``).join(' · ');
    lines.push(`:material-cog-outline: **Ecosystem**\n\n${tech}\n`);
  }

  return lines.join('\n');
}

function formatDateRange(start, end) {
  const startLabel = formatMonthYear(start);
  const endLabel = formatMonthYear(end);
  if (!startLabel && !endLabel) {
    return '';
  }
  return `${startLabel || '?'} - ${endLabel || '?'}`;
}

function formatDuration(start, end) {
  const startParts = parseMonthYear(start);
  const endParts = parseMonthYear(end);
  if (!startParts || !endParts) {
    return '';
  }
  const months = (endParts.year - startParts.year) * 12 + (endParts.month - startParts.month) + 1;
  if (months <= 0) {
    return '';
  }
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  const segments = [];
  if (years > 0) {
    segments.push(`${years} yr${years > 1 ? 's' : ''}`);
  }
  if (remainder > 0) {
    segments.push(`${remainder} mo${remainder > 1 ? 's' : ''}`);
  }
  return segments.join(' ');
}

function parseMonthYear(value) {
  if (!value || !/^\d{2}-\d{4}$/.test(value)) {
    return null;
  }
  const [monthStr, yearStr] = value.split('-');
  const month = Number(monthStr);
  const year = Number(yearStr);
  if (!month || !year) {
    return null;
  }
  return {month, year};
}

function formatMonthYear(value) {
  const parts = parseMonthYear(value);
  if (!parts) {
    return '';
  }
  const date = new Date(parts.year, parts.month - 1, 1);
  return monthYearFormatter.format(date);
}

function escapeQuotes(value) {
  return String(value || '').replace(/"/g, '\'');
}

function escapeMarkdown(value) {
  return String(value || '').replace(/[\[\]]/g, '');
}

function escapePipes(value) {
  return String(value || '').replace(/\|/g, '\\|');
}

function formatIndentedList(items) {
  return items.map(item => `    - ${item}`).join('\n');
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
