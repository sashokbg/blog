import {applyStyles} from "./tools.js";

class CVSection extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({mode: 'open'});
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('./cv-section.css', import.meta.url);
    this.shadowRoot.append(link);
    this.shadowRoot.innerHTML += `
      <h2></h2>
      <div class="card"><slot></slot></div>
    `;
    applyStyles(this);
  }

  static get observedAttributes() {
    return ['title'];
  }

  attributeChangedCallback(name, _old, value) {
    if (name === 'title') this.shadowRoot.querySelector('h2').textContent = value || '';
  }
}

customElements.define('cv-section', CVSection);
