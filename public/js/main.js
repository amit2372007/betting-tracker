/**
 * BetTracker Pro - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Sidebar mobile toggle ──────────────────────────────────────────────
  window.toggleSidebar = function () {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.toggle('-translate-x-full');
    if (overlay) overlay.classList.toggle('hidden');
  };

  // ── Auto remove flash messages ────────────────────────────────────────
  setTimeout(() => {
    ['flash-success', 'flash-error'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.transition = 'opacity 0.5s';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 500);
      }
    });
  }, 4000);

  // ── Confirm delete on all delete forms ───────────────────────────────
  document.querySelectorAll('form[data-confirm]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      if (!confirm(form.dataset.confirm)) {
        e.preventDefault();
      }
    });
  });

  // ── Number counter animation on dashboard ────────────────────────────
  function animateCounter(el, target, duration = 1000) {
    const start = 0;
    const step = (timestamp) => {
      if (!el._startTime) el._startTime = timestamp;
      const progress = Math.min((timestamp - el._startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Only animate on dashboard
  if (window.location.pathname === '/') {
    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = parseInt(el.dataset.count);
      if (!isNaN(target)) animateCounter(el, target);
    });
  }

  // ── Table row click to navigate ──────────────────────────────────────
  document.querySelectorAll('tr[data-href]').forEach((row) => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
      window.location.href = row.dataset.href;
    });
  });

  // ── Tooltip on hover for truncated text ──────────────────────────────
  document.querySelectorAll('[data-tooltip]').forEach((el) => {
    el.title = el.dataset.tooltip;
  });

  // ── Filter form auto-submit on select change ─────────────────────────
  const filterForm = document.getElementById('filterForm');
  if (filterForm) {
    filterForm.querySelectorAll('select').forEach((select) => {
      select.addEventListener('change', () => {
        // Only auto-submit on small screens or if explicitly flagged
        if (window.innerWidth < 768) filterForm.submit();
      });
    });
  }

  // ── Keyboard shortcuts ───────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N = New bet
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      window.location.href = '/bets/new';
    }
    // Ctrl/Cmd + D = Dashboard
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      window.location.href = '/';
    }
    // Escape = close sidebar on mobile
    if (e.key === 'Escape') {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('overlay');
      if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.add('-translate-x-full');
        overlay && overlay.classList.add('hidden');
      }
    }
  });

  // ── Input formatting ─────────────────────────────────────────────────
  // Format numbers on blur
  document.querySelectorAll('input[type="number"][data-format="currency"]').forEach((input) => {
    input.addEventListener('blur', () => {
      if (input.value) {
        input.value = parseFloat(input.value).toFixed(2);
      }
    });
  });

  console.log('🎲 BetTracker Pro initialized');
});
