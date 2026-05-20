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

  // Static hosting cannot receive POST requests. Intercept the contact form
  // before it posts to the page, then send it through FormSubmit instead.
  const contactForm = document.querySelector('[data-contact-form]') || document.querySelector('.premium-form');
  if (contactForm) {
    const endpoint = 'https://formsubmit.co/ajax/info@anzura.com.tr';
    const fallbackEmail = contactForm.dataset?.fallbackEmail || 'info@anzura.com.tr';
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonHtml = submitButton ? submitButton.innerHTML : '';
    let status = contactForm.querySelector('[data-form-status]');

    if (!status) {
      status = document.createElement('p');
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      status.style.minHeight = '22px';
      status.style.margin = '-4px 0 18px';
      status.style.fontSize = '0.9rem';
      status.style.lineHeight = '1.45';
      status.style.color = 'var(--ink-500)';
      submitButton?.parentNode?.insertBefore(status, submitButton);
    }

    const setStatus = (message, color = 'var(--ink-500)') => {
      status.style.color = color;
      status.innerHTML = message;
    };

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const formData = new FormData(contactForm);
      formData.set('_subject', 'ANZURA Kurumsal Teklif Talebi');
      formData.set('_template', 'table');
      formData.set('_captcha', 'false');
      formData.set('_url', window.location.href);

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = 'Gönderiliyor...';
      }
      setStatus('Talebiniz güvenli şekilde gönderiliyor.');

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        contactForm.reset();
        setStatus('Talebiniz alındı. Ekibimiz en kısa sürede dönüş yapacak.', '#2f6b45');
      } catch (error) {
        const name = contactForm.elements.name?.value || '';
        const email = contactForm.elements.email?.value || '';
        const service = contactForm.elements.service?.value || '';
        const message = contactForm.elements.message?.value || '';
        const subject = encodeURIComponent('ANZURA Kurumsal Teklif Talebi');
        const body = encodeURIComponent([
          `Firma / Ad Soyad: ${name}`,
          `Kurumsal E-posta: ${email}`,
          `İlgilenilen Hizmet: ${service}`,
          '',
          'Proje Özeti:',
          message,
        ].join('\n'));
        setStatus(`Gönderim servisi yanıt vermedi. <a href="mailto:${fallbackEmail}?subject=${subject}&body=${body}" style="color:inherit;border-bottom:1px solid currentColor">E-posta uygulamasıyla gönder</a>.`, '#9b2f1f');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonHtml;
        }
      }
    });
  }

});
