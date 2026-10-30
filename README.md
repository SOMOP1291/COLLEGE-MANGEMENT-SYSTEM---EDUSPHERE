# 🎓 EduSphere — College Management System

### A Modern College Management Solution Built with HTML, CSS, JavaScript & Supabase

<p align="center">
  <strong>Manage Students • Teachers • Courses • Attendance • Results • Fees</strong>
</p>

<p align="center">
  A responsive college management system with authentication, cloud database integration, reporting, and an optional AI assistant.
</p>

---

## ✨ About the Project

**EduSphere** is a web-based College Management System designed to simplify everyday academic and administrative tasks.

Built using HTML, CSS, and JavaScript, it supports a browser-based demo mode and can connect to Supabase for authentication and cloud data storage.

### 🚀 Key Features

- 👨‍🎓 **Student Management** — Manage student records.
- 👩‍🏫 **Teacher Management** — Organize teacher information.
- 📚 **Course Management** — Maintain course details.
- 🗓️ **Attendance Management** — Manage attendance records.
- 📝 **Results Management** — Organize academic results.
- 💰 **Fees Management** — Track fee-related information.
- 📊 **Reports & Settings** — Access administrative tools.
- 🔐 **Authentication** — Email/password and Google login.
- ☁️ **Supabase Integration** — Cloud authentication and database connectivity.
- 🤖 **AI Assistant** — Optional AI-powered assistance.
- 💻 **Demo Mode** — Explore supported features using browser storage.
- 📱 **Responsive Interface** — Designed for convenient use across screen sizes.

> Feature availability depends on the current project configuration and connected services.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling and responsive layouts |
| JavaScript | Application logic and interactions |
| Supabase | Authentication and cloud database |
| Google OAuth | Google sign-in |
| Vercel / Netlify | Deployment |
| Anthropic API | Optional AI assistant |

---

## 📸 Project Preview

Add your screenshots here to showcase the application.

```text
docs/
├── login-page.png
├── dashboard.png
├── students-page.png
└── attendance-page.png
```

Once you add screenshots, display them using:

```markdown
![EduSphere Login](docs/login-page.png)

![EduSphere Dashboard](docs/dashboard.png)
```

---

## ⚡ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/SOMOP1291/COLLEGE-MANGEMENT-SYSTEM---EDUSPHERE.git
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL.

Alternatively, download the repository as a ZIP file and extract it.

### 2. Open the Project

Open the project folder in Visual Studio Code.

For local development, install the **Live Server** extension if needed.

Right-click `index.html` and select:

**Open with Live Server**

The application will open in your browser.

### 3. Try Demo Mode

If demo mode is enabled in your project, you can explore the supported features without connecting a cloud database.

Demo login:

```text
Email:    som2525@gmail.com
Password: SOM#52515#12@
```

**Important:** These are demo credentials. Do not use them for a production deployment. Demo data may be stored locally in your browser.

---

## ☁️ Connect Supabase

Follow these steps to configure cloud authentication and database connectivity.

### Step 1: Create a Supabase Project

