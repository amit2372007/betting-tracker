/**
 * BetTracker Pro - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Sidebar mobile toggle ──────────────────────────────────────────────
  window.toggleSidebar = function () {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.toggle('sidebar--open');
    if (overlay) overlay.classList.toggle('overlay--visible');
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
      if (sidebar && sidebar.classList.contains('sidebar--open')) {
        sidebar.classList.remove('sidebar--open');
        overlay && overlay.classList.remove('overlay--visible');
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

  // ── Close sidebar on navigation link click (mobile) ─────────────────
  document.querySelectorAll('.sidebar-link').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1024) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        if (sidebar) sidebar.classList.remove('sidebar--open');
        if (overlay) overlay.classList.remove('overlay--visible');
      }
    });
  });

  // ── Close sidebar when clicking overlay ──────────────────────────────
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('sidebar--open');
      overlay.classList.remove('overlay--visible');
    });
  }

  console.log('🎲 BetTracker Pro initialized');
});

// ── Responsive enhancements ────────────────────────────────────────────

// Close sidebar on route change (mobile)
window.addEventListener('popstate', () => {
  if (window.innerWidth < 1024) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.remove('sidebar--open');
    if (overlay) overlay.classList.remove('overlay--visible');
  }
});

// Resize handler for responsive adjustments
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Auto-close sidebar on desktop resize
    if (window.innerWidth >= 1024) {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('overlay');
      if (sidebar) sidebar.classList.remove('sidebar--open');
      if (overlay) overlay.classList.remove('overlay--visible');
    }
  }, 250);
});

// Touch-friendly table scrolling indicator
document.querySelectorAll('.table-container').forEach(container => {
  const indicator = document.createElement('div');
  indicator.className = 'scroll-indicator';
  indicator.textContent = '← Scroll →';
  indicator.style.cssText = 'position:absolute;top:10px;right:10px;background:rgba(59,130,246,0.9);color:white;padding:4px 12px;border-radius:6px;font-size:11px;pointer-events:none;opacity:0;transition:opacity 0.3s;';
  
  container.style.position = 'relative';
  container.appendChild(indicator);

  // Show indicator if table is scrollable
  if (container.scrollWidth > container.clientWidth) {
    indicator.style.opacity = '1';
    setTimeout(() => indicator.style.opacity = '0', 3000);
  }

  container.addEventListener('scroll', () => {
    indicator.style.opacity = '0';
  });
});
