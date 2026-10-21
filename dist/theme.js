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
   button.innerHTML = theme === 'dark'
    ? '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.4A8.7 8.7 0 0 1 9.6 3.5a8.7 8.7 0 1 0 10.9 10.9Z"/></svg>';
   button.title = 'Switch to ' + next.toLowerCase() + ' mode';
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
