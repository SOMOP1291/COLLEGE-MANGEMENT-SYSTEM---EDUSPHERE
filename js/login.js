import { getUser, login, loginGoogle, resetPassword } from "./auth.js";
import { cloud } from "./db.js";
const $ = (s) => document.querySelector(s),
  msg = (t, bad = true) => {
    const m = $("#msg");
    m.textContent = t;
    m.className = "form-msg " + (bad ? "bad" : "ok");
  };
if (await getUser()) location.replace("dashboard.html");
if (!cloud) $("#demo").hidden = false;
if (sessionStorage.getItem("edusphere:denied")) {
  sessionStorage.removeItem("edusphere:denied");
  msg(
    "This account is not an authorised admin. Ask the owner to add your email.",
  );
}
const go = async (fn) => {
  try {
    await fn();
    location.href = "dashboard.html";
  } catch (e) {
    msg(e.message);
  }
};
$("#loginForm").onsubmit = (e) => {
  e.preventDefault();
  msg("Signing in…", false);
  go(() => login($("#email").value.trim(), $("#password").value));
};
$("#googleLogin").onclick = () => go(loginGoogle);
$("#toggle").onclick = () => {
  const p = $("#password");
  p.type = p.type === "password" ? "text" : "password";
};
$("#forgot").onclick = async (e) => {
  e.preventDefault();
  const m = $("#email").value.trim();
  if (!m) return msg("Enter your email first.");
  try {
    await resetPassword(m);
    msg("Password reset email sent.", false);
  } catch (x) {
    msg(x.message);
  }
};
