// Keep root minimal; import child components so they are registered
import './cv-header.js';
import './cv-sidebar.js';
import './cv-main.js';
import './cv-section.js';
import './cv-experiences.js';
import {applyStyles} from "./tools.js";

// Root component
class CV extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this._styleCache = new Map();
  }

  connectedCallback() {
    this._renderShell();
    this._loadAndRender();
  }

  async _loadAndRender() {
    const src = this.getAttribute('data-load-data');
    if (!src) return;
    try {
      const res = await fetch(src, {cache: 'no-store'});
      if (!res.ok) {
        throw new Error(`Failed to load data: ${res.status}`);
      }
      const data = await res.json();
      this._bindData(data);
    } catch (e) {
      this._showError(e);
    }
  }

  _renderShell() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('./cv.css', import.meta.url);
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(link);
    this.shadowRoot.innerHTML += `
      <div class="page">
        <div class="actions">
          <button type="button" data-action="download">Download CV</button>
          <span class="status" data-role="status" hidden></span>
        </div>
        <div class="container">
          <cv-header></cv-header>
          <div class="columns">
            <cv-sidebar></cv-sidebar>
            <cv-main></cv-main>
            <cv-section title="Experiences"><cv-experiences></cv-experiences></cv-section>
          </div>
        </div>
      </div>
    `;

    applyStyles(this);
    this._bindControls();
  }

  _bindData(data) {
    const header = this.shadowRoot.querySelector('cv-header');
    const sidebar = this.shadowRoot.querySelector('cv-sidebar');
    const main = this.shadowRoot.querySelector('cv-main');
    const exps = this.shadowRoot.querySelector('cv-experiences');
    this._data = data;
    header.data = data.identity;
    sidebar.data = data.identity;
    main.data = data;
    if (exps) exps.data = data.experiences || [];
  }

  disconnectedCallback() {
    if (this._downloadBtn) {
      this._downloadBtn.removeEventListener('click', this._onDownload);
    }
  }

  _bindControls() {
    if (this._downloadBtn) {
      this._downloadBtn.removeEventListener('click', this._onDownload);
    }
    this._downloadBtn = this.shadowRoot.querySelector('[data-action="download"]');
    this._statusEl = this.shadowRoot.querySelector('[data-role="status"]');
    this._onDownload = () => this._downloadCV();
    if (this._downloadBtn) {
      this._downloadBtn.addEventListener('click', this._onDownload);
    }
  }

  async _ensureData() {
    if (this._data) return this._data;
    const src = this.getAttribute('data-load-data');
    if (!src) throw new Error('Missing data source');
    const res = await fetch(src, {cache: 'no-store'});
    if (!res.ok) throw new Error(`Failed to load data: ${res.status}`);
    const data = await res.json();
    this._bindData(data);
    return data;
  }

  async _downloadCV() {
    if (this._exporting) return;
    this._exporting = true;
    const btn = this._downloadBtn;
    const status = this._statusEl;
    const originalLabel = btn?.textContent;
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Preparing…';
    }
    if (status) {
      status.hidden = true;
      status.textContent = '';
      status.removeAttribute('data-state');
    }

    try {
      const data = await this._ensureData();
      const styles = await this._collectStyles();
      const html = this._buildStaticHtml(data, styles);
      const blob = new Blob([html], {type: 'text/html'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this._makeFileName(data);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      if (status) {
        status.hidden = false;
        status.textContent = 'Download ready.';
        status.dataset.state = 'ok';
      }
    } catch (err) {
      console.error('Failed to export CV', err);
      if (status) {
        status.hidden = false;
        status.textContent = 'Unable to generate download.';
        status.dataset.state = 'error';
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalLabel;
      }
      this._exporting = false;
    }
  }

  async _collectStyles() {
    const files = [
      ['cv.css', 'cv-root'],
      ['cv-header.css', 'cv-header'],
      ['cv-sidebar.css', 'cv-sidebar'],
      ['cv-main.css', 'cv-main'],
      ['cv-section.css', 'cv-section'],
      ['cv-experiences.css', 'cv-experiences'],
      ['cv-about.css', 'cv-about'],
      ['cv-skills.css', 'cv-skills'],
      ['cv-timeline.css', 'cv-timeline']
    ];

    const pending = files.map(async ([name, scope]) => {
      if (!this._styleCache.has(name)) {
        const url = new URL(`./${name}`, import.meta.url);
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to load style ${name}: ${res.status}`);
        }
        const text = await res.text();
        this._styleCache.set(name, this._scopeStyles(text, scope));
      }
      return this._styleCache.get(name);
    });

    const styles = await Promise.all(pending);
    return styles.join('\n\n');
  }

  _scopeStyles(css, scope) {
    if (scope === 'cv-root') {
      return css
        .replace(/:host/g, '.cv-root')
        .replace(/cv-header/g, '.cv-header')
        .replace(/cv-sidebar/g, '.cv-sidebar')
        .replace(/cv-main/g, '.cv-main')
        .replace(/cv-section/g, '.cv-section')
        .replace(/cv-experiences/g, '.cv-experiences');
    }
    const replacement = scope.startsWith('.') ? scope : `.${scope}`;
    return css.replace(/:host/g, replacement);
  }

  _makeFileName(data) {
    const identity = data?.identity || {};
    const parts = [identity.name, identity.lastname].filter(Boolean);
    const base = parts.join('-') || 'cv';
    return `${base.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'cv'}.html`;
  }

  _buildStaticHtml(data, styles) {
    const identity = data?.identity || {};
    const experiences = Array.isArray(data?.experiences) ? data.experiences : [];
    const about = identity.about || [];
    const skills = Array.isArray(data?.skills) ? data.skills : [];
    const timeline = Array.isArray(data?.timeline) ? data.timeline : [];
    const title = this._escapeHtml([
      identity.name,
      identity.lastname,
      identity.role ? `— ${identity.role}` : ''
    ].filter(Boolean).join(' ')) || 'CV';

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      html, body { margin: 0; padding: 0; background: #f7fafc; font: 14px/1.45 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; }
      a { color: inherit; }
      ${styles}
    </style>
  </head>
  <body>
    <div class="cv-root page">
      <div class="container">
        ${this._renderHeader(identity)}
        <div class="columns">
          ${this._renderSidebar(identity)}
          ${this._renderMain(identity, skills, timeline)}
          ${this._renderExperiences(experiences)}
        </div>
      </div>
    </div>
  </body>
</html>`;
  }

  _renderHeader(identity) {
    const name = [identity?.name, identity?.lastname].filter(Boolean).join(' ');
    const role = identity?.role || '';
    const experience = identity?.experience ? `(${this._escapeHtml(identity.experience)})` : '';
    const contacts = identity?.contacts || {};
    const links = Array.isArray(identity?.links) ? identity.links : [];
    const parts = links.map(link => this._renderLink(link)).join('');

    return `<cv-header class="cv-header">
      <div class="row">
        <div class="who">
          <div class="name">${this._escapeHtml(name)}</div>
          <div class="role">${this._escapeHtml(role)}</div>
          ${experience ? `<div class="exp">${experience}</div>` : ''}
        </div>
        <div class="meta">
          ${contacts.email ? `<span class="chip">📧 <a href="mailto:${this._escapeAttr(contacts.email)}">${this._escapeHtml(contacts.email)}</a></span>` : ''}
          ${contacts.phone ? `<span class="chip">📞 <a href="tel:${this._escapeAttr(contacts.phone)}">${this._escapeHtml(contacts.phone)}</a></span>` : ''}
          ${parts}
        </div>
      </div>
    </cv-header>`;
  }

  _renderLink(link) {
    if (!link || !link.link) return '';
    const ico = this._resolveIco(link.ico);
    let hostname = '';
    try {
      const url = new URL(link.link);
      hostname = url.hostname;
    } catch {
      hostname = link.link;
    }
    return `<span class="chip"><a href="${this._escapeAttr(link.link)}" target="_blank" rel="noopener">${ico}${this._escapeHtml(hostname)}</a></span>`;
  }

  _renderSidebar(identity) {
    const renderList = (arr) => Array.isArray(arr) && arr.length
      ? `<ul>${arr.map(item => `<li>${this._escapeHtml(item)}</li>`).join('')}</ul>`
      : '<ul></ul>';
    const renderLanguages = (arr) => Array.isArray(arr) && arr.length
      ? `<ul>${arr.map(item => `<li>${this._escapeHtml(item.language)} — ${this._escapeHtml(item.level)}</li>`).join('')}</ul>`
      : '<ul></ul>';

    return `<cv-sidebar class="cv-sidebar">
      ${this._renderSection('Education', renderList(identity?.education))}
      ${this._renderSection('Trainings', renderList(identity?.trainings))}
      ${this._renderSection('Personal Projects', renderList(identity?.personal_projects))}
      ${this._renderSection('Languages', renderLanguages(identity?.languages))}
      ${this._renderSection('Hobbies', renderList(identity?.hobbies))}
    </cv-sidebar>`;
  }

  _renderMain(identity, skills, timeline) {
    const about = identity?.about || [];
    const aboutHtml = Array.isArray(about)
      ? about.map(line => `<p>${this._escapeHtml(line)}</p>`).join('')
      : `<p>${this._escapeHtml(String(about || ''))}</p>`;

    const skillsHtml = skills.map(group => `
      <div class="group">
        <div class="cat">${this._escapeHtml(group.category)}</div>
        <div class="items">${(group.items || []).map(item => `<span class="chip">${this._escapeHtml(item)}</span>`).join('')}</div>
      </div>
    `).join('');

    const timelineItems = timeline
      .slice()
      .sort((a, b) => (b.year || 0) - (a.year || 0))
      .map(item => {
        const clients = typeof item.client === 'string'
          ? item.client.split(/,\s*/).filter(Boolean).map(part => this._escapeHtml(part)).join('<br>')
          : '';
        return `<div class="item" role="listitem">
          <div class="year">${this._escapeHtml(item.year)}</div>
          <div class="mark" aria-hidden="true">
            <div class="dot"></div>
          </div>
          <div class="role">${this._escapeHtml(item.role)}</div>
          <div class="client">${clients}</div>
        </div>`;
      }).join('');

    return `<cv-main class="cv-main">
      ${this._renderSection('About', `<div class="cv-about">${aboutHtml}</div>`)}
      ${this._renderSection('Skills', `<div class="cv-skills">${skillsHtml}</div>`)}
      ${this._renderSection('Timeline', `<div class="cv-timeline"><div class="tl" role="list">${timelineItems}</div></div>`)}
    </cv-main>`;
  }

  _renderExperiences(experiences) {
    const items = experiences
      .slice()
      .sort((a, b) => this._rankDate(b.end_date) - this._rankDate(a.end_date) || this._rankDate(b.start_date) - this._rankDate(a.start_date))
      .map(it => {
        const mission = it.mission_name ? `<h3 class="mission">${this._escapeHtml(it.mission_name)}</h3>` : '';
        const description = Array.isArray(it.mission_description)
          ? it.mission_description.map(text => `<p>${this._escapeHtml(text)}</p>`).join('')
          : '';
        const roles = Array.isArray(it.roles_and_responsibilities)
          ? `<ul>${it.roles_and_responsibilities.map(item => `<li>${this._escapeHtml(item)}</li>`).join('')}</ul>`
          : '';
        const ecosystem = Array.isArray(it.ecosystem)
          ? `<div class="chips">${it.ecosystem.map(item => `<span class="chip">${this._escapeHtml(item)}</span>`).join('')}</div>`
          : '';

        return `<div class="item">
          <aside class="meta">
            <div class="role">${this._escapeHtml(it.role)}</div>
            <div class="period">${this._escapeHtml(this._formatPeriod(it.start_date, it.end_date))}</div>
            ${it.team_size ? `<div class="team">Team: ${this._escapeHtml(it.team_size)}</div>` : ''}
          </aside>
          <div class="content">
            ${mission}
            <div class="client">${this._escapeHtml(it.client_name)}</div>
            ${description}
            <strong>Roles & responsibilities</strong>
            ${roles}
            <strong>Ecosystem</strong>
            ${ecosystem}
          </div>
        </div>`;
      }).join('');

    return this._renderSection('Experiences', `<div class="cv-experiences">${items}</div>`);
  }

  _renderSection(title, body) {
    return `<cv-section class="cv-section">
      <h2>${this._escapeHtml(title)}</h2>
      <div class="card">${body}</div>
    </cv-section>`;
  }

  _formatPeriod(start, end) {
    const s = start || '';
    const e = end || '';
    if (!s && !e) return '';
    return `${s} → ${e}`.trim();
  }

  _rankDate(value) {
    if (!value || typeof value !== 'string') return 0;
    const [mm, yyyy] = value.split('-').map(Number);
    if (!mm || !yyyy) return 0;
    return new Date(yyyy, mm - 1, 1).getTime();
  }

  _escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  _escapeAttr(value) {
    return this._escapeHtml(value);
  }

  _resolveIco(ico) {
    if (!ico) return '';
    if (typeof ico === 'string' && ico.startsWith('http')) {
      return `<img src="${this._escapeAttr(ico)}" alt="" /> `;
    }
    return `${this._escapeHtml(ico)} `;
  }

  _showError(err) {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; font-family: system-ui, sans-serif; }
        .err { padding: 1rem; color: #991b1b; background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; }
      </style>
      <div class="err">Unable to load CV data. ${err?.message || err}</div>
    `;
  }
}

customElements.define('cv-component', CV);
