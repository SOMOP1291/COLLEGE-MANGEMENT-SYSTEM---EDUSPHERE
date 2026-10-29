import { list, set } from './db.js';
import { mountLayout, esc, toast, setTheme } from './layout.js';
import { cloud } from './db.js';
const { main, user } = await mountLayout({ page: 'settings', title: 'Settings', sub: 'College details and appearance.' });
const info = (await list('settings')).find(x => x.id === 'college') || {};
main.innerHTML = `<section class="two"><form class="panel pad" id="cf"><h2>College information</h2><div class="grid">
<label>College name<input name="name" value="${esc(info.name || 'EduSphere College')}" required></label><label>Phone<input name="phone" value="${esc(info.phone || '')}"></label>
<label class="wide">Address<input name="address" value="${esc(info.address || '')}"></label></div><div class="actions"><button class="btn">Save</button></div></form>
<div class="panel pad"><h2>Account &amp; appearance</h2><p class="dim">Signed in as <b>${esc(user.email)}</b></p><div class="actions left">
<button class="btn ghost" id="l">☀️ Light</button><button class="btn ghost" id="d">🌙 Dark</button></div>
${cloud ? '' : '<hr><p class="dim">Demo mode data lives in this browser.</p><button class="btn ghost bad" id="reset">Reset demo data</button>'}</div></section>`;
main.querySelector('#cf').onsubmit = async e => { e.preventDefault(); await set('settings', 'college', Object.fromEntries(new FormData(e.target))); toast('College information saved'); };
main.querySelector('#l').onclick = () => setTheme('light'); main.querySelector('#d').onclick = () => setTheme('dark');
main.querySelector('#reset')?.addEventListener('click', () => { if (confirm('Erase all demo data?')) { Object.keys(localStorage).filter(k => k.startsWith('edusphere:') && !/user|theme/.test(k)).forEach(k => localStorage.removeItem(k)); toast('Demo data reset'); } });
