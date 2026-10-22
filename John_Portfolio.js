/* ============================================================
   JOHN INFANT — PORTFOLIO SCRIPTS 2026
   ============================================================ */
(() => {
  const root = document.documentElement;
  const $  = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EMAIL = 'johninfant021@gmail.com';
  const CV_URL = './JOHN%20SAHAYA%20INFANT%20J.pdf';

  /* ── Shortcut label (⌘ on Apple devices) ─────── */
  if (/Mac|iPhone|iPad/.test(navigator.userAgentData?.platform || navigator.platform || '')) {
    $$('[data-mod]').forEach(el => { el.textContent = '⌘'; });
  }

  /* ── Theme ───────────────────────────────────── */
  const themeBtn = $('#themeToggle');

  function setTheme(next, persist = true) {
    root.dataset.theme = next;
    if (persist) { try { localStorage.setItem('theme', next); } catch (e) {} }
  }

  function toggleTheme(origin) {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition || reduceMotion) return setTheme(next);

    // circular reveal from the toggle
    const { x, y } = origin || { x: innerWidth - 60, y: 36 };
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(() => setTheme(next)).ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 600, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
  }

  themeBtn.addEventListener('click', () => {
    const b = themeBtn.getBoundingClientRect();
    toggleTheme({ x: b.left + b.width / 2, y: b.top + b.height / 2 });
  });

  matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (err) {}
    if (!saved) setTheme(e.matches ? 'light' : 'dark', false);
  });

  /* ── Navbar state + back to top ──────────────── */
  const navWrap = $('.nav-wrap');
  const backToTop = $('#backToTop');

  const onScroll = () => {
    const y = scrollY;
    navWrap.classList.toggle('scrolled', y > 24);
    backToTop.classList.toggle('visible', y > 700);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Active nav link ─────────────────────────── */
  const navLinks = $$('.nav-link');
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const hash = '#' + entry.target.id;
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === hash));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => sectionObserver.observe(s));

  /* ── Mobile menu ─────────────────────────────── */
  const menuBtn = $('#menuBtn');
  const mobileMenu = $('#mobileMenu');

  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.hidden = !open;
  }

  menuBtn.addEventListener('click', () => setMenu(mobileMenu.hidden));
  $$('.mobile-link').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', e => {
    if (!mobileMenu.hidden && !navWrap.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !mobileMenu.hidden) { setMenu(false); menuBtn.focus(); }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ── Reveal on scroll ────────────────────────── */
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  /* ── Count-up stats ──────────────────────────── */
  const countObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      if (reduceMotion) return;

      const el = entry.target;
      const end = parseFloat(el.dataset.count);
      const decimals = Number(el.dataset.decimals) || 0;
      const start = performance.now();
      const duration = 1400;

      const tick = now => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = (end * (1 - Math.pow(1 - p, 4))).toFixed(decimals);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => countObserver.observe(el));

  /* ── Local time (IST) ────────────────────────── */
  const clockFormat = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true
  });
  const clocks = $$('[data-clock]');
  const tickClock = () => {
    const time = clockFormat.format(new Date());
    clocks.forEach(c => { c.textContent = time; });
  };
  tickClock();
  setInterval(tickClock, 15000);

  /* ── Card spotlight ──────────────────────────── */
  document.addEventListener('pointermove', e => {
    const card = e.target.closest?.('.card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, { passive: true });

  /* ── Project filters ─────────────────────────── */
  const filterBtns = $$('.filter');
  const workCards = $$('.work-card');

  // An odd card left alone in a row switches to the wide layout so the grid never has a hole
  function balanceGrid() {
    let run = [];
    const flush = () => {
      if (run.length % 2) run[run.length - 1].classList.add('is-wide');
      run = [];
    };
    workCards.forEach(card => {
      card.classList.remove('is-wide');
      if (card.hidden) return;
      if (card.classList.contains('work-card--wide')) flush();
      else run.push(card);
    });
    flush();
  }

  function applyFilter(cat) {
    filterBtns.forEach(btn => btn.setAttribute('aria-pressed', btn.dataset.filter === cat));
    workCards.forEach(card => {
      card.hidden = cat !== 'all' && !card.dataset.cat.split(' ').includes(cat);
      card.classList.add('in');
    });
    balanceGrid();
  }

  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    const cat = btn.dataset.filter;
    if (!document.startViewTransition || reduceMotion) return applyFilter(cat);
    root.classList.add('vt-filter');
    document.startViewTransition(() => applyFilter(cat))
      .finished.finally(() => root.classList.remove('vt-filter'));
  }));
  balanceGrid();

  /* ── Toast + copy ────────────────────────────── */
  const toast = $('#toast');
  let toastTimer;

  function showToast(message) {
    toast.innerHTML = '<svg class="i"><use href="#i-check"/></svg><span></span>';
    toast.lastElementChild.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  async function copyText(text, message) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(message);
    } catch (e) {
      showToast(text);
    }
  }

  $$('[data-copy]').forEach(btn => btn.addEventListener('click', () => {
    copyText(btn.dataset.copy, 'Email copied to clipboard');
  }));

  /* ── Contact form → email app ────────────────── */
  const form = $('#contactForm');
  const formNote = $('#formNote');

  form.addEventListener('submit', e => {
    e.preventDefault();
    let firstInvalid = null;

    ['name', 'email', 'message'].forEach(id => {
      const input = form.elements[id];
      const bad = !input.value.trim() || !input.checkValidity();
      input.closest('.field').classList.toggle('invalid', bad);
      input.setAttribute('aria-invalid', bad);
      if (bad && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      formNote.textContent = 'Please add your name, a valid email and a message.';
      firstInvalid.focus();
      return;
    }

    const { name, email, subject, message } = Object.fromEntries(new FormData(form));
    const mailSubject = subject.trim() || `Portfolio enquiry from ${name.trim()}`;
    const body = `${message.trim()}\n\n— ${name.trim()}\n${email.trim()}`;
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(body)}`;

    formNote.textContent = 'Your email app should open with the message ready. Thanks for reaching out!';
    showToast('Opening your email app…');
  });

  form.addEventListener('input', e => {
    const field = e.target.closest('.field');
    if (field) { field.classList.remove('invalid'); e.target.removeAttribute('aria-invalid'); }
  });

  /* ── Command menu (Ctrl/⌘ + K) ───────────────── */
  const cmdk = $('#cmdk');
  const cmdkInput = $('#cmdkInput');
  const cmdkList = $('#cmdkList');

  const goTo = hash => () => {
    $(hash)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', hash);
  };
  const openUrl = url => () => window.open(url, '_blank', 'noopener');

  const commands = [
    { group: 'Navigate', label: 'Home',       icon: 'i-arrow-right', run: goTo('#home') },
    { group: 'Navigate', label: 'About',      icon: 'i-arrow-right', run: goTo('#about') },
    { group: 'Navigate', label: 'Skills',     icon: 'i-arrow-right', run: goTo('#skills') },
    { group: 'Navigate', label: 'Work',       icon: 'i-arrow-right', run: goTo('#projects'), keywords: 'projects portfolio' },
    { group: 'Navigate', label: 'Experience', icon: 'i-arrow-right', run: goTo('#experience'), keywords: 'jobs internships' },
    { group: 'Navigate', label: 'Education',  icon: 'i-arrow-right', run: goTo('#education') },
    { group: 'Navigate', label: 'Contact',    icon: 'i-arrow-right', run: goTo('#contact') },
    { group: 'Actions',  label: 'Copy email address', icon: 'i-copy', hint: EMAIL, run: () => copyText(EMAIL, 'Email copied to clipboard') },
    { group: 'Actions',  label: 'Download CV', icon: 'i-download', keywords: 'resume pdf', run: () => {
        const a = document.createElement('a');
        a.href = CV_URL; a.download = '';
        a.click();
      } },
    { group: 'Actions',  label: 'Toggle light / dark theme', icon: 'i-sun', keywords: 'mode', run: () => toggleTheme() },
    { group: 'Links',    label: 'GitHub',    icon: 'i-github',    hint: '@johninfant021', run: openUrl('https://github.com/johninfant021') },
    { group: 'Links',    label: 'LinkedIn',  icon: 'i-linkedin',  run: openUrl('https://www.linkedin.com/in/john-infant-j-6728a7244/') },
    { group: 'Links',    label: 'Instagram', icon: 'i-instagram', hint: '@john_infant__', run: openUrl('https://www.instagram.com/john_infant__/') },
    { group: 'Links',    label: 'Send an email', icon: 'i-mail', run: () => { location.href = 'mailto:' + EMAIL; } }
  ];

  let results = commands;
  let active = 0;

  function renderCommands() {
    const q = cmdkInput.value.trim().toLowerCase();
    results = commands.filter(c =>
      [c.label, c.group, c.hint, c.keywords].join(' ').toLowerCase().includes(q));
    cmdkList.replaceChildren();

    if (!results.length) {
      const empty = document.createElement('li');
      empty.className = 'cmdk-empty';
      empty.textContent = 'No results';
      cmdkList.append(empty);
      cmdkInput.removeAttribute('aria-activedescendant');
      return;
    }

    let lastGroup;
    results.forEach((cmd, i) => {
      if (cmd.group !== lastGroup) {
        const group = document.createElement('li');
        group.className = 'cmdk-group';
        group.setAttribute('role', 'presentation');
        group.textContent = cmd.group;
        cmdkList.append(group);
        lastGroup = cmd.group;
      }
      const item = document.createElement('li');
      item.className = 'cmdk-item';
      item.id = 'cmd-' + i;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', i === active);
      item.innerHTML = `<svg class="i"><use href="#${cmd.icon}"/></svg><span></span>`;
      item.lastElementChild.textContent = cmd.label;
      if (cmd.hint) {
        const hint = document.createElement('span');
        hint.className = 'hint';
        hint.textContent = cmd.hint;
        item.append(hint);
      }
      item.addEventListener('click', () => runCommand(i));
      item.addEventListener('pointermove', () => setActive(i));
      cmdkList.append(item);
    });
    cmdkInput.setAttribute('aria-activedescendant', 'cmd-' + active);
  }

  function setActive(i) {
    if (i === active) return;
    active = i;
    $$('.cmdk-item', cmdkList).forEach((el, idx) => el.setAttribute('aria-selected', idx === i));
    $('#cmd-' + i)?.scrollIntoView({ block: 'nearest' });
    cmdkInput.setAttribute('aria-activedescendant', 'cmd-' + i);
  }

  function openCommands() {
    setMenu(false);
    cmdkInput.value = '';
    active = 0;
    renderCommands();
    cmdk.showModal();
    cmdkInput.focus();
  }

  function runCommand(i) {
    const cmd = results[i];
    cmdk.close();
    cmd?.run();
  }

  $$('[data-cmdk-open]').forEach(btn => btn.addEventListener('click', openCommands));
  cmdkInput.addEventListener('input', () => { active = 0; renderCommands(); });
  cmdkInput.addEventListener('keydown', e => {
    if (!results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((active + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((active - 1 + results.length) % results.length); }
    else if (e.key === 'Enter') { e.preventDefault(); runCommand(active); }
  });
  cmdk.addEventListener('click', e => { if (e.target === cmdk) cmdk.close(); });

  document.addEventListener('keydown', e => {
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      cmdk.open ? cmdk.close() : openCommands();
    } else if (e.key === '/' && !typing && !cmdk.open) {
      e.preventDefault();
      openCommands();
    }
  });

  /* ── Footer year ─────────────────────────────── */
  $('#year').textContent = new Date().getFullYear();
})();
