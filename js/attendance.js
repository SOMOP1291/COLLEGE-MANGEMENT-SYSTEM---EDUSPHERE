import { list, set } from './db.js';
import { mountLayout, esc, toast } from './layout.js';
const { main } = await mountLayout({ page: 'attendance', title: 'Attendance', sub: 'Mark daily attendance for every student.', action: '<i class="fa-solid fa-floppy-disk"></i> Save attendance' });
const students = (await list('students')).sort((a, b) => a.name.localeCompare(b.name)), ST = ['Present', 'Absent', 'Leave'];
main.innerHTML = `<div class="panel"><div class="toolbar"><input type="date" id="d" aria-label="Date"><select id="f"><option value="">All courses</option>${[...new Set(students.map(s => s.course))].map(c => `<option>${esc(c)}</option>`).join('')}</select>
<button class="btn ghost" id="all">Mark all present</button><strong id="sum" class="dim"></strong></div>
<div class="table-wrap"><table><thead><tr><th>Student</th><th>Course</th>${ST.map(s => `<th>${s}</th>`).join('')}</tr></thead><tbody id="rows"></tbody></table></div></div>`;
const $ = s => main.querySelector(s); $('#d').value = new Date().toISOString().slice(0, 10);
let saved = {};
async function draw() {
  saved = Object.fromEntries((await list('attendance')).filter(a => a.date === $('#d').value).map(a => [a.studentId, a.status]));
  const v = students.filter(s => !$('#f').value || s.course === $('#f').value);
  $('#rows').innerHTML = v.map(s => `<tr><td>${esc(s.name)}</td><td>${esc(s.course)}</td>${ST.map(x => `<td><input type="radio" name="a_${esc(s.id)}" value="${x}" ${(saved[s.id] || '') === x ? 'checked' : ''} aria-label="${x} ${esc(s.name)}"></td>`).join('')}</tr>`).join('');
  count();
}
function count() { const c = ST.map(s => main.querySelectorAll(`input[value=${s}]:checked`).length); $('#sum').textContent = `Present ${c[0]} · Absent ${c[1]} · Leave ${c[2]}`; }
$('#d').onchange = $('#f').onchange = draw; main.onchange = e => e.target.type === 'radio' && count();
$('#all').onclick = () => { main.querySelectorAll('input[value=Present]').forEach(i => i.checked = true); count(); };
document.getElementById('act').onclick = async () => {
  const rows = [...main.querySelectorAll('input[type=radio]:checked')]; if (!rows.length) return toast('Mark at least one student first.', 'bad');
  try { await Promise.all(rows.map(i => { const id = i.name.slice(2), s = students.find(x => x.id === id); return set('attendance', `${$('#d').value}_${id}`, { date: $('#d').value, studentId: id, student: s.name, course: s.course, status: i.value }); }));
    toast(`Attendance saved for ${rows.length} students`); } catch (e) { toast('Could not save: ' + e.message, 'bad'); }
};
draw();
