import './cv-header.js';
import './cv-sidebar.js';
import './cv-main.js';
import {applyStyles} from "./tools.js";

// First page: header + sidebar/main columns (everything before Experiences)
class CVFirstPage extends HTMLElement {
  set data(payload) {
    this._data = payload || {};
    this._bind();
  }

  connectedCallback() {
    this.attachShadow({mode: 'open'});
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('./cv-first-page.css', import.meta.url);
    this.shadowRoot.append(link);
    this.shadowRoot.innerHTML += `
      <cv-header></cv-header>
      <div class="columns">
        <cv-sidebar></cv-sidebar>
        <cv-main></cv-main>
      </div>
    `;
    applyStyles(this);
    this._bind();
  }

  _bind() {
    if (!this.shadowRoot) return;
    const data = this._data || {};
    this.shadowRoot.querySelector('cv-header').data = data.identity;
    this.shadowRoot.querySelector('cv-sidebar').data = data;
    this.shadowRoot.querySelector('cv-main').data = data;
  }
}

customElements.define('cv-first-page', CVFirstPage);
