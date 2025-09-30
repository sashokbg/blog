import {applyStyles, getIco} from "./tools.js";

class CVHeader extends HTMLElement {
  set data(identity) {
    this._data = identity || {};
    this._render();
  }

  connectedCallback() {
    this.attachShadow({mode: 'open'});
    this._render();
  }

  _render() {
    if (!this.shadowRoot) return;
    const d = this._data || {};
    const name = [d?.name, d?.lastname].filter(Boolean).join(' ');
    const links = Array.isArray(d?.links) ? d.links : [];
    const contacts = d?.contacts || {};


    this.shadowRoot.innerHTML = `
      <div class="row">
        <div class="who">
          <div class="name">${name || ''}</div>
          <div class="role">${d?.role || ''}</div>
          ${d?.experience ? `<div class="exp">(${d.experience})</div>` : ''}
        </div>
        <div class="meta">
          <span class="chip">
          📧 <a href="mailto:${contacts.email}">
            ${contacts.email}
            </a>
          </span>
          <span class="chip">📞 <a href="tel:${contacts.phone}">${contacts.phone}</a></span>
          ${links.map(link => `
            <span class="chip">
              <a href="${link.link}" target="_blank" rel="noopener">
                ${getIco(link.ico)} 
                ${new URL(link.link).hostname}</a>
            </span>`).join('')}
        </div>
      </div>
    `;

    applyStyles(this);
  }
}

customElements.define('cv-header', CVHeader);
