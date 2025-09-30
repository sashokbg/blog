
export function applyStyles(element) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL(`./${element.localName}.css`, import.meta.url).toString();
  element.shadowRoot.append(link);
}

export function getIco(ico) {
  if (ico.startsWith('http')) {
    return `<img src="${ico}" alt="ico" />`;
  }
  return ico || '🔗'
}
