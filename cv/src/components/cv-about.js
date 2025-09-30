import {applyStyles} from "./tools.js";

class CVAbout extends HTMLElement {
  set data(about) {
    if (Array.isArray(about)) {
      this._data = about;
    } else if (typeof about === 'string') {
      this._data = [about];
    } else {
      this._data = [];
    }
    this._render();
  }

  connectedCallback() {
    this.attachShadow({mode: 'open'});
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('./cv-about.css', import.meta.url);
    this.shadowRoot.append(link);
    this._render();
  }

  _render() {
    if (!this.shadowRoot) return;
    const items = this._data || [];
    const body = items.map(line => `<p>${line}</p>`).join('');
    this.shadowRoot.innerHTML = `${body}`;

    applyStyles(this);
  }
}

customElements.define('cv-about', CVAbout);

