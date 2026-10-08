import { escapeHtml, icon, renderLucideIcons } from '../lib/ui.js';

let toastTimer;

export function showToast(message, isError = false) {
  const region = document.getElementById('toastRegion');
  region.innerHTML = `<div class="toast ${isError ? 'error' : ''}" role="status"><span class="toast-mark">${icon(isError ? 'error' : 'check')}</span><span>${escapeHtml(message)}</span></div>`;
  renderLucideIcons(region);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { region.innerHTML = ''; }, 3200);
}
