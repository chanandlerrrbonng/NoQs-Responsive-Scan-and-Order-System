/* ════════════════════════════════════════════════════════════
   NoQs Scan & Order – script.js
   Interactive enhancements: hamburger nav, filter chips,
   add-to-cart, wishlist toggles, cart counter updates.
   ════════════════════════════════════════════════════════════ */

'use strict';

// ── Cart State ──────────────────────────────────────────────
const cart = { count: 3, total: 477 };

// ── Hamburger / Mobile Nav ──────────────────────────────────
const hamburger = document.querySelector('.btn-hamburger');
const mobileNav  = document.getElementById('mobile-nav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    mobileNav.setAttribute('aria-hidden', String(expanded));
  });

  // Close on link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    }
  });
}

// ── Filter Chips ─────────────────────────────────────────────
const filterChips = document.querySelectorAll('.filter-chip');

filterChips.forEach(chip => {
  chip.addEventListener('click', () => {
    filterChips.forEach(c => {
      c.classList.remove('active');
      c.setAttribute('aria-pressed', 'false');
    });
    chip.classList.add('active');
    chip.setAttribute('aria-pressed', 'true');
  });
});

// ── Add to Cart ──────────────────────────────────────────────
const addBtns       = document.querySelectorAll('.btn-add');
const cartBadge     = document.querySelector('.cart-badge');
const headerCart    = document.querySelector('.btn-cart');
const stickyCount   = document.querySelector('.sticky-cart-count');
const stickyTotal   = document.querySelector('.sticky-cart-total');

function updateCartDisplay() {
  if (cartBadge)  { cartBadge.textContent = cart.count; }
  if (headerCart) { headerCart.setAttribute('aria-label', `View cart – ${cart.count} item${cart.count !== 1 ? 's' : ''}`); }
  if (stickyCount){ stickyCount.textContent = `${cart.count} item${cart.count !== 1 ? 's' : ''}`; }
  if (stickyTotal){ stickyTotal.textContent = `₹${cart.total}`; }

  // Re-trigger badge pop animation
  if (cartBadge) {
    cartBadge.style.animation = 'none';
    // Force reflow
    void cartBadge.offsetWidth;
    cartBadge.style.animation = '';
  }
}

addBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    // Get price from card
    const card        = btn.closest('.product-card');
    const priceEl     = card?.querySelector('.price-current');
    const priceText   = priceEl?.textContent.replace('₹', '').trim();
    const price       = parseInt(priceText, 10) || 0;
    const productName = card?.querySelector('.card-name')?.textContent || 'Item';

    // Update cart
    cart.count++;
    cart.total += price;
    updateCartDisplay();

    // Button feedback
    const origHTML = btn.innerHTML;
    btn.innerHTML  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Added!`;
    btn.style.background = '#1A8C47';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML  = origHTML;
      btn.style.background = '';
      btn.disabled = false;
    }, 1600);

    // Announce for screen readers
    announceToSR(`${productName} added to cart. Total: ₹${cart.total}`);
  });
});

// ── Wishlist Toggle ───────────────────────────────────────────
const wishlistBtns = document.querySelectorAll('.btn-wishlist');

wishlistBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    const active = btn.getAttribute('data-active') === 'true';
    btn.setAttribute('data-active', String(!active));

    const svg = btn.querySelector('path');
    if (!active) {
      svg.setAttribute('fill', '#e11d48');
      svg.setAttribute('stroke', '#e11d48');
      btn.style.color = '#e11d48';
      btn.style.background = '#fff1f2';
    } else {
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      btn.style.color = '';
      btn.style.background = '';
    }
  });
});

// ── Offer CTA: Copy Code ──────────────────────────────────────
document.querySelectorAll('.btn-offer').forEach(btn => {
  if (btn.textContent.includes('Copy Code')) {
    btn.addEventListener('click', () => {
      navigator.clipboard?.writeText('NOQS10').catch(() => {});
      const orig = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    });
  }
});

// ── Sticky Cart: scroll-to-top on view cart ───────────────────
const viewCartBtn = document.querySelector('.btn-view-cart');
viewCartBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Accessible Live Region Helper ────────────────────────────
let srRegion = document.getElementById('sr-live');
if (!srRegion) {
  srRegion = document.createElement('div');
  srRegion.id = 'sr-live';
  srRegion.setAttribute('aria-live', 'polite');
  srRegion.setAttribute('aria-atomic', 'true');
  srRegion.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap';
  document.body.appendChild(srRegion);
}

function announceToSR(message) {
  srRegion.textContent = '';
  // Small delay ensures DOM mutation is noticed
  setTimeout(() => { srRegion.textContent = message; }, 50);
}

// ── Filter chip scroll-to-menu on All Items ───────────────────
filterChips[0]?.addEventListener('click', () => {
  document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ── Intersection Observer: animate cards on scroll ────────────
if ('IntersectionObserver' in window) {
  const cards = document.querySelectorAll('.product-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.animationPlayState = 'paused';
    observer.observe(card);
  });
}

console.log('%cNoQs Scan & Order — UI loaded ✓', 'color:#47128C;font-weight:bold;font-size:14px;');