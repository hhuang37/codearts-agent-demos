/* ==========================================================================
   Aurelle — Premium E-Commerce Homepage Behavior
   Vanilla ES6, classic script (no modules/imports) so it runs from file://.
   Contents:
     1. Product data (single source of truth for the product grid)
     2. Application state
     3. Small helpers (defensive DOM lookups, formatting, escaping)
     4. Product rendering (renderProducts) + filtering
     5. Interactions: tabs, category tiles, search, mobile menu,
        add-to-cart, newsletter validation, back-to-top, scroll-reveal
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. Product data
     At least one product per each of the 12 categories so no filter
     is ever empty. Model: id, name, category, price, originalPrice,
     rating (0-5), reviewsCount, badge (string|null), description, emoji.
     ------------------------------------------------------------------ */
  const PRODUCTS = [
    {
      id: 'p-001',
      name: 'Aurora Wireless Headphones',
      category: 'Electronics',
      price: 129.99,
      originalPrice: 179.99,
      rating: 4.7,
      reviewsCount: 342,
      badge: 'Bestseller',
      description: 'Studio-grade sound with 40 hours of battery life.',
      emoji: '🎧'
    },
    {
      id: 'p-002',
      name: 'Pulse Fit Smart Watch',
      category: 'Electronics',
      price: 89.5,
      originalPrice: null,
      rating: 4.5,
      reviewsCount: 218,
      badge: 'New',
      description: 'Track workouts, sleep, and heart rate in style.',
      emoji: '⌚'
    },
    {
      id: 'p-003',
      name: 'Linen Blend Camp Shirt',
      category: 'Fashion & Apparel',
      price: 45.0,
      originalPrice: 59.99,
      rating: 4.3,
      reviewsCount: 156,
      badge: null,
      description: 'Breathable Italian linen for effortless warm-weather style.',
      emoji: '👔'
    },
    {
      id: 'p-004',
      name: 'Cloudweave Knit Throw',
      category: 'Home & Living',
      price: 39.99,
      originalPrice: null,
      rating: 4.8,
      reviewsCount: 421,
      badge: 'Bestseller',
      description: 'An impossibly soft chunky knit in warm ivory.',
      emoji: '🛋️'
    },
    {
      id: 'p-005',
      name: 'Rose Botanical Face Serum',
      category: 'Beauty & Personal Care',
      price: 28.75,
      originalPrice: 34.0,
      rating: 4.6,
      reviewsCount: 289,
      badge: null,
      description: 'A lightweight serum with damask rose and vitamin C.',
      emoji: '🧴'
    },
    {
      id: 'p-006',
      name: 'Trailblazer Trail Sneakers',
      category: 'Sports & Outdoors',
      price: 79.2,
      originalPrice: 99.0,
      rating: 4.4,
      reviewsCount: 198,
      badge: '−20%',
      description: 'Grippy, water-resistant trail shoes built for long hikes.',
      emoji: '👟'
    },
    {
      id: 'p-007',
      name: 'The Art of Slow Living',
      category: 'Books & Stationery',
      price: 24.0,
      originalPrice: null,
      rating: 4.9,
      reviewsCount: 512,
      badge: 'Bestseller',
      description: 'A beautifully photographed guide to intentional living.',
      emoji: '📚'
    },
    {
      id: 'p-008',
      name: 'Wooden Rainbow Stacker',
      category: 'Toys & Kids',
      price: 32.5,
      originalPrice: null,
      rating: 4.8,
      reviewsCount: 176,
      badge: 'New',
      description: 'Hand-finished beech blocks in twelve soft shades.',
      emoji: '🧸'
    },
    {
      id: 'p-009',
      name: 'Single-Origin Espresso Beans',
      category: 'Groceries & Gourmet',
      price: 18.95,
      originalPrice: 22.5,
      rating: 4.7,
      reviewsCount: 623,
      badge: null,
      description: 'Dark chocolate and cherry notes from a Colombian estate.',
      emoji: '☕'
    },
    {
      id: 'p-010',
      name: 'All-Weather Car Cover',
      category: 'Automotive',
      price: 64.0,
      originalPrice: null,
      rating: 4.2,
      reviewsCount: 87,
      badge: null,
      description: 'Breathable, UV-resistant protection for year-round parking.',
      emoji: '🚗'
    },
    {
      id: 'p-011',
      name: 'Daily Multivitamin Complex',
      category: 'Health & Wellness',
      price: 21.99,
      originalPrice: null,
      rating: 4.5,
      reviewsCount: 254,
      badge: null,
      description: 'Twenty-three essential nutrients in one daily capsule.',
      emoji: '💊'
    },
    {
      id: 'p-012',
      name: 'Aurelle Pendant Necklace',
      category: 'Jewelry & Watches',
      price: 189.0,
      originalPrice: 249.0,
      rating: 4.8,
      reviewsCount: 143,
      badge: 'Bestseller',
      description: 'A 14-karat gold pendant on a fine cable chain.',
      emoji: '📿'
    },
    {
      id: 'p-013',
      name: 'Cozy Calming Pet Bed',
      category: 'Pets',
      price: 42.0,
      originalPrice: 55.0,
      rating: 4.6,
      reviewsCount: 231,
      badge: null,
      description: 'An ultra-plush donut bed that soothes anxious pets.',
      emoji: '🐾'
    },
    {
      id: 'p-014',
      name: 'Velvet Matte Lip Trio',
      category: 'Beauty & Personal Care',
      price: 26.0,
      originalPrice: null,
      rating: 4.4,
      reviewsCount: 167,
      badge: 'New',
      description: 'Three long-wear matte shades in rosewood, brick, and plum.',
      emoji: '💄'
    }
  ];

  /* ------------------------------------------------------------------
     2. Application state (in-memory only; no storage, no network)
     ------------------------------------------------------------------ */
  const state = {
    activeFilter: 'All',
    searchQuery: '',
    cartCount: 0
  };

  /* ------------------------------------------------------------------
     3. Helpers — defensive DOM lookups and formatting utilities
     ------------------------------------------------------------------ */

  /** querySelector with a null-safe contract: callers still must check. */
  const $ = (selector, scope) => (scope || document).querySelector(selector);

  /** querySelectorAll that always returns a real array. */
  const $$ = (selector, scope) => Array.prototype.slice.call((scope || document).querySelectorAll(selector));

  /** True when the user asked the OS to reduce motion. */
  const prefersReducedMotion = () =>
    Boolean(window.matchMedia) && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** "$129.99" from a number; tolerates bad input defensively. */
  const formatPrice = (value) => {
    const amount = Number(value);
    const safe = Number.isFinite(amount) ? amount : 0;
    return '$' + safe.toFixed(2);
  };

  /** Escape HTML-sensitive characters before injecting any string. */
  const escapeHTML = (value) =>
    String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => {
      switch (ch) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        default: return '&#39;';
      }
    });

  /** Safe closest() that tolerates non-element event targets (text nodes). */
  const closest = (target, selector) =>
    target instanceof Element ? target.closest(selector) : null;

  /** Smoothly scroll to a section; falls back to 'auto' under reduced motion. */
  const scrollToSection = (selector) => {
    const target = $(selector);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.pageYOffset - 84;
    window.scrollTo({ top: Math.max(top, 0), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  /* ------------------------------------------------------------------
     4. Product rendering + filtering
     ------------------------------------------------------------------ */

  /** Five gold star glyphs derived from the rounded rating (decorative). */
  const buildStars = (rating) => {
    const rounded = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    let stars = '';
    for (let i = 1; i <= 5; i += 1) {
      stars += i <= rounded ? '★' : '☆';
    }
    return '<span class="rating-stars" aria-hidden="true">' + stars + '</span>';
  };

  /** One product card; the whole grid is built from this template. */
  const productCardHTML = (product) => {
    const badge = product.badge
      ? '<span class="card-badge">' + escapeHTML(product.badge) + '</span>'
      : '';
    const originalPrice = product.originalPrice
      ? '<span class="price-original">' + formatPrice(product.originalPrice) + '</span>'
      : '';
    const name = escapeHTML(product.name);
    return (
      '<article class="product-card" data-product-id="' + escapeHTML(product.id) + '">' +
        '<div class="card-media">' + badge +
          '<span class="card-emoji" aria-hidden="true">' + escapeHTML(product.emoji) + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<p class="card-category">' + escapeHTML(product.category) + '</p>' +
          '<h3 class="card-name">' + name + '</h3>' +
          '<p class="card-rating">' +
            buildStars(product.rating) +
            '<span class="rating-value">' + Number(product.rating).toFixed(1) + '</span>' +
            '<span class="rating-count">(' + Number(product.reviewsCount).toLocaleString('en-US') + ' reviews)</span>' +
          '</p>' +
          '<div class="card-footer">' +
            '<p class="card-pricing">' +
              '<span class="price-current">' + formatPrice(product.price) + '</span>' +
              originalPrice +
            '</p>' +
            '<button class="add-to-cart-btn" type="button" data-id="' + escapeHTML(product.id) + '"' +
              ' aria-label="Add ' + name + ' to cart">Add to cart</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  };

  /** Products matching the active tab filter AND the text query. */
  const getVisibleProducts = () => {
    const query = state.searchQuery.trim().toLowerCase();
    return PRODUCTS.filter((product) => {
      const matchesFilter =
        state.activeFilter === 'All' || product.category === state.activeFilter;
      const haystack = (product.name + ' ' + product.category + ' ' + product.description)
        .toLowerCase();
      const matchesQuery = query === '' || haystack.indexOf(query) !== -1;
      return matchesFilter && matchesQuery;
    });
  };

  /**
   * Render the product grid from PRODUCTS (fade-in via staggered delays),
   * refresh the screen-reader status line, and toggle the empty state.
   */
  const renderProducts = () => {
    const grid = $('#productGrid');
    if (!grid) return;

    const visible = getVisibleProducts();
    grid.innerHTML = visible.map(productCardHTML).join('');

    const reduceMotion = prefersReducedMotion();
    $$('.product-card', grid).forEach((card, index) => {
      card.style.animationDelay = reduceMotion ? '0ms' : Math.min(index * 45, 315) + 'ms';
    });

    const status = $('#filterStatus');
    if (status) {
      status.textContent =
        visible.length === PRODUCTS.length
          ? 'Showing all ' + visible.length + ' products.'
          : 'Showing ' + visible.length + ' of ' + PRODUCTS.length + ' products.';
    }

    const noResults = $('#noResults');
    if (noResults) noResults.hidden = visible.length !== 0;
  };

  /** Apply a tab filter, sync tab visuals, and re-render. */
  const setFilter = (filter) => {
    state.activeFilter = filter || 'All';
    $$('.tab-btn').forEach((btn) => {
      const isActive = btn.getAttribute('data-filter') === state.activeFilter;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    renderProducts();
  };

  /* ------------------------------------------------------------------
     5. Interactions
     ------------------------------------------------------------------ */

  /** Category tab strip: clicking a tab filters the grid. */
  const initTabs = () => {
    const strip = $('#productTabs');
    if (!strip) return;
    strip.addEventListener('click', (event) => {
      const btn = closest(event.target, '.tab-btn');
      if (!btn) return;
      setFilter(btn.getAttribute('data-filter'));
    });
  };

  /** Category tiles: jump to the grid with that category pre-filtered. */
  const initCategoryTiles = () => {
    $$('.category-tile').forEach((tile) => {
      tile.addEventListener('click', () => {
        const category = tile.getAttribute('data-category');
        if (!category) return;
        state.searchQuery = '';
        const input = $('#searchInput');
        if (input) input.value = '';
        setFilter(category);
        scrollToSection('#products');
      });
    });
  };

  /** Header search: live text filter; Enter scrolls to the grid. */
  const initSearch = () => {
    const form = $('#searchForm');
    const input = $('#searchInput');

    if (input) {
      input.addEventListener('input', () => {
        state.searchQuery = input.value;
        renderProducts();
      });
    }

    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (input) state.searchQuery = input.value;
        renderProducts();
        scrollToSection('#products');
      });
    }

    const clearButton = $('#clearSearch');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        state.searchQuery = '';
        if (input) input.value = '';
        setFilter('All');
        if (input) input.focus();
      });
    }
  };

  /** Mobile menu: hamburger toggle, overlay/Escape/link close. */
  const initMobileMenu = () => {
    const toggle = $('#mobileMenuToggle');
    const menu = $('#mobileMenu');
    const overlay = $('#mobileOverlay');
    if (!toggle || !menu) return;

    const isOpen = () => menu.classList.contains('is-open');

    const setOpen = (open) => {
      menu.classList.toggle('is-open', open);
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (overlay) overlay.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-locked', open);
    };

    toggle.addEventListener('click', () => setOpen(!isOpen()));

    if (overlay) {
      overlay.addEventListener('click', () => setOpen(false));
    }

    $$('.mobile-menu-link', menu).forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });
  };

  /** Add-to-cart (event delegation): counter + pulse + duplicate guard. */
  const initAddToCart = () => {
    const countEl = $('#cartCount');
    const cartButton = $('#cartButton');
    if (!countEl || !cartButton) return;

    // Per-button duplicate-click guard: keyed by element, so rapid clicks on
    // DIFFERENT add-to-cart buttons are never suppressed.
    const lastClickAt = new WeakMap();

    const updateBadge = () => {
      countEl.textContent = String(state.cartCount);
      cartButton.setAttribute(
        'aria-label',
        'Shopping cart, ' + state.cartCount + (state.cartCount === 1 ? ' item' : ' items')
      );
      // Restart the pulse animation even on rapid consecutive clicks.
      countEl.classList.remove('is-pulsing');
      void countEl.offsetWidth;
      countEl.classList.add('is-pulsing');
    };

    document.addEventListener('click', (event) => {
      const btn = closest(event.target, '.add-to-cart-btn');
      if (!btn) return;

      const now = Date.now();
      const previousClickAt = lastClickAt.get(btn) || 0;
      if (now - previousClickAt < 150) return; // guard double-fire on this button only
      lastClickAt.set(btn, now);

      state.cartCount += 1;
      updateBadge();

      btn.classList.add('is-added');
      btn.textContent = 'Added ✓';
      window.setTimeout(() => {
        btn.classList.remove('is-added');
        btn.textContent = 'Add to cart';
      }, 1200);
    });
  };

  /** Newsletter: regex validation with inline messages, no page reload. */
  const initNewsletter = () => {
    const form = $('#newsletterForm');
    if (!form) return;

    const input = $('#newsletterEmail');
    const message = $('#newsletterMessage');
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (input) {
      input.addEventListener('input', () => {
        input.classList.remove('is-invalid');
        input.removeAttribute('aria-invalid');
      });
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!input || !message) return;

      const value = input.value.trim();

      if (!EMAIL_PATTERN.test(value)) {
        message.textContent = 'Please enter a valid email address, e.g. name@example.com.';
        message.className = 'newsletter-message is-error';
        message.hidden = false;
        input.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }

      message.textContent = 'Welcome aboard! A confirmation email is on its way to ' + value + '.';
      message.className = 'newsletter-message is-success';
      message.hidden = false;
      input.classList.remove('is-invalid');
      input.removeAttribute('aria-invalid');
      form.reset();
    });
  };

  /** Back-to-top: appears past 600px of scroll, smooth-scrolls home. */
  const initBackToTop = () => {
    const button = $('#backToTop');
    if (!button) return;

    const onScroll = () => {
      button.classList.toggle('is-visible', window.scrollY > 600);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });
  };

  /** Scroll-reveal: staggered .is-visible via IntersectionObserver. */
  const initScrollReveal = () => {
    const items = $$('.reveal');
    if (items.length === 0) return;

    // Reduced motion or missing observer support: show everything at once.
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const parent = el.parentElement || document;
          const siblings = $$('.reveal', parent);
          const index = Math.max(siblings.indexOf(el), 0);
          el.style.transitionDelay = Math.min(index * 70, 420) + 'ms';
          el.classList.add('is-visible');
          observer.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach((el) => observer.observe(el));
  };

  /* ------------------------------------------------------------------
     6. Bootstrap
     ------------------------------------------------------------------ */
  const init = () => {
    renderProducts();
    initTabs();
    initCategoryTiles();
    initSearch();
    initMobileMenu();
    initAddToCart();
    initNewsletter();
    initBackToTop();
    initScrollReveal();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();