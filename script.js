document.addEventListener('DOMContentLoaded', () => {
  // Keep the intro hero inside the visible viewport after the top bar/header.
  const updateChromeHeight = () => {
    const topBar = document.querySelector('.top-bar');
    const header = document.querySelector('.main-header');
    const chromeHeight = (topBar?.offsetHeight || 0) + (header?.offsetHeight || 0);
    document.documentElement.style.setProperty('--site-chrome-height', `${chromeHeight}px`);
  };
  updateChromeHeight();
  window.addEventListener('resize', updateChromeHeight, { passive: true });

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  // Header shadow on scroll
  const header = document.getElementById('header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Mobile nav
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mainNav = document.getElementById('mainNav');
  if (mobileBtn && mainNav) {
    mobileBtn.addEventListener('click', () => {
      mobileBtn.classList.toggle('active');
      mainNav.classList.toggle('active');
    });
    mainNav.querySelectorAll('a').forEach(l => {
      l.addEventListener('click', () => {
        mobileBtn.classList.remove('active');
        mainNav.classList.remove('active');
      });
    });
  }

  // Smooth scroll with header offset
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const offset = 72;
      const top = t.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // Live time in top bar
  const timeEl = document.getElementById('liveTime');
  if (timeEl) {
    const tick = () => {
      try {
        const opt = { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit' };
        timeEl.textContent = new Intl.DateTimeFormat('tr-TR', opt).format(new Date()) + ' TR';
      } catch (e) {}
    };
    tick();
    setInterval(tick, 30000);
  }

  // Orbit to Ore application launch status. The link itself stays unchanged.
  const launchBtn = document.getElementById('appLaunchBtn');
  const launchStatus = document.getElementById('appLaunchStatus');
  if (launchBtn && launchStatus) {
    launchBtn.addEventListener('click', () => {
      launchStatus.textContent = 'Uygulama giriş sayfası açılıyor...';
    });
  }

  const insarLaunchBtn = document.getElementById('insarLaunchBtn');
  const insarLaunchStatus = document.getElementById('insarLaunchStatus');
  if (insarLaunchBtn && insarLaunchStatus) {
    insarLaunchBtn.addEventListener('click', () => {
      insarLaunchStatus.textContent = 'InSAR portal giriş sayfası açılıyor...';
    });
  }

  // Static hosting cannot receive POST requests. Send contact requests
  // through CodeFreeForm and use the JSON response as the source of truth.
  const contactForm = document.querySelector('[data-contact-form]') || document.querySelector('.premium-form');
  if (contactForm) {
    let status = contactForm.querySelector('[data-form-status]');
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonHtml = submitButton ? submitButton.innerHTML : '';

    contactForm.action = 'https://codefreeform.com/api/contact-api/';
    contactForm.method = 'POST';
    contactForm.acceptCharset = 'utf-8';
    contactForm.removeAttribute('target');

    const ensureHidden = (name, value) => {
      let input = contactForm.querySelector(`input[name="${name}"]`);
      if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        contactForm.appendChild(input);
      }
      input.value = value;
    };

    ensureHidden('access_key', '987217');
    ensureHidden('subject', 'ANZURA Kurumsal Teklif Talebi');
    ensureHidden('source_url', window.location.href);

    if (!status && submitButton) {
      status = document.createElement('p');
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      status.style.minHeight = '22px';
      status.style.margin = '-4px 0 18px';
      status.style.fontSize = '0.9rem';
      status.style.lineHeight = '1.45';
      status.style.color = 'var(--ink-500)';
      submitButton.parentNode.insertBefore(status, submitButton);
    }

    const setStatus = (message, type = '') => {
      if (!status) return;
      status.className = `form-status${type ? ` is-${type}` : ''}`;
      status.textContent = message;
    };

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const payload = Object.fromEntries(new FormData(contactForm));
      payload.source_url = window.location.href;

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = 'Gönderiliyor...';
      }
      setStatus('Talebiniz gönderiliyor.');

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === false || data.email_status === 'failed') {
          throw new Error(data.message || `HTTP ${response.status}`);
        }
        contactForm.reset();
        setStatus('Talebiniz gönderildi. Ekibimiz en kısa sürede dönüş yapacak.', 'success');
      } catch (error) {
        setStatus('Form servisi yanıt vermedi. Lütfen info@anzura.com.tr adresine yazın.', 'error');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonHtml;
        }
      }
    });
  }

});
