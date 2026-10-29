import { getUser, logout } from './auth.js';
import { askAI } from './ai.js';
import { cloud } from './db.js';
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const inr = n => '₹' + Number(n || 0).toLocaleString('en-IN');
export const badge = (t, c) => `<span class="badge ${c}">${esc(t)}</span>`;
export function toast(msg, type = 'ok') {
  const box = document.querySelector('.toasts') || document.body.appendChild(Object.assign(document.createElement('div'), { className: 'toasts' }));
  const e = Object.assign(document.createElement('div'), { className: 'toast ' + type, textContent: msg });
  box.append(e); setTimeout(() => e.remove(), 3400);
}
const NAV = [['dashboard', 'Dashboard', 'fa-house'], ['students', 'Students', 'fa-user-graduate'], ['teachers', 'Teachers', 'fa-chalkboard-user'],
  ['courses', 'Courses', 'fa-book'], ['attendance', 'Attendance', 'fa-calendar-check'], ['results', 'Results', 'fa-chart-column'],
  ['fees', 'Fees', 'fa-wallet'], ['reports', 'Reports', 'fa-chart-line'], ['settings', 'Settings', 'fa-gear']];

export function setTheme(t) { document.documentElement.dataset.theme = t; localStorage.setItem('edusphere:theme', t); }

export async function mountLayout({ page, title, sub = '', action = '' }) {
  const user = await getUser();
  if (!user) { location.replace('index.html'); return new Promise(() => {}); }
  setTheme(localStorage.getItem('edusphere:theme') || 'light');
  document.body.innerHTML = `<div class="shell">
  <aside class="sidebar" id="sb"><div class="brand">🎓 EduSphere<small>College Management</small></div>
   <nav class="nav">${NAV.map(([id, l, i]) => `<a href="${id}.html" class="${id === page ? 'active' : ''}"><i class="fa-solid ${i}"></i>${l}</a>`).join('')}</nav>
   <button class="btn ghost" id="out"><i class="fa-solid fa-right-from-bracket"></i> Logout</button></aside>
  <main><header class="top"><button class="icon menu" id="menu" aria-label="Open menu"><i class="fa-solid fa-bars"></i></button>
   <div class="ttl"><h1>${esc(title)}</h1><p>${esc(sub)}</p></div>
   <div class="tools">${action ? `<button class="btn" id="act">${action}</button>` : ''}
    <button class="icon" id="theme" aria-label="Toggle theme"><i class="fa-solid fa-circle-half-stroke"></i></button>
    <span class="me" title="${esc(user.email)}">${esc(user.name[0].toUpperCase())}</span></div></header>
   ${cloud ? '' : '<div class="demo">Demo mode: data is stored in this browser only. Add your Supabase config to go live.</div>'}
   <div id="view"></div><footer>© 2026 EduSphere College Management System</footer></main></div>
  <button class="ai-fab" id="aiFab" aria-label="Open AI assistant"><i class="fa-solid fa-wand-magic-sparkles"></i></button>
  <section class="ai-panel" id="aiPanel" hidden aria-label="AI assistant"><header>✨ EduSphere AI</header>
   <div class="ai-log" id="aiLog" aria-live="polite"><p class="bot">Hi! Ask me about attendance, fees, results or how to use EduSphere.</p></div>
   <form id="aiForm"><input id="aiIn" placeholder="Ask anything…" maxlength="400" autocomplete="off" aria-label="Message"><button class="btn" aria-label="Send"><i class="fa-solid fa-paper-plane"></i></button></form></section>`;
  const $ = s => document.querySelector(s);
  $('#out').onclick = logout;
  $('#menu').onclick = () => $('#sb').classList.toggle('open');
  $('#theme').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  $('#aiFab').onclick = () => { $('#aiPanel').hidden = !$('#aiPanel').hidden; $('#aiIn').focus(); };
  $('#aiForm').onsubmit = async e => {
    e.preventDefault(); const q = $('#aiIn').value.trim(); if (!q) return; $('#aiIn').value = '';
    const log = $('#aiLog'), add = (c, t) => { const p = Object.assign(document.createElement('p'), { className: c, textContent: t }); log.append(p); log.scrollTop = log.scrollHeight; return p; };
    add('user', q); const w = add('bot', '…'); w.textContent = await askAI(q);
  };
  return { main: $('#view'), actionBtn: $('#act'), user };
}
