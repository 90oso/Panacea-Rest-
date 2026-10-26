'use strict';

/*
 * Panacea Restaurant — shell accessibility / responsive navigation.
 * Intentionally independent from the orders and reservations state machine.
 */
(() => {
  const STORE_KEY = 'panacea.studio.sidebar.v4';
  const THEME_KEY = 'panacea.studio.theme.v4';

  const getStored = (key) => {
    try { return window.localStorage.getItem(key); } catch (_) { return null; }
  };
  const saveStored = (key, value) => {
    try { window.localStorage.setItem(key, value); } catch (_) { /* private browsing */ }
  };

  function boot() {
    const shell = document.getElementById('appShell');
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('sidebarToggle');
    const compactToggle = document.getElementById('sidebarCompactToggle');
    const scrim = document.getElementById('sidebarScrim');
    const themeToggle = document.getElementById('themeSwitch');
    if (!shell || !sidebar || !menuToggle || !compactToggle || !scrim) return;

    const mobileQuery = window.matchMedia('(max-width: 760px)');
    const navButtons = [...sidebar.querySelectorAll('[data-nav]')];
    let desktopMode = getStored(STORE_KEY);
    if (!['expanded', 'compact', 'hidden'].includes(desktopMode)) desktopMode = 'expanded';
    let lastVisibleMode = desktopMode === 'compact' ? 'compact' : 'expanded';
    let mobileOpen = false;

    function updateNavigation() {
      const mobile = mobileQuery.matches;
      const visible = mobile ? mobileOpen : desktopMode !== 'hidden';
      shell.classList.toggle('sidebar-compact', !mobile && desktopMode === 'compact');
      shell.classList.toggle('sidebar-hidden', !mobile && desktopMode === 'hidden');
      shell.classList.toggle('mobile-sidebar-open', mobile && mobileOpen);
      scrim.hidden = !(mobile && mobileOpen);
      document.body.classList.toggle('navigation-open', mobile && mobileOpen);
      sidebar.inert = !visible;

      menuToggle.setAttribute('aria-expanded', String(visible));
      menuToggle.setAttribute('aria-label', visible ? 'Ocultar navegación lateral' : 'Mostrar navegación lateral');
      menuToggle.title = visible ? 'Ocultar navegación lateral' : 'Mostrar navegación lateral';

      const compact = desktopMode === 'compact';
      compactToggle.setAttribute('aria-label', compact ? 'Expandir barra lateral' : 'Contraer barra lateral');
      compactToggle.title = compact ? 'Expandir barra lateral' : 'Contraer barra lateral';
      const iconUse = compactToggle.querySelector('use');
      if (iconUse) iconUse.setAttribute('href', compact ? '#ic-expand' : '#ic-collapse');
    }

    function hideMobile(focusBack = false) {
      if (!mobileOpen) return;
      mobileOpen = false;
      updateNavigation();
      if (focusBack) menuToggle.focus();
    }

    function toggleDesktopVisibility() {
      if (desktopMode === 'hidden') {
        desktopMode = lastVisibleMode;
      } else {
        lastVisibleMode = desktopMode;
        desktopMode = 'hidden';
      }
      saveStored(STORE_KEY, desktopMode);
      updateNavigation();
    }

    menuToggle.addEventListener('click', () => {
      if (mobileQuery.matches) {
        mobileOpen = !mobileOpen;
        updateNavigation();
        if (mobileOpen) navButtons.find(button => button.classList.contains('active'))?.focus();
        else menuToggle.focus();
      } else toggleDesktopVisibility();
    });

    compactToggle.addEventListener('click', () => {
      if (mobileQuery.matches) {
        hideMobile(true);
        return;
      }
      desktopMode = desktopMode === 'compact' ? 'expanded' : 'compact';
      lastVisibleMode = desktopMode;
      saveStored(STORE_KEY, desktopMode);
      updateNavigation();
    });

    scrim.addEventListener('click', () => hideMobile(true));

    // Keep the main controller as the sole owner of navigation/state.
    // This observer only mirrors accessibility and closes the drawer on navigation.
    document.addEventListener('click', event => {
      const target = event.target.closest?.('[data-nav],[data-goto]');
      if (!target) return;
      if (mobileQuery.matches) hideMobile(false);
      requestAnimationFrame(() => {
        const active = shell.querySelector('[data-nav].active');
        for (const button of navButtons) {
          if (button === active) button.setAttribute('aria-current', 'page');
          else button.removeAttribute('aria-current');
        }
      });
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && mobileOpen) {
        event.preventDefault();
        hideMobile(true);
      }
    });

    // MatchMedia old/new listener shape for Safari.
    if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', () => {
      mobileOpen = false;
      updateNavigation();
    });
    else if (mobileQuery.addListener) mobileQuery.addListener(() => {
      mobileOpen = false;
      updateNavigation();
    });

    const themeStored = getStored(THEME_KEY);
    if (themeStored === 'dark') document.documentElement.classList.add('dark');
    if (themeStored === 'light') document.documentElement.classList.remove('dark');

    function syncTheme() {
      if (!themeToggle) return;
      const dark = document.documentElement.classList.contains('dark');
      themeToggle.setAttribute('aria-pressed', String(dark));
      themeToggle.setAttribute('aria-label', dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
      themeToggle.title = dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
      const iconUse = themeToggle.querySelector('use');
      if (iconUse) iconUse.setAttribute('href', dark ? '#ic-sun' : '#ic-moon');
    }
    if (themeToggle) {
      // The existing studio.js theme handler runs first; this handler persists it.
      themeToggle.addEventListener('click', () => {
        saveStored(THEME_KEY, document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        syncTheme();
      });
    }

    updateNavigation();
    syncTheme();

    // Deep linking can initialize an active page without a click.
    const active = shell.querySelector('[data-nav].active');
    if (active) active.setAttribute('aria-current', 'page');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
