// Experiences list with details
import {applyStyles} from "./tools.js";

class CVExperiences extends HTMLElement {
  set data(items) {
    this._data = Array.isArray(items) ? items : [];
    this._render();
  }

  connectedCallback() {
    this.attachShadow({mode: 'open'});
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('./cv-experiences.css', import.meta.url);
    this.shadowRoot.append(link);
    this._render();
  }

  _fmtPeriod(s, e) {
    return `${s || ''} → ${e || ''}`;
  }

  _list(arr) {
    return Array.isArray(arr) ? `<ul>${arr.map(i => `<li>${i}</li>`).join('')}</ul>` : '';
  }

  _paragraphs(arr) {
    return Array.isArray(arr) ? `${arr.map(paragraph => `<p>${paragraph}</p>`).join("")}`: ''
  }

  _chips(arr) {
    return Array.isArray(arr) ? `<div class="chips">${arr.map(i => `<span class="chip">${i}</span>`).join('')}</div>` : '';
  }

  _toDate(str) {
    if (!str || typeof str !== 'string') return new Date(0);
    const [mm, yyyy] = str.split('-').map(Number);
    if (!mm || !yyyy) return new Date(0);
    return new Date(yyyy, mm - 1, 1);
  }

  _fmtDuration(s, e) {
    const start = this._toDate(s);
    const end = this._toDate(e);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    if (!Number.isFinite(months) || months <= 0) return '';
    const years = Math.floor(months / 12);
    const rem = months % 12;
    const parts = [];
    if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
    if (rem) parts.push(`${rem} mo${rem > 1 ? 's' : ''}`);
    return parts.join(' ');
  }

  _padding(padding = 0) {
    let padding_html = "";
    for (let i = 0; i < padding; i++) {
      padding_html += "<p>&nbsp;</p>\n"
    }

    return padding_html;
  }

  _render() {
    if (!this.shadowRoot) return;
    const items = (this._data || [])
      .slice()
      .sort((a, b) => {
        const byEnd = this._toDate(b.end_date) - this._toDate(a.end_date);
        if (byEnd !== 0) return byEnd;
        return this._toDate(b.start_date) - this._toDate(a.start_date);
      });
    this.shadowRoot.innerHTML = `
      ${items.map(it => `
        <div class="item">
          <div class="border"></div>
          <div class="row">
            <aside class="meta">
              <div class="role">${it.role}</div>
              <div class="period">${this._fmtPeriod(it.start_date, it.end_date)}</div>
              ${this._fmtDuration(it.start_date, it.end_date) ? `<div class="duration">${this._fmtDuration(it.start_date, it.end_date)}</div>` : ''}
              ${it.team_size ? `<div class="team">Team: ${it.team_size}</div>` : ''}
            </aside>
            <div class="content">
              ${it.mission_name ? `<h3 class="mission">${it.mission_name}</h3>` : ''}
              <div class="client">${it.client_name}</div>
              ${this._paragraphs(it.mission_description)}
              <strong>Roles & responsibilities</strong>
              ${this._list(it.roles_and_responsibilities)}
              <strong>Ecosystem</strong>
              ${this._chips(it.ecosystem)}
              <div class="padding">${this._padding(it.padding)}</div>
            </div>
          </div>
        </div>
      `).join('')}
    `;

    applyStyles(this);
  }
}

customElements.define('cv-experiences', CVExperiences);
