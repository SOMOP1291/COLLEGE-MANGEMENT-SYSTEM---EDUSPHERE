import { cloud, sb } from './db.js';
const DEMO = 'Invalid email or password. Demo login: admin@edusphere.com / admin123';
const home = () => location.origin + location.pathname.replace(/[^/]*$/, '');

// Only emails listed in the Supabase "admins" table pass (see supabase.sql).
async function isAdmin(s) { const { data } = await s.rpc('is_admin'); return data === true; }

export async function getUser() {
  if (!cloud) return JSON.parse(localStorage.getItem('edusphere:user') || 'null');
  const s = await sb(), { data } = await s.auth.getSession(), u = data.session?.user;
  if (!u) return null;
  if (!(await isAdmin(s))) { await s.auth.signOut(); sessionStorage.setItem('edusphere:denied', '1'); return null; }
  return { email: u.email, name: u.user_metadata?.full_name || u.email.split('@')[0] };
}
export async function login(email, pw) {
  if (!cloud) {
    if (email === 'admin@edusphere.com' && pw === 'admin123') return localStorage.setItem('edusphere:user', JSON.stringify({ email, name: 'Admin' }));
    throw new Error(DEMO);
  }
  const s = await sb(), { error } = await s.auth.signInWithPassword({ email, password: pw });
  if (error) throw new Error(error.message);
  if (!(await isAdmin(s))) { await s.auth.signOut(); throw new Error('This account is not an authorised admin.'); }
}
export async function loginGoogle() {
  if (!cloud) throw new Error('Add your Supabase config in js/supabase-config.js to enable Google sign-in.');
  const { error } = await (await sb()).auth.signInWithOAuth({ provider: 'google', options: { redirectTo: home() + 'dashboard.html' } });
  if (error) throw new Error(error.message);
  return new Promise(() => {}); // the browser is redirecting to Google
}
export async function resetPassword(email) {
  if (!cloud) throw new Error('Password reset needs Supabase to be configured.');
  const { error } = await (await sb()).auth.resetPasswordForEmail(email, { redirectTo: home() + 'index.html' });
  if (error) throw new Error(error.message);
}
export async function logout() {
  if (cloud) await (await sb()).auth.signOut(); else localStorage.removeItem('edusphere:user');
  location.href = 'index.html';
}
export async function token() { if (!cloud) return null; return (await (await sb()).auth.getSession()).data.session?.access_token; }
