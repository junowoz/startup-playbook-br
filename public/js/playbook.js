'use strict';

/**
 * Startup Playbook (pt-BR) — vanilla port of the old $-based reference
 * script. No dependencies. Faithful to that original except:
 *  - the mobile h3/circle "clone" setup was dropped: the static markup it
 *    used to inject is now already present in index.html, so cloning it
 *    again would duplicate it.
 *  - scroll math runs inside requestAnimationFrame instead of on every
 *    'scroll' event, and also re-runs on 'resize' (the window-height term
 *    in the trigger formula makes that necessary, which the original
 *    script never accounted for).
 */
(function () {
  var PAGES = [
    'idea',
    'team',
    'product',
    'execution',
    'growth',
    'focus',
    'ceo',
    'hiring',
    'competition',
    'money',
    'fundraising',
    'closing'
  ];

  // Old (accented) anchor ids -> new (ASCII) anchor ids, so links shared
  // before the rename keep working.
  var HASH_MAP = {
    'execução': 'execucao',
    'contratação': 'contratacao'
  };

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function scrollY() {
    return window.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || 0;
  }

  function docTop(el) {
    var rect = el.getBoundingClientRect();
    return rect.top + scrollY();
  }

  // ---------------------------------------------------------------------
  // Hash compatibility shim: rewrite old accented hashes to the new ones.
  // ---------------------------------------------------------------------
  function normalizeHash() {
    if (!location.hash || location.hash.length < 2) return;

    var raw = location.hash.slice(1);
    var decoded = raw;
    try {
      decoded = decodeURIComponent(raw);
    } catch (err) {
      // Malformed percent-encoding: fall back to the raw hash.
      decoded = raw;
    }

    var mapped = HASH_MAP[decoded];
    if (!mapped) return;

    var target = document.getElementById(mapped);

    if (window.history && typeof window.history.replaceState === 'function') {
      window.history.replaceState(null, '', '#' + mapped);
    } else {
      location.hash = '#' + mapped;
    }

    if (target) {
      target.scrollIntoView();
    }
  }

  // ---------------------------------------------------------------------
  // Scroll-triggered `.on` class per section.
  // Original formula: scrollTop + ((windowHeight - 420) / 2) > offsetTop
  // ---------------------------------------------------------------------
  function setupSectionToggle() {
    var sections = [];
    for (var i = 0; i < PAGES.length; i++) {
      var el = document.querySelector('.bg-' + PAGES[i]);
      if (el) {
        sections.push({ el: el, on: false });
      }
    }
    if (!sections.length) return null;

    return function update() {
      var top = scrollY();
      var windowHeight = window.innerHeight;

      for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var offsetTop = docTop(section.el);
        var value = top + ((windowHeight - 420) / 2) > offsetTop;

        if (value !== section.on) {
          section.el.classList.toggle('on', value);
          section.on = value;
        }
      }
    };
  }

  // ---------------------------------------------------------------------
  // Closing sunset parallax (sky opacity + sun transform).
  // ---------------------------------------------------------------------
  function setupClosingParallax() {
    var closing = document.querySelector('.bg-closing');
    var closingSky = document.querySelector('.bg-closing .sky');
    var sky1 = document.querySelector('.sky1');
    var sky2 = document.querySelector('.sky2');
    var sun = document.querySelector('.sun');

    if (!closing || !closingSky || !sky1 || !sky2 || !sun) return null;

    var skyEls = { 1: sky1, 2: sky2 };

    function fire(i, prct, s) {
      if (s === -0) s = 0;

      var opacity = 0;
      if (i === s) {
        opacity = (prct - ((s - 1) * 0.5)) * 2;
      } else if (i < s) {
        opacity = 1;
      }

      skyEls[i].style.opacity = opacity;
      if (i === 1) {
        sun.style.transform =
          'translate(' + (100 * opacity) + 'px,' + (250 * opacity) + 'px) rotate(' + (20 * opacity) + 'deg)';
      }
    }

    return function update() {
      var top = scrollY();
      var windowHeight = window.innerHeight;
      var closingSkyHeight = closingSky.offsetHeight;
      var closingOffsetTop = docTop(closing);

      var prct = (top - closingSkyHeight + windowHeight - closingOffsetTop) / (windowHeight - closingSkyHeight);
      var s = Math.ceil(prct * 2);

      fire(1, prct, s);
      fire(2, prct, s);
    };
  }

  // ---------------------------------------------------------------------
  // rAF-throttled scroll/resize driver for the two effects above.
  // ---------------------------------------------------------------------
  function initScrollEffects() {
    var updateSections = setupSectionToggle();
    var updateParallax = prefersReducedMotion() ? null : setupClosingParallax();

    if (!updateSections && !updateParallax) return;

    var ticking = false;
    function onFrame() {
      ticking = false;
      if (updateSections) updateSections();
      if (updateParallax) updateParallax();
    }
    function onScrollOrResize() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(onFrame);
    }

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    // Set the correct initial state in case the page loads already
    // scrolled (e.g. arriving via an anchor hash).
    onFrame();
  }

  // ---------------------------------------------------------------------
  // Smooth anchor scrolling for `.top a`, `.bottom-toc` and `.toc a`.
  // ---------------------------------------------------------------------
  function initAnchorScrolling() {
    var behavior = prefersReducedMotion() ? 'auto' : 'smooth';

    document.addEventListener('click', function (e) {
      if (!e.target || typeof e.target.closest !== 'function') return;

      var link = e.target.closest('a');
      if (!link) return;

      var withinTop = link.closest('.top');
      var isBottomToc = link.classList && link.classList.contains('bottom-toc');
      var withinToc = link.closest('.toc');

      if (!withinTop && !isBottomToc && !withinToc) return;

      var target = null;

      if (withinTop || isBottomToc) {
        // Legacy behavior: always scroll to the table of contents,
        // regardless of the link's own href.
        target = document.getElementById('toc');
      } else {
        var href = link.getAttribute('href') || '';
        if (href.charAt(0) !== '#' || href.length < 2) return;
        target = document.getElementById(href.slice(1));
      }

      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: behavior, block: 'start' });
    }, false);
  }

  function init() {
    normalizeHash();
    initScrollEffects();
    initAnchorScrolling();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
