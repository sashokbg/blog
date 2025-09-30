// Skills list grouped by category
import {applyStyles} from "./tools.js";

class CVSkills extends HTMLElement {
  set data(skills) {
    this._data = Array.isArray(skills) ? skills : [];
    this._render();
  }

  connectedCallback() {
    this.attachShadow({mode: 'open'});
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('./cv-skills.css', import.meta.url);
    this.shadowRoot.append(link);
    this._render();
  }

  _render() {
    if (!this.shadowRoot) return;
    const groups = (this._data || []).map(g => `
      <div class="group">
        <div class="cat">${g.category}</div>
        <div class="items">${(g.items || []).map(i => `<span class="chip">${i}</span>`).join('')}</div>
      </div>
    `).join('');
    this.shadowRoot.innerHTML = `${groups}`;

    applyStyles(this);
  }

}

customElements.define('cv-skills', CVSkills);
