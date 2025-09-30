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

  disconnectedCallback() {
    if (this._ro) {
      try { this._ro.disconnect(); } catch {}
      this._ro = null;
    }
  }

  _render() {
    if (!this.shadowRoot) return;
    const items = (this._data || []).slice().sort((a, b) => (b.year || 0) - (a.year || 0));
    this.shadowRoot.innerHTML = `
      <div class="tl" role="list">
        ${items.map((item) => {
          const clients = (item.client || '').split(/,\s*/).filter(Boolean).join('<br>');
          return `
            <div class="item" role="listitem">
              <div class="year">${item.year ?? ''}</div>
              <div class="role">${item.role ?? ''}</div>
              <div class="client">${clients}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // After render: layout connectors and mark row ends; set up observer
    this._relayout();
    if (!this._ro) {
      this._ro = new ResizeObserver(() => this._relayout());
      const tl = this.shadowRoot.querySelector('.tl');
      if (tl) this._ro.observe(tl);
    }

    applyStyles(this);
  }

  _relayout() {
    const tl = this.shadowRoot?.querySelector('.tl');
    if (!tl) return;
    const items = Array.from(tl.querySelectorAll('.item'));
    // reset
    items.forEach((el) => {
      el.removeAttribute('data-row-end');
      const conn = el.querySelector('.conn');
      if (conn) conn.style.removeProperty('--conn-w');
    });

    for (let i = 0; i < items.length; i++) {
      const el = items[i];
      const next = items[i + 1];
      const conn = el.querySelector('.conn');
      if (!next) {
        el.setAttribute('data-row-end', 'true');
        continue;
      }
      const sameRow = Math.abs(next.offsetTop - el.offsetTop) <= 1;
      if (!sameRow) {
        el.setAttribute('data-row-end', 'true');
        continue;
      }
      if (!conn) continue;
      // Compute distance from the right edge of current dot to the left edge of next dot
      const d1 = el.querySelector('.dot')?.getBoundingClientRect();
      const d2 = next.querySelector('.dot')?.getBoundingClientRect();
      if (!d1 || !d2) continue;
      const x1 = d1.left + d1.width / 2; // center current
      const x2 = d2.left + d2.width / 2; // center next
      const width = Math.max(0, Math.round(x2 - x1 - 16)); // 8px radius each side
      conn.style.setProperty('--conn-w', `${width}px`);
    }
  }
}

customElements.define('cv-timeline', CVTimeline);
