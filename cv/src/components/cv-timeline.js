import {applyStyles} from "./tools.js";

class CVTimeline extends HTMLElement {
  set data(items) {
    this._data = Array.isArray(items) ? items : [];
    this._render();
  }

  connectedCallback() {
    this.attachShadow({mode: 'open'});
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('./cv-timeline.css', import.meta.url);
    this.shadowRoot.append(link);
    this._render();
  }

  _render() {
    if (!this.shadowRoot) return;
    const items = (this._data || []).slice().sort((a, b) => (b.year || 0) - (a.year || 0));
    this.shadowRoot.innerHTML = `
      <ul class="tl">
        ${items.map((item) => `
          <li class="item">
            <span class="year">${item.year ?? ''}</span>
            <span class="role">${item.role ?? ''}</span>
          </li>
        `).join('')}
      </ul>
    `;

    applyStyles(this);
  }
}

customElements.define('cv-timeline', CVTimeline);
