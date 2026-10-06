// Keep root minimal; import child components so they are registered
import './cv-first-page.js';
import './cv-section.js';
import './cv-experiences.js';
import {applyStyles} from "./tools.js";

// Root component
class CV extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this._styleCache = new Map();
    this._onWindowResize = () => this._drawPageBreakLines();
    this._onBeforePrint = () => this._removePageBreakOverlay();
  }

  connectedCallback() {
    document.documentElement.lang = this._currentLang();
    this._renderShell();
    this._loadAndRender();
  }

  async _loadAndRender() {
    const src = this._resolveDataSrc();
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
          <button type="button" data-action="lang-toggle">${this._currentLang() === 'fr' ? '🇬🇧 English' : '🇫🇷 Français'}</button>
          <button type="button" data-action="page-breaks" aria-pressed="false">Show Page Breaks</button>
          <button type="button" data-action="download">Download CV</button>
          <span class="status" data-role="status" hidden></span>
        </div>
        <div class="container">
          <cv-first-page class="first-page"></cv-first-page>
          <cv-section title="Experiences"><cv-experiences></cv-experiences></cv-section>
        </div>
      </div>
    `;

    applyStyles(this);
    this._bindControls();
  }

  _bindData(data) {
    const firstPage = this.shadowRoot.querySelector('cv-first-page');
    const exps = this.shadowRoot.querySelector('cv-experiences');
    this._data = data;
    if (firstPage) firstPage.data = data;
    if (exps) exps.data = data.experiences || [];
    if (this._pageBreakOverlay) {
      requestAnimationFrame(() => this._drawPageBreakLines());
    }
  }

  disconnectedCallback() {
    if (this._downloadBtn) {
      this._downloadBtn.removeEventListener('click', this._onDownload);
    }
    if (this._pageBreaksBtn) {
      this._pageBreaksBtn.removeEventListener('click', this._onTogglePageBreaks);
    }
    this._removePageBreakOverlay();
  }

  _bindControls() {
    if (this._downloadBtn) {
      this._downloadBtn.removeEventListener('click', this._onDownload);
    }
    if (this._pageBreaksBtn) {
      this._pageBreaksBtn.removeEventListener('click', this._onTogglePageBreaks);
    }
    if (this._langBtn) {
      this._langBtn.removeEventListener('click', this._onToggleLang);
    }
    this._downloadBtn = this.shadowRoot.querySelector('[data-action="download"]');
    this._pageBreaksBtn = this.shadowRoot.querySelector('[data-action="page-breaks"]');
    this._langBtn = this.shadowRoot.querySelector('[data-action="lang-toggle"]');
    this._statusEl = this.shadowRoot.querySelector('[data-role="status"]');
    this._onDownload = () => this._downloadCV();
    this._onTogglePageBreaks = () => this._togglePageBreaks();
    this._onToggleLang = () => this._toggleLanguage();
    if (this._downloadBtn) {
      this._downloadBtn.addEventListener('click', this._onDownload);
    }
    if (this._pageBreaksBtn) {
      this._pageBreaksBtn.addEventListener('click', this._onTogglePageBreaks);
    }
    if (this._langBtn) {
      this._langBtn.addEventListener('click', this._onToggleLang);
    }
  }

  // Language is driven by a `lang` URL query param so switching triggers a
  // real page reload (fresh fetch of the French/English data file).
  _currentLang() {
    return new URLSearchParams(window.location.search).get('lang') === 'fr' ? 'fr' : 'en';
  }

  _resolveDataSrc() {
    const base = this.getAttribute('data-load-data');
    if (!base) return base;
    return this._currentLang() === 'fr' ? base.replace(/\.json$/i, '-fr.json') : base;
  }

  _toggleLanguage() {
    const nextLang = this._currentLang() === 'fr' ? 'en' : 'fr';
    const url = new URL(window.location.href);
    if (nextLang === 'fr') {
      url.searchParams.set('lang', 'fr');
    } else {
      url.searchParams.delete('lang');
    }
    window.location.href = url.toString();
  }

  // Mirrors the @page rule in index.html (A4, 10mm margins) so the
  // overlay lines land where the browser will actually cut the page.
  _togglePageBreaks() {
    if (this._pageBreakOverlay) {
      this._removePageBreakOverlay();
    } else {
      this._showPageBreakOverlay();
    }
  }

  _showPageBreakOverlay() {
    if (this._pageBreakOverlay) return;
    const overlay = document.createElement('div');
    overlay.dataset.cvPageBreaks = '';
    Object.assign(overlay.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '0',
      pointerEvents: 'none',
      zIndex: '2147483647'
    });
    document.body.appendChild(overlay);
    this._pageBreakOverlay = overlay;
    this._drawPageBreakLines();
    window.addEventListener('resize', this._onWindowResize);
    window.addEventListener('beforeprint', this._onBeforePrint);
    if (this._pageBreaksBtn) {
      this._pageBreaksBtn.setAttribute('aria-pressed', 'true');
      this._pageBreaksBtn.textContent = 'Hide Page Breaks';
    }
  }

  _removePageBreakOverlay() {
    if (!this._pageBreakOverlay) return;
    this._pageBreakOverlay.remove();
    this._pageBreakOverlay = null;
    window.removeEventListener('resize', this._onWindowResize);
    window.removeEventListener('beforeprint', this._onBeforePrint);
    if (this._pageBreaksBtn) {
      this._pageBreaksBtn.setAttribute('aria-pressed', 'false');
      this._pageBreaksBtn.textContent = 'Show Page Breaks';
    }
  }

  _drawPageBreakLines() {
    const overlay = this._pageBreakOverlay;
    if (!overlay) return;
    overlay.innerHTML = '';

    const PX_PER_MM = 96 / 25.4;
    const PAGE_HEIGHT_MM = 297;
    const PAGE_MARGIN_MM = 10;
    const pageHeightPx = (PAGE_HEIGHT_MM - PAGE_MARGIN_MM * 2) * PX_PER_MM;

    const bodyRect = document.body.getBoundingClientRect();
    const originY = bodyRect.top + window.scrollY;
    const totalHeight = document.documentElement.scrollHeight;

    let pageNumber = 1;
    for (let y = originY + pageHeightPx; y < originY + totalHeight; y += pageHeightPx) {
      pageNumber++;
      const line = document.createElement('div');
      Object.assign(line.style, {
        position: 'absolute',
        left: '0',
        width: '100%',
        top: `${y}px`,
        borderTop: '2px dashed #dc2626'
      });
      const label = document.createElement('span');
      label.textContent = `Page ${pageNumber}`;
      Object.assign(label.style, {
        position: 'absolute',
        right: '4px',
        top: '2px',
        fontSize: '10px',
        color: '#dc2626',
        fontFamily: 'system-ui, sans-serif',
        background: '#fff',
        padding: '0 4px'
      });
      line.appendChild(label);
      overlay.appendChild(line);
    }
  }

  async _ensureData() {
    if (this._data) return this._data;
    const src = this._resolveDataSrc();
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
      ['cv-first-page.css', 'cv-first-page'],
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
        <div class="cv-first-page">
          ${this._renderHeader(identity)}
          <div class="columns">
            ${this._renderSidebar(identity, timeline)}
            ${this._renderMain(identity, skills)}
          </div>
        </div>
        ${this._renderExperiences(experiences)}
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

  _renderSidebar(identity, timeline) {
    const renderList = (arr) => Array.isArray(arr) && arr.length
      ? `<ul>${arr.map(item => `<li>${this._escapeHtml(item)}</li>`).join('')}</ul>`
      : '<ul></ul>';
    const renderLanguages = (arr) => Array.isArray(arr) && arr.length
      ? `<ul>${arr.map(item => `<li>${this._escapeHtml(item.language)} — ${this._escapeHtml(item.level)}</li>`).join('')}</ul>`
      : '<ul></ul>';

    const timelineItems = (timeline || [])
      .slice()
      .sort((a, b) => (b.year || 0) - (a.year || 0))
      .map(item => `<li class="item">
        <span class="year">${this._escapeHtml(item.year)}</span>
        <span class="role">${this._escapeHtml(item.role)}</span>
      </li>`).join('');

    return `<cv-sidebar class="cv-sidebar">
      ${this._renderSection('Education', renderList(identity?.education))}
      ${this._renderSection('Trainings', renderList(identity?.trainings))}
      ${this._renderSection('Career Timeline', `<div class="cv-timeline"><ul class="tl">${timelineItems}</ul></div>`)}
      ${this._renderSection('Personal Projects', renderList(identity?.personal_projects))}
      ${this._renderSection('Languages', renderLanguages(identity?.languages))}
      ${this._renderSection('Hobbies', renderList(identity?.hobbies))}
    </cv-sidebar>`;
  }

  _renderMain(identity, skills) {
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

    return `<cv-main class="cv-main">
      ${this._renderSection('About', `<div class="cv-about">${aboutHtml}</div>`)}
      ${this._renderSection('Skills', `<div class="cv-skills"><div class="grid">${skillsHtml}</div></div>`)}
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
    console.log("Rendering section", title);
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
