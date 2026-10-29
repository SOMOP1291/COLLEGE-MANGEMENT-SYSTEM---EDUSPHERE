import { list } from './db.js';
import { mountLayout, esc, inr } from './layout.js';
import { askAI } from './ai.js';
const sum = (a, k) => a.reduce((s, x) => s + (+x[k] || 0), 0);
const { main, user } = await mountLayout({ page: 'dashboard', title: 'Welcome back, ' + (await import('./auth.js').then(m => m.getUser())).name + ' 👋', sub: "Here's what's happening at EduSphere today." });
const [s, t, c, f, r, a] = await Promise.all(['students', 'teachers', 'courses', 'fees', 'results', 'attendance'].map(list));
const today = new Date().toISOString().slice(0, 10), pres = a.filter(x => x.date === today && x.status === 'Present').length;
const by = (arr, k) => arr.reduce((o, x) => (o[x[k]] = (o[x[k]] || 0) + 1, o), {});
main.innerHTML = `<section class="stats">${[
  ['Students', s.length, 'fa-user-graduate'], ['Teachers', t.length, 'fa-chalkboard-user'], ['Courses', c.length, 'fa-book'],
  ['Present today', pres, 'fa-calendar-check'], ['Fees collected', inr(sum(f, 'paid')), 'fa-wallet']
].map(([l, v, i]) => `<div class="stat"><i class="fa-solid ${i}"></i><div><h3>${esc(v)}</h3><p>${l}</p></div></div>`).join('')}</section>
<section class="two"><div class="panel pad"><h2>Students by course</h2><canvas id="ch1" height="200"></canvas></div>
<div class="panel pad"><h2>Recent students</h2><ul class="list">${s.slice(0, 5).map(x => `<li><span class="me">${esc(x.name[0])}</span><div><b>${esc(x.name)}</b><small>${esc(x.course)} · Year ${esc(x.year)}</small></div></li>`).join('') || '<li>No students yet</li>'}</ul></div></section>
<section class="panel pad ai-card"><h2>✨ AI insights</h2><p id="ins" class="dim">Get a short, actionable summary of attendance, fees and results.</p>
<button class="btn" id="gen">Generate insights</button></section>`;
const co = by(s, 'course');
new Chart(document.getElementById('ch1'), { type: 'doughnut', data: { labels: Object.keys(co), datasets: [{ data: Object.values(co), backgroundColor: ['#2563eb', '#7c3aed', '#16a34a', '#d97706'] }] }, options: { plugins: { legend: { position: 'bottom' } } } });
document.getElementById('gen').onclick = async e => {
  e.target.disabled = true; document.getElementById('ins').textContent = 'Thinking…';
  document.getElementById('ins').textContent = await askAI('Give 3 short, practical insights and one recommended action for the admin.', 'insights'); e.target.disabled = false;
};
