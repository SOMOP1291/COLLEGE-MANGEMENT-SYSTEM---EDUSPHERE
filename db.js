import { CONFIG } from './supabase-config.js';
export const cloud = !!CONFIG.url && !CONFIG.url.startsWith('YOUR');
let sbp;
// Cleans up common copy-paste mistakes: spaces, quotes, trailing "/" or "/rest/v1" after .supabase.co
const clean = v => String(v || '').trim().replace(/^["']|["']$/g, '');
const origin = () => { try { return new URL(clean(CONFIG.url)).origin; } catch { throw new Error('Your Supabase URL in js/supabase-config.js is not valid. It should look like https://abcdefghij.supabase.co'); } };
export const sb = () => sbp ||= import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm').then(m => m.createClient(origin(), clean(CONFIG.anonKey)));

const t = Date.now();
const SEED = {
  students: [['Rahul Singh', 'BCA', '2'], ['Aman Kumar', 'BBA', '1'], ['Priya Sharma', 'BSc', '3'], ['Neha Patel', 'BA', '1']]
    .map(([name, course, year], i) => ({ id: 's' + i, name, course, year, email: name.split(' ')[0].toLowerCase() + '@example.com', phone: '', createdAt: t - i })),
  teachers: [{ id: 't1', name: 'Dr. Anil Verma', email: 'anil@example.com', phone: '', department: 'Computer Science', subject: 'Databases', experience: 9, salary: 65000, createdAt: t }],
  courses: [{ id: 'c1', code: 'BCA101', name: 'Bachelor of Computer Applications', department: 'Computer Science', duration: '3 Years', semester: 6, fee: 75000, teacher: 'Dr. Anil Verma', createdAt: t }],
};
const key = c => 'edusphere:' + c;
const lget = c => { let v = localStorage.getItem(key(c)); if (v === null && SEED[c]) { v = JSON.stringify(SEED[c]); localStorage.setItem(key(c), v); } return JSON.parse(v || '[]'); };
const lput = (c, a) => localStorage.setItem(key(c), JSON.stringify(a));

// Cloud data lives in one table: records(collection, id, data jsonb). See supabase.sql.
const ok = ({ error }) => { if (error) throw new Error(error.message); };
async function merge(s, c, id, d) {
  const { data, error } = await s.from('records').select('data').eq('collection', c).eq('id', id).maybeSingle();
  if (error) throw new Error(error.message); return { ...(data?.data || {}), ...d };
}
export async function list(c) {
  if (!cloud) return lget(c);
  const { data, error } = await (await sb()).from('records').select('id,data,created_at').eq('collection', c);
  if (error) throw new Error(error.message);
  return data.map(r => ({ ...r.data, id: r.id, createdAt: r.data.createdAt ?? Date.parse(r.created_at) }));
}
export async function add(c, d) {
  d = { ...d, createdAt: Date.now() };
  if (!cloud) { const a = lget(c); a.push({ id: crypto.randomUUID(), ...d }); return lput(c, a); }
  ok(await (await sb()).from('records').insert({ collection: c, id: crypto.randomUUID(), data: d }));
}
export async function update(c, id, d) {
  if (!cloud) return lput(c, lget(c).map(x => x.id === id ? { ...x, ...d } : x));
  const s = await sb(); ok(await s.from('records').update({ data: await merge(s, c, id, d) }).eq('collection', c).eq('id', id));
}
export async function set(c, id, d) {
  if (!cloud) return lput(c, [...lget(c).filter(x => x.id !== id), { id, ...d }]);
  const s = await sb(); ok(await s.from('records').upsert({ collection: c, id, data: await merge(s, c, id, d) }));
}
export async function remove(c, id) {
  if (!cloud) return lput(c, lget(c).filter(x => x.id !== id));
  ok(await (await sb()).from('records').delete().eq('collection', c).eq('id', id));
}
