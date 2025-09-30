import './cv-section.js';
import './cv-about.js';
import './cv-skills.js';
import './cv-timeline.js';
import {applyStyles} from "./tools.js";

// Main column aggregating about, skills, timeline, experiences
class CVMain extends HTMLElement {
  set data(payload) {
    this._data = payload || {};
    this._render();
  }

  connectedCallback() {
    this.attachShadow({mode: 'open'});
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('./cv-main.css', import.meta.url);
    this.shadowRoot.append(link);
    this._render();
  }

  _render() {
    if (!this.shadowRoot) return;
    const d = this._data || {};

    this.shadowRoot.innerHTML = `
      <cv-section title="About"><cv-about></cv-about></cv-section>
      <cv-section title="Skills"><cv-skills></cv-skills></cv-section>
      <cv-section title="Timeline"><cv-timeline></cv-timeline></cv-section>
    `;
    this.shadowRoot.querySelector('cv-about').data = d.identity?.about || [];
    this.shadowRoot.querySelector('cv-skills').data = d.skills || [];
    this.shadowRoot.querySelector('cv-timeline').data = d.timeline || [];

    applyStyles(this);
  }
}

customElements.define('cv-main', CVMain);
