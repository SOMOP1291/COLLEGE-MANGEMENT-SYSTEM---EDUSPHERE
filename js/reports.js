import { list } from './db.js';
import { mountLayout, inr } from './layout.js';
const { main } = await mountLayout({ page: 'reports', title: 'Reports & Analytics', sub: 'College performance at a glance.', action: '<i class="fa-solid fa-print"></i> Print / Save PDF' });
document.getElementById('act').onclick = () => print();
const [s, f, r, a] = await Promise.all(['students', 'fees', 'results', 'attendance'].map(list));
const sum = (x, k) => x.reduce((t, y) => t + (+y[k] || 0), 0), pct = a.length ? Math.round(a.filter(x => x.status === 'Present').length / a.length * 100) : 0;
main.innerHTML = `<section class="stats">${[['Total students', s.length, 'fa-user-graduate'], ['Attendance rate', pct + '%', 'fa-calendar-check'], ['Revenue', inr(sum(f, 'paid')), 'fa-wallet']]
  .map(([l, v, i]) => `<div class="stat"><i class="fa-solid ${i}"></i><div><h3>${v}</h3><p>${l}</p></div></div>`).join('')}</section>
<section class="two"><div class="panel pad"><h2>Fees by course</h2><canvas id="c1"></canvas></div><div class="panel pad"><h2>Grade distribution</h2><canvas id="c2"></canvas></div></section>`;
const courses = [...new Set([...f, ...s].map(x => x.course))], g = {};
r.forEach(x => g[x.grade] = (g[x.grade] || 0) + 1);
new Chart(c1, { type: 'bar', data: { labels: courses, datasets: [{ label: 'Paid', data: courses.map(c => sum(f.filter(x => x.course === c), 'paid')), backgroundColor: '#16a34a' }, { label: 'Pending', data: courses.map(c => sum(f.filter(x => x.course === c), 'pending')), backgroundColor: '#d97706' }] } });
new Chart(c2, { type: 'bar', data: { labels: Object.keys(g), datasets: [{ label: 'Students', data: Object.values(g), backgroundColor: '#2563eb' }] } });
