# 🎓 EduSphere — College Management System (Supabase edition)

HTML + CSS + JavaScript (no build step): students, teachers, courses, attendance, results, fees, reports, settings, email/Google login and an AI assistant.

## 1. Try it now (demo mode)
Open the folder in VS Code → install **Live Server** → right-click `index.html` → *Open with Live Server*. Login: `admin@edusphere.com` / `admin123`. Data stays in your browser.

## 2. Connect Supabase
1. supabase.com → **New project** (save the database password).
2. **SQL Editor → New query**: open `supabase.sql`, change `youremail@gmail.com` to your login email, paste it all, click **Run**.
3. **Authentication → Users → Add user → Create new user**: your email + a password (tick *Auto Confirm User*).
4. **Project Settings → API**: copy *Project URL* and the *anon public* key into `js/supabase-config.js`.
5. Refresh the site, the yellow "Demo mode" bar disappears. Log in with your email.

## 3. Google login (optional)
1. Google Cloud Console → *APIs & Services → Credentials → Create OAuth client ID → Web application*. Under *Authorized redirect URIs* add `https://YOUR-PROJECT.supabase.co/auth/v1/callback`.
2. Supabase → **Authentication → Providers → Google** → paste Client ID and Secret → Save.
3. Supabase → **Authentication → URL Configuration**: set *Site URL* to your website and add your page address (and `http://127.0.0.1:5500/**` for Live Server) under *Redirect URLs*.
Only emails in the `admins` table can enter, even with a valid Google account. Add more with: `insert into admins (email) values ('teacher@college.com');`

## 4. AI (optional)
Deploy on Vercel or Netlify (Git deploy). Environment variables: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` (optional `ANTHROPIC_MODEL`). The API only answers signed-in admins. Set a spend limit on your Anthropic account.

## Files
`js/db.js` data layer (Supabase or local demo) · `js/auth.js` login · `js/crud.js` table+form engine · `js/modules.js` Students/Teachers/Courses/Fees/Results · `api/chat.js` AI function · `supabase.sql` database setup.

The anon key is public by design; Row Level Security (in `supabase.sql`) protects your data. Never put your Anthropic key or Supabase *service_role* key in any file.
