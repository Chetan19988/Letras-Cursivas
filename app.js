import { buildStyles } from './fonts.js';
import { hydrateIcons, iconSvg } from './icons.js';

const PAGE = 48;
const DEFAULT_TEXT = 'Letras Cursivas';
const $ = (id) => document.getElementById(id);

const toastEl = $('toast');
let toastTimer;

function showToast(msg) {
  if (!toastEl) return;
  toastEl.querySelector('span').textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1600);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch {}
    ta.remove();
    return ok;
  }
}

function initGenerator() {
  const STYLES = buildStyles(500);
  const input = $('input');
  const list = $('list');
  const search = $('search');
  const countEl = $('count');
  const empty = $('empty');
  const sentinel = $('sentinel');

  let favs = new Set();
  try { favs = new Set(JSON.parse(localStorage.getItem('lc-favs') || '[]')); } catch {}
  let category = 'todas';
  let filtered = [];
  let shown = 0;

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const currentText = () => (input.value.trim() ? input.value : DEFAULT_TEXT);

  function rowHTML(s, text) {
    const on = favs.has(s.id);
    return `<div class="row" data-id="${s.id}">
    <div class="row-body">
      <div class="row-label">${s.id}. ${esc(s.name)}</div>
      <div class="row-text">${esc(s.convert(text))}</div>
    </div>
    <div class="row-actions">
      <button class="act fav ${on ? 'on' : ''}" data-action="fav" title="Favorita" aria-label="Favorita">${iconSvg('heart')}</button>
      <button class="act copy" data-action="copy" title="Copiar" aria-label="Copiar">${iconSvg('copy')}<span class="copy-label">Copiar</span></button>
    </div>
  </div>`;
  }

  function renderMore() {
    if (shown >= filtered.length) return;
    const text = currentText();
    const next = filtered.slice(shown, shown + PAGE);
    list.insertAdjacentHTML('beforeend', next.map((s) => rowHTML(s, text)).join(''));
    shown += next.length;
  }

  function applyFilter() {
    const q = search.value.trim().toLowerCase();
    filtered = STYLES.filter((s) => {
      if (category === 'favoritas' && !favs.has(s.id)) return false;
      if (category !== 'todas' && category !== 'favoritas' && !s.tags.includes(category)) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
    countEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'estilo' : 'estilos'}`;
    empty.classList.toggle('hidden', filtered.length > 0);
    empty.querySelector('p').textContent = category === 'favoritas' && !q
      ? 'Aún no tienes favoritas. Toca el corazón de un estilo para guardarlo.'
      : 'No hay estilos que coincidan.';
    list.innerHTML = '';
    shown = 0;
    renderMore();
  }

  function refreshText() {
    const text = currentText();
    list.querySelectorAll('.row').forEach((row) => {
      const s = STYLES[+row.dataset.id - 1];
      row.querySelector('.row-text').textContent = s.convert(text);
    });
  }

  list.addEventListener('click', async (e) => {
    const row = e.target.closest('.row');
    if (!row) return;
    const id = +row.dataset.id;
    const favBtn = e.target.closest('[data-action="fav"]');
    if (favBtn) {
      if (favs.has(id)) favs.delete(id); else favs.add(id);
      try { localStorage.setItem('lc-favs', JSON.stringify([...favs])); } catch {}
      favBtn.classList.toggle('on', favs.has(id));
      showToast(favs.has(id) ? 'Añadida a favoritas' : 'Quitada de favoritas');
      if (category === 'favoritas' && !favs.has(id)) applyFilter();
      return;
    }
    const out = STYLES[id - 1].convert(currentText());
    const ok = await copyText(out);
    showToast(ok ? '¡Copiado!' : 'No se pudo copiar');
    if (ok) {
      const label = row.querySelector('.copy-label');
      row.classList.add('copied');
      if (label) label.textContent = '¡Copiado!';
      clearTimeout(row._t);
      row._t = setTimeout(() => {
        row.classList.remove('copied');
        if (label) label.textContent = 'Copiar';
      }, 1200);
    }
  });

  input.addEventListener('input', refreshText);
  $('clearBtn').addEventListener('click', () => { input.value = ''; input.focus(); refreshText(); });
  search.addEventListener('input', applyFilter);

  $('chips').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
    category = chip.dataset.cat;
    applyFilter();
  });

  function setView(view) {
    list.classList.toggle('grid', view === 'grid');
    document.querySelectorAll('.vt').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
    try { localStorage.setItem('lc-view', view); } catch {}
  }
  document.querySelector('.view-toggle').addEventListener('click', (e) => {
    const b = e.target.closest('.vt');
    if (b) setView(b.dataset.view);
  });
  let savedView = 'grid';
  try { savedView = localStorage.getItem('lc-view') || 'grid'; } catch {}
  setView(savedView);

  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) renderMore();
  }, { rootMargin: '600px' }).observe(sentinel);

  applyFilter();
}

function initContactForm() {
  const form = $('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.namedItem('name').value.trim();
    const email = form.elements.namedItem('email').value.trim();
    const message = form.elements.namedItem('message').value.trim();
    const subject = encodeURIComponent(`Contacto desde letrascursivas.es — ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
    window.location.href = `mailto:hola@letrascursivas.es?subject=${subject}&body=${body}`;
    showToast('Abriendo tu correo…');
  });
}

const year = $('year');
if (year) year.textContent = new Date().getFullYear();

hydrateIcons();
initContactForm();

if ($('input') && $('list') && $('search') && $('count') && $('empty') && $('sentinel') && $('clearBtn') && $('chips') && document.querySelector('.view-toggle')) {
  initGenerator();
}
