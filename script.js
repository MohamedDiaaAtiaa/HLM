/* ═══════════════════════════════════════════════════════════
   HLM LAW ADVOCATES — JavaScript
   Language Toggle, Scroll Animations, Navigation
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // ─── State ───
  let currentLang = 'ar';

  // ─── DOM References ───
  const body = document.body;
  const html = document.documentElement;
  const navbar = document.getElementById('navbar');
  const langToggle = document.getElementById('lang-toggle');
  const menuBtn = document.getElementById('nav-menu-btn');
  const navLinks = document.getElementById('nav-links');

  // ═══════════════════════════════════════════════════
  // LANGUAGE TOGGLE
  // ═══════════════════════════════════════════════════
  langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    applyLanguage(currentLang);
  });

  function applyLanguage(lang) {
    // Update HTML attributes
    if (lang === 'en') {
      html.setAttribute('lang', 'en');
      html.setAttribute('dir', 'ltr');
      body.classList.add('ltr');
    } else {
      html.setAttribute('lang', 'ar');
      html.setAttribute('dir', 'rtl');
      body.classList.remove('ltr');
    }

    // Update toggle button text
    const langActive = langToggle.querySelector('.lang-active');
    const langInactive = langToggle.querySelector('.lang-inactive');
    if (lang === 'en') {
      langActive.textContent = 'EN';
      langInactive.textContent = 'AR';
    } else {
      langActive.textContent = 'AR';
      langInactive.textContent = 'EN';
    }

    // Update all translatable elements
    const translatableElements = document.querySelectorAll('[data-ar][data-en]');
    translatableElements.forEach(el => {
      const text = el.getAttribute(`data-${lang}`);
      if (text) {
        // Handle elements with <br> tags in original content
        if (el.tagName === 'H1' || el.tagName === 'H2') {
          el.innerHTML = text;
        } else {
          el.textContent = text;
        }
      }
    });

    // Update meta tags
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      if (lang === 'en') {
        metaDesc.setAttribute('content', 'H.L.M Legal Consultants — Your legal partner to protect your business and investments. Comprehensive legal solutions in corporate, contracts, and disputes across Egypt and beyond.');
      } else {
        metaDesc.setAttribute('content', 'H.L.M للاستشارات القانونية — شريكك القانوني لحماية أعمالك واستثماراتك. حلول قانونية متكاملة في الشركات، العقود، والمنازعات داخل مصر وخارجها.');
      }
    }

    // Update page title
    if (lang === 'en') {
      document.title = 'HLM Law Advocates & Legal Consultants | H.L.M';
    } else {
      document.title = 'H.L.M للاستشارات القانونية | HLM Law Advocates & Legal Consultants';
    }
  }

  // ═══════════════════════════════════════════════════
  // NAVBAR SCROLL EFFECT
  // ═══════════════════════════════════════════════════
  let lastScroll = 0;
  let ticking = false;

  function updateNavbar() {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  // ═══════════════════════════════════════════════════
  // MOBILE MENU
  // ═══════════════════════════════════════════════════
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    navLinks.classList.toggle('open');
    body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      navLinks.classList.remove('open');
      body.style.overflow = '';
    });
  });

  // Close menu on clicking outside
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') && 
        !navLinks.contains(e.target) && 
        !menuBtn.contains(e.target)) {
      menuBtn.classList.remove('active');
      navLinks.classList.remove('open');
      body.style.overflow = '';
    }
  });

  // ═══════════════════════════════════════════════════
  // SCROLL REVEAL ANIMATIONS
  // ═══════════════════════════════════════════════════
  const revealElements = document.querySelectorAll('.reveal-section');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Optionally stop observing after reveal
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // ═══════════════════════════════════════════════════
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ═══════════════════════════════════════════════════
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const navHeight = navbar.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ═══════════════════════════════════════════════════
  // ACTIVE NAV LINK TRACKING
  // ═══════════════════════════════════════════════════
  const sections = document.querySelectorAll('section[id]');
  const navLinksList = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinksList.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-80px 0px -50% 0px'
  });

  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  // ═══════════════════════════════════════════════════
  // STAT COUNTER ANIMATION
  // ═══════════════════════════════════════════════════
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        animateStats();
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsContainer = document.querySelector('.about-stats');
  if (statsContainer) {
    statsObserver.observe(statsContainer);
  }

  function animateStats() {
    statNumbers.forEach(stat => {
      const text = stat.textContent;
      const match = text.match(/(\d+)/);
      if (match) {
        const target = parseInt(match[1]);
        const suffix = text.replace(match[1], '');
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);
          stat.textContent = current + suffix;

          if (progress < 1) {
            requestAnimationFrame(update);
          }
        }

        requestAnimationFrame(update);
      }
    });
  }

  // ═══════════════════════════════════════════════════
  // SUBTLE PARALLAX ON HERO
  // ═══════════════════════════════════════════════════
  const heroContent = document.querySelector('.hero-content');
  const heroBg = document.querySelector('.hero-bg-pattern');

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (scrollY < window.innerHeight) {
          if (heroContent) {
            heroContent.style.transform = `translateY(${scrollY * 0.15}px)`;
            heroContent.style.opacity = 1 - (scrollY / (window.innerHeight * 0.8));
          }
          if (heroBg) {
            heroBg.style.transform = `translateY(${scrollY * 0.05}px)`;
          }
        }
      });
    }
  }, { passive: true });

  // ═══════════════════════════════════════════════════
  // KEYBOARD ACCESSIBILITY
  // ═══════════════════════════════════════════════════
  document.addEventListener('keydown', (e) => {
    // Close mobile menu with Escape
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      menuBtn.classList.remove('active');
      navLinks.classList.remove('open');
      body.style.overflow = '';
    }
  });

  // ═══════════════════════════════════════════════════
  // FORM HANDLING
  // ═══════════════════════════════════════════════════
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('.btn-submit');
      const statusDiv = document.getElementById('formStatus');
      const btnText = submitBtn.querySelector('span');
      
      const originalText = btnText.textContent;
      const sendingText = currentLang === 'ar' ? 'جاري الإرسال...' : 'Sending...';
      const successText = currentLang === 'ar' ? 'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.' : 'Your message has been sent successfully. We will contact you soon.';
      
      // Visual feedback
      btnText.textContent = sendingText;
      submitBtn.style.opacity = '0.7';
      submitBtn.style.pointerEvents = 'none';
      statusDiv.textContent = '';
      statusDiv.className = 'form-status';

      // Mock API call
      setTimeout(() => {
        btnText.textContent = originalText;
        submitBtn.style.opacity = '1';
        submitBtn.style.pointerEvents = 'auto';
        
        statusDiv.textContent = successText;
        statusDiv.classList.add('success');
        
        contactForm.reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          statusDiv.textContent = '';
          statusDiv.classList.remove('success');
        }, 5000);
      }, 1500);
    });
  }

  // Initial navbar check
  updateNavbar();
});
