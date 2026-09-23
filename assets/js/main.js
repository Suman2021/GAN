/* ==========================================================================
   LAB 4011 - Algorithms, Networks & Intelligent Systems Laboratory
   Interactive Client-Side Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNetworkCanvas();
  initMemberFilters();
  initMemberSearch();
  initBioModal();
  initScrollSpy();
  initMobileMenu();
  initCopyActions();
  initBackToTop();
});

/* --------------------------------------------------------------------------
   1. Dark / Light Mode Theme Toggle
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  const currentTheme = localStorage.getItem('lab4011_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(themeToggleBtn, currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = activeTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('lab4011_theme', newTheme);
    updateThemeIcon(themeToggleBtn, newTheme);
  });
}

function updateThemeIcon(btn, theme) {
  const icon = btn.querySelector('i');
  if (!icon) return;
  if (theme === 'light') {
    icon.className = 'fa-solid fa-moon';
    btn.setAttribute('title', 'Switch to Dark Mode');
    btn.setAttribute('aria-label', 'Switch to Dark Mode');
  } else {
    icon.className = 'fa-solid fa-sun';
    btn.setAttribute('title', 'Switch to Light Mode');
    btn.setAttribute('aria-label', 'Switch to Light Mode');
  }
}

/* --------------------------------------------------------------------------
   2. Interactive Network Graph Canvas (Graph Theory / Network nodes)
   -------------------------------------------------------------------------- */
