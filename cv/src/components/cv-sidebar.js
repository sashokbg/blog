import './cv-section.js';
import {applyStyles} from "./tools.js";

// Sidebar: education, trainings, personal projects, languages, hobbies
class CVSidebar extends HTMLElement {
  set data(identity) {
    this._data = identity || {};
    this._render();
  }

  connectedCallback() {
    this.attachShadow({mode: 'open'});
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('./cv-sidebar.css', import.meta.url);
    this.shadowRoot.append(link);
    this._render();
  }

  _renderList(arr) {
    return `<ul>${(arr || []).map(i => `<li>${i}</li>`).join('')}</ul>`;
  }

  _renderLanguages(arr) {
    return `<ul>${(arr || []).map(i => `<li>${i.language} — ${i.level}</li>`).join('')}</ul>`;
  }

  _render() {
    if (!this.shadowRoot) return;
    const d = this._data || {};
    this.shadowRoot.innerHTML = `
      <cv-section title="Education">${this._renderList(d.education)}</cv-section>
      <cv-section title="Trainings">${this._renderList(d.trainings)}</cv-section>
      <cv-section title="Personal Projects">${this._renderList(d.personal_projects)}</cv-section>
      <cv-section title="Languages">${this._renderLanguages(d.languages)}</cv-section>
      <cv-section title="Hobbies">${this._renderList(d.hobbies)}</cv-section>
    `;

    applyStyles(this);
  }
}

customElements.define('cv-sidebar', CVSidebar);
