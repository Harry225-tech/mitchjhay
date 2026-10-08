/*
 * Theme switching for Mitch Jhay Auto & Rentals.
 *
 * Loaded in the <head> of every page BEFORE the stylesheet so the correct theme is
 * already on <html> before the first paint (no flash of the wrong theme).
 * No inline scripts, no libraries, no animation. Icons come from Material Design.
 *
 * Rules:
 * - The visitor's explicit choice is remembered in localStorage (wrapped in try/catch,
 *   so the site still works when storage is blocked).
 * - With no stored choice, the theme follows the system setting (prefers-color-scheme).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'mj-theme';
  var DARK = 'dark';
  var LIGHT = 'light';

  /* Browser chrome colour per theme: matches the top of the page (the dark header). */
  var THEME_COLOR = { light: '#111111', dark: '#1a1a1a' };
  var TOGGLE_LABEL = { light: 'Switch to dark mode', dark: 'Switch to light mode' };

  var root = document.documentElement;

  function systemTheme() {
    if (typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return DARK;
    }
    return LIGHT;
  }

  function readStoredTheme() {
    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);
      return stored === DARK || stored === LIGHT ? stored : null;
    } catch (error) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      /* Storage blocked or full: the theme still applies to this page. */
    }
  }

  function currentTheme() {
    return root.getAttribute('data-theme') === DARK ? DARK : LIGHT;
  }

  function applyTheme(theme) {
    if (theme === DARK) {
      root.setAttribute('data-theme', DARK);
    } else {
      root.removeAttribute('data-theme');
    }

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', THEME_COLOR[theme]);
    }

    var buttons = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < buttons.length; i += 1) {
      buttons[i].setAttribute('aria-label', TOGGLE_LABEL[theme]);
      buttons[i].setAttribute('aria-pressed', theme === DARK ? 'true' : 'false');
    }
  }

  /* Runs before the first paint. */
  applyTheme(readStoredTheme() || systemTheme());

  /*
   * One delegated handler serves the header button and the mobile bar button on every
   * page, and it works as soon as the button is parsed.
   */
  document.addEventListener('click', function (event) {
    var target = event.target;
    var toggle = target && target.closest ? target.closest('[data-theme-toggle]') : null;
    if (!toggle) {
      return;
    }
    var next = currentTheme() === DARK ? LIGHT : DARK;
    applyTheme(next);
    storeTheme(next);
  });

  /* Keep the button labels and aria-pressed correct once the markup is parsed. */
  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(currentTheme());
  });

  /* While the visitor has made no choice, keep following the system setting. */
  if (typeof window.matchMedia === 'function') {
    var query = window.matchMedia('(prefers-color-scheme: dark)');
    var onSystemChange = function () {
      if (readStoredTheme()) {
        return;
      }
      applyTheme(systemTheme());
    };
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', onSystemChange);
    } else if (typeof query.addListener === 'function') {
      query.addListener(onSystemChange);
    }
  }
})();