1. Open the [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new project.
3. Save your database password securely.

### Step 2: Set Up the Database

1. Open your Supabase project.
2. Navigate to **SQL Editor**.
3. Open the project's `supabase.sql` file.
4. Follow its setup instructions.
5. Replace any example email addresses with your own where required.
6. Run the SQL after reviewing the queries.

### Step 3: Configure Authentication

If your application uses manually created Supabase users:

1. Open **Authentication → Users**.
2. Create the required user.
3. Configure email confirmation according to your authentication settings.

Follow the project's SQL and authentication requirements for administrator access.

### Step 4: Configure Supabase Credentials

Open:

```text
js/supabase-config.js
```

Use the following structure:

```javascript
export const CONFIG = {
  url: "YOUR_SUPABASE_PROJECT_URL",
  anonKey: "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY"
};
```

Replace the placeholders with your actual Supabase project URL and **public publishable/anon key**.

**Security rules:**
- Public publishable/anon keys may be used in browser-side applications.
- Never expose a `service_role` key or a secret API key in frontend code.
- Configure Row Level Security (RLS) policies to protect database records.
- Do not rely on frontend login checks alone to secure database operations.

---

## 🔑 Google Login Setup

Google authentication requires configuration in both Google Cloud and Supabase.

### Step 1: Create Google OAuth Credentials

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services → Credentials**.
3. Create an OAuth Client ID.
4. Select **Web application**.

Add your Supabase callback URL under **Authorized redirect URIs**:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

Replace `YOUR_PROJECT_REF` with your actual Supabase project reference.

### Step 2: Configure Supabase

1. Open your Supabase project.
2. Navigate to **Authentication → Providers → Google**.
3. Enable Google authentication.
4. Enter your Google OAuth Client ID and Client Secret.
5. Save the configuration.

Keep the Google OAuth Client Secret private. It must never be placed in frontend JavaScript or committed to GitHub.

### Step 3: Configure Redirect URLs

Navigate to:

**Supabase → Authentication → URL Configuration**

Set your production website as the Site URL.

Add the appropriate redirect URLs, including your local development address if needed.

For example:

```text
http://127.0.0.1:5500/**
https://YOUR_PROJECT.vercel.app/**
```

Use your actual development and production addresses.

Ensure the redirect URL used by your application is permitted by Supabase.

### Step 4: Configure Administrator Access

If the project uses an `admins` table to restrict access, add authorized administrator email addresses according to the database schema.

Example, if the table contains an `email` column:

```sql
INSERT INTO admins (email)
VALUES ('teacher@college.com');
```

Run this only if it matches your actual schema and the account is authorized.

**Important:** A frontend-only administrator check is not sufficient for production security. Enforce the necessary permissions through database policies or trusted server-side logic.

---

## 🚀 Deploy to Vercel

EduSphere can be deployed to Vercel for online access.

### Deployment Steps

1. Push your project to GitHub.
2. Sign in to [Vercel](https://vercel.com/).
3. Import your GitHub repository.
4. Configure the project settings.
5. Deploy the application.
6. Open the deployed website and test the login flow.

### Supabase Configuration for Production

Make sure:

- Your Supabase project URL is correct.
- Your frontend uses the public publishable/anon key.
- The deployed URL is included in Supabase's allowed redirect URLs.
- Google OAuth callback settings are correct.
- Required database tables and RLS policies are configured.

**Note:** Since this project uses browser-side JavaScript without a build step, Vercel Environment Variables are not automatically available inside frontend JavaScript. If you want to keep the configuration file out of GitHub, implement a suitable configuration-delivery approach before removing that file from the deployed application.

---

## 🤖 Optional AI Assistant

The project may include an AI assistant through a server-side API endpoint.

Example environment variables:

```text
ANTHROPIC_API_KEY=your_server_side_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_public_supabase_key
ANTHROPIC_MODEL=your_supported_model
```

Only configure variables that your actual API implementation uses.

### AI Security

- Store `ANTHROPIC_API_KEY` as a server-side environment variable.
- Never expose the Anthropic API key in browser JavaScript.
- Verify authentication and authorization on the server.
- Validate requests before calling the AI provider.
- Configure usage limits to avoid unexpected costs.

---

## 📁 Project Structure

```text
EduSphere/
│
├── index.html
├── dashboard.html
├── supabase.sql
├── README.md
│
├── css/
│   └── style.css
│
├── js/
│   ├── supabase-config.js
│   ├── db.js
│   ├── auth.js
│   ├── crud.js
│   └── modules.js
│
└── api/
    └── chat.js
```

*This is an example structure. Adjust it to match your actual repository.*

### Important Files

| File | Description |
|---|---|
| `index.html` | Login page or application entry point |
| `dashboard.html` | Main dashboard |
| `js/supabase-config.js` | Supabase project configuration |
| `js/db.js` | Database connection and data layer |
| `js/auth.js` | Authentication functions |
| `js/crud.js` | Table and form operations |
| `js/modules.js` | Application modules |
| `supabase.sql` | Database schema and setup |
| `api/chat.js` | Optional AI API endpoint |

---

## 🔒 Security Checklist

Before using EduSphere in production:

- [ ] Use only public Supabase credentials in frontend code.
- [ ] Never commit service-role keys, secret API keys, or OAuth client secrets.
- [ ] Enable appropriate RLS policies on database tables.
- [ ] Verify administrator permissions on the server or through secure database policies.
- [ ] Restrict production redirect URLs to trusted domains.
- [ ] Protect AI endpoints against unauthorized access and excessive usage.
- [ ] Avoid using demo credentials in production.
- [ ] Test authentication and database permissions before publishing.

---

## 🧑‍💻 Development

Contributions and improvements are welcome.

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Test the application locally.
5. Submit a pull request.

---

## 🎯 Project Goal

EduSphere aims to provide a simple and extensible foundation for college administration by bringing student records, academic management, authentication, and optional AI assistance into one web application.

---

## 👨‍💻 Author

**Som Singh**

Full Stack Web Developer | Software Engineer | Problem Solver

---

<p align="center">
  <strong>🎓 EduSphere — Smarter College Management.</strong>
</p>
