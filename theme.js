/* ==========================================================
   MODE TEMA GLOBAL: konsisten di index, order, dan history
   ========================================================== */
(function () {
  try {
    const savedTheme = localStorage.getItem('kng_theme');
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  } catch (error) { console.warn('Preferensi tema tidak dapat dibaca.', error); }
})();

function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  try { localStorage.setItem('kng_theme', isDark ? 'dark' : 'light'); }
  catch (error) { console.warn('Preferensi tema tidak dapat disimpan.', error); }
  document.querySelectorAll('[data-theme-icon]').forEach(icon => {
    icon.className = isDark ? 'fa-solid fa-sun text-base' : 'fa-solid fa-moon text-base';
  });
  document.querySelectorAll('[data-theme-toggle]').forEach(button => {
    button.setAttribute('aria-label', isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
    button.setAttribute('title', isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const isDark = document.documentElement.classList.contains('dark');
  document.querySelectorAll('[data-theme-icon]').forEach(icon => {
    icon.className = isDark ? 'fa-solid fa-sun text-base' : 'fa-solid fa-moon text-base';
  });
  document.querySelectorAll('[data-theme-toggle]').forEach(button => {
    button.setAttribute('aria-label', isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
    button.setAttribute('title', isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
  });
});
