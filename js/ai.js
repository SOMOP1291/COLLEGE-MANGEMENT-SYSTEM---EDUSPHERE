import { list } from './db.js';
import { token } from './auth.js';
const sum = (a, k) => a.reduce((s, x) => s + (+x[k] || 0), 0);

// Compact, privacy-friendly summary of the college data (counts and totals only, no personal details).
export async function snapshot() {
  const [s, t, c, f, r, a] = await Promise.all(['students', 'teachers', 'courses', 'fees', 'results', 'attendance'].map(list));
  const today = new Date().toISOString().slice(0, 10), pres = a.filter(x => x.date === today && x.status === 'Present').length;
  const pass = r.filter(x => x.status === 'Pass').length;
  return `${s.length} students, ${t.length} teachers, ${c.length} courses; fees collected ₹${sum(f, 'paid')}, pending ₹${sum(f, 'pending')}; ` +
    `${r.length} results (${pass} passed); present today: ${pres}.`;
}
export async function askAI(message, mode = 'chat') {
  const context = await snapshot();
  try {
    const tk = await token();
    const r = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(tk ? { Authorization: 'Bearer ' + tk } : {}) },
      body: JSON.stringify({ message, mode, context })
    });
    if (!r.ok) throw 0;
    return (await r.json()).reply;
  } catch { return 'AI is offline (deploy the /api function and sign in with Supabase to enable it). Quick stats: ' + context; }
}