function initNetworkCanvas() {
  const canvas = document.getElementById('hero-network-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const particleCount = 45;
  const maxDistance = 140;

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 2 + 1.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? 'rgba(99, 102, 241, 0.7)' : 'rgba(79, 70, 229, 0.5)';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const opacity = (1 - dist / maxDistance) * (isDark ? 0.25 : 0.15);
          ctx.strokeStyle = isDark ? `rgba(6, 182, 212, ${opacity})` : `rgba(8, 145, 178, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }

  animate();
}

/* --------------------------------------------------------------------------
   3. Member Category Filtering
   -------------------------------------------------------------------------- */
function initMemberFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const memberCards = document.querySelectorAll('.member-card');
  const noMembersMsg = document.getElementById('no-members-msg');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      const searchTerm = (document.getElementById('member-search')?.value || '').toLowerCase().trim();

      applyMemberFilterAndSearch(filter, searchTerm);
    });
  });
}

/* --------------------------------------------------------------------------
   4. Live Member Search
   -------------------------------------------------------------------------- */
function initMemberSearch() {
  const searchInput = document.getElementById('member-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const filter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';

    applyMemberFilterAndSearch(filter, searchTerm);
  });
}

function applyMemberFilterAndSearch(categoryFilter, searchTerm) {
  const memberCards = document.querySelectorAll('.member-card');
  const noMembersMsg = document.getElementById('no-members-msg');
  let visibleCount = 0;

  memberCards.forEach(card => {
    const cardCategory = card.getAttribute('data-category') || '';
    const name = (card.getAttribute('data-name') || '').toLowerCase();
    const role = (card.getAttribute('data-role') || '').toLowerCase();
    const tags = (card.getAttribute('data-tags') || '').toLowerCase();
    const bio = (card.querySelector('.member-bio-preview')?.textContent || '').toLowerCase();

    const matchesCategory = (categoryFilter === 'all' || cardCategory === categoryFilter);
    const matchesSearch = !searchTerm || (
      name.includes(searchTerm) ||
      role.includes(searchTerm) ||
      tags.includes(searchTerm) ||
      bio.includes(searchTerm)
    );

    if (matchesCategory && matchesSearch) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  if (noMembersMsg) {
    noMembersMsg.style.display = visibleCount === 0 ? 'block' : 'none';
  }
}

/* --------------------------------------------------------------------------
   5. Member Bio Detailed Modal
   -------------------------------------------------------------------------- */
function initBioModal() {
  const modalOverlay = document.getElementById('bio-modal');
  const closeBtn = document.getElementById('modal-close');
  if (!modalOverlay) return;

  // Delegate clicks on "View Full Bio" buttons
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.btn-view-bio');
    if (!trigger) return;

    const card = trigger.closest('.member-card');
    if (!card) return;

    openMemberModal(card);
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function openMemberModal(card) {
  const modalOverlay = document.getElementById('bio-modal');
  if (!modalOverlay) return;

  const name = card.getAttribute('data-name');
  const role = card.getAttribute('data-role');
  const avatarSrc = card.querySelector('.member-avatar')?.getAttribute('src');
  const fullBio = card.getAttribute('data-full-bio');
  const email = card.getAttribute('data-email');
  const scholar = card.getAttribute('data-scholar');
  const linkedin = card.getAttribute('data-linkedin');
  const webpage = card.getAttribute('data-webpage');

  document.getElementById('modal-avatar').src = avatarSrc || '';
  document.getElementById('modal-name').textContent = name || '';
  document.getElementById('modal-role').textContent = role || '';
  document.getElementById('modal-bio-text').textContent = fullBio || '';

  const linksContainer = document.getElementById('modal-links-container');
  linksContainer.innerHTML = '';

  if (email) {
    const emailLink = document.createElement('a');
    emailLink.className = 'social-btn email-btn';
    emailLink.href = `mailto:${email}`;
    emailLink.innerHTML = `<i class="fa-solid fa-envelope"></i> Email: ${email}`;
    linksContainer.appendChild(emailLink);
  }

  if (scholar) {
    const scholarLink = document.createElement('a');
    scholarLink.className = 'social-btn';
    scholarLink.href = scholar;
    scholarLink.target = '_blank';
    scholarLink.rel = 'noopener noreferrer';
    scholarLink.innerHTML = `<i class="fa-solid fa-graduation-cap"></i> Google Scholar`;
    linksContainer.appendChild(scholarLink);
  }

  if (linkedin) {
    const linkedinLink = document.createElement('a');
    linkedinLink.className = 'social-btn';
    linkedinLink.href = linkedin.startsWith('http') ? linkedin : `https://${linkedin}`;
    linkedinLink.target = '_blank';
    linkedinLink.rel = 'noopener noreferrer';
    linkedinLink.innerHTML = `<i class="fa-brands fa-linkedin"></i> LinkedIn`;
    linksContainer.appendChild(linkedinLink);
  }

  if (webpage) {
    const webLink = document.createElement('a');
    webLink.className = 'social-btn';
    webLink.href = webpage.startsWith('http') ? webpage : `https://${webpage}`;
    webLink.target = '_blank';
    webLink.rel = 'noopener noreferrer';
    webLink.innerHTML = `<i class="fa-solid fa-globe"></i> Personal Website`;
    linksContainer.appendChild(webLink);
  }

  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/* --------------------------------------------------------------------------
   6. Scroll Spy & Sticky Navbar
   -------------------------------------------------------------------------- */
function initScrollSpy() {
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    // Navbar scrolled state
    if (scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Scroll spy
    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

/* --------------------------------------------------------------------------
   7. Mobile Navigation Menu
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
    const isOpen = navLinks.classList.contains('mobile-open');
    toggleBtn.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
  });
}

/* --------------------------------------------------------------------------
   8. Copy Citation & Email Helpers with Toast
   -------------------------------------------------------------------------- */
function initCopyActions() {
  document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('[data-copy]');
    if (!copyBtn) return;

    const textToCopy = copyBtn.getAttribute('data-copy');
    const label = copyBtn.getAttribute('data-copy-label') || 'Text';

    if (navigator.clipboard && textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`${label} copied to clipboard!`);
      }).catch(() => {
        fallbackCopy(textToCopy, label);
      });
    }
  });
}

function fallbackCopy(text, label) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast(`${label} copied to clipboard!`);
  } catch (err) {
    showToast('Failed to copy');
  }
  document.body.removeChild(textarea);
}

function showToast(message) {
  let toast = document.getElementById('site-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'site-toast';
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span id="toast-message"></span>`;
    document.body.appendChild(toast);
  }

  const msgSpan = document.getElementById('toast-message');
  if (msgSpan) msgSpan.textContent = message;

  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* --------------------------------------------------------------------------
   9. Back to Top Button
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (!backToTopBtn) return;

  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
