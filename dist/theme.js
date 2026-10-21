// Apply the theme before the stylesheet loads to avoid a flash on navigation.
(() => {
 const system = matchMedia('(prefers-color-scheme: dark)');
 let saved;
 try { saved = localStorage.getItem('site-theme'); } catch {}
 let preference = ['light','dark'].includes(saved) ? saved : null;
 function apply() {
  const theme = preference || (system.matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  const button = document.querySelector('.theme-toggle');
  if (button) {
   const next = theme === 'dark' ? 'Light' : 'Dark';
   button.textContent = next + ' mode';
   button.setAttribute('aria-label', 'Switch to ' + next.toLowerCase() + ' mode');
   button.hidden = false;
  }
 }
 apply();
 system.addEventListener('change', () => { if (!preference) apply(); });
 addEventListener('storage', event => {
  if (event.key === 'site-theme' || event.key === null) {
   preference = ['light','dark'].includes(event.newValue) ? event.newValue : null;
   apply();
  }
 });
 document.addEventListener('DOMContentLoaded', () => {
  apply();
  document.querySelector('.theme-toggle')?.addEventListener('click', () => {
   preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
   try { localStorage.setItem('site-theme', preference); } catch {}
   apply();
  });
 });
})();
