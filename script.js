/* ==========================================================================
   CareTransit Launch Partners — Site script
   Renders shared components and content from data.js, and powers the
   interactive pieces on both pages. Edit content in data.js, not here.
   ========================================================================== */
(function () {
  'use strict';

  const S = window.SITE;
  if (!S) { console.error('data.js did not load'); return; }

  const page = document.body.dataset.page || 'home';
  const isHome = page === 'home';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const usd = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const params = new URLSearchParams(location.search);
  const cssEsc = (s) => (window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/"/g, '\\"'));

  // "#section" links point at the home page; resolve them for other pages.
  const resolve = (href) => (href.startsWith('#') && !isHome ? 'index.html' + href : href);

  const brandInner = `<img class="brand-logo" src="assets/logo-horizontal.png" width="432" height="112" alt="${esc(S.brand.legalName)}">`;
  const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(S.contact.location);

  /* ------------------------------------------------------------------ Header */
  function renderHeader() {
    const el = $('[data-component="header"]');
    if (!el) return;
    const cta = isHome
      ? `<a class="nav-cta" href="${esc(S.navCta.href)}">${esc(S.navCta.label)}</a>`
      : `<a class="nav-cta" href="#contact-form" data-topic="strategy">${esc(S.navCta.label)}</a>`;
    el.innerHTML = `
      <a class="brand" href="${isHome ? '#top' : 'index.html'}" aria-label="${esc(S.brand.legalName)} home">${brandInner}</a>
      <button class="menu-btn" type="button" aria-label="Toggle menu" aria-expanded="false" aria-controls="site-nav">Menu</button>
      <nav class="nav" id="site-nav" aria-label="Main">
        ${S.nav.map((n) => `<a href="${esc(resolve(n.href))}"${n.page === page ? ' aria-current="page"' : ''}${isHome && n.href.startsWith('#') ? ` data-spy="${esc(n.href.slice(1))}"` : ''}>${esc(n.label)}</a>`).join('')}
        ${cta}
      </nav>`;

    const btn = $('.menu-btn', el);
    const nav = $('.nav', el);
    const setOpen = (open) => {
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Close' : 'Menu';
    };
    btn.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
    $$('a', nav).forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    document.addEventListener('click', (e) => { if (!el.contains(e.target)) setOpen(false); });

    const onScroll = () => el.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --------------------------------------------------------- Scroll spy (home) */
  function initScrollSpy() {
    if (!isHome || !('IntersectionObserver' in window)) return;
    const links = $$('[data-spy]');
    const map = new Map(links.map((a) => [a.dataset.spy, a]));
    const sections = [...map.keys()].map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.remove('is-active'));
        const link = map.get(entry.target.id);
        if (link) link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => io.observe(s));
  }

  /* ------------------------------------------------------------------ Footer */
  function renderFooter() {
    const el = $('[data-component="footer"]');
    if (!el) return;
    el.innerHTML = `
      <div class="footer-top">
        <a class="brand footer-brand" href="${isHome ? '#top' : 'index.html'}">${brandInner}</a>
        <p>${esc(S.brand.tagline)}</p>
      </div>
      <div class="footer-grid footer-grid-3">
        <div>
          <b>Get in touch</b>
          <a href="mailto:${esc(S.contact.email)}">${esc(S.contact.email)}</a>
          <a href="tel:${esc(S.contact.phoneHref)}">${esc(S.contact.phone)}</a>
          <a href="${esc(mapsUrl)}" target="_blank" rel="noopener">${esc(S.contact.location)}</a>
          <a href="${esc(resolve('#apply'))}">Book a strategy call</a>
          <a href="contact.html">Contact page</a>
        </div>
        <div>
          <b>Regulatory resources used for this site</b>
          ${S.resources.map((r) => `<a target="_blank" rel="noopener" href="${esc(r.href)}">${esc(r.label)}</a>`).join('')}
        </div>
        <div>
          <b>Important disclosure</b>
          <p>${esc(S.disclosure)}</p>
        </div>
      </div>
      <div class="footer-bottom"><span>© ${new Date().getFullYear()} ${esc(S.brand.legalName)}. All rights reserved.</span><span>${S.legalLinks.map(esc).join(' • ')}</span></div>`;
  }

  /* --------------------------------------------------------- Content renderers */
  function fmt12(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return `${((h + 11) % 12) + 1}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
  }
  const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

  const renderers = {
    heroRoute: () => S.heroRoute.map((label, i) =>
      `${i ? '<div class="route-line"></div>' : ''}<div class="route-step${i === 0 ? ' active' : ''}"><b>${pad(i + 1)}</b><span>${esc(label)}</span></div>`).join(''),

    heroDashboard: () => S.heroDashboard.map(([k, v]) =>
      `<div class="dash-row"><span>${esc(k)}</span><strong data-final="${esc(v)}">${esc(v)}</strong></div>`).join(''),

    trust: () => S.trust.map(([t, d]) => `<article><strong>${esc(t)}</strong><span>${esc(d)}</span></article>`).join(''),

    services: () => S.services.map((s, i) => `
      <article class="service-card">
        <span>${pad(i + 1)}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>
        <button class="card-toggle" type="button" aria-expanded="false" aria-controls="svc-${i}">What’s included</button>
        <ul class="card-includes" id="svc-${i}" hidden>${s.includes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      </article>`).join(''),

    phases: () => S.phases.map((p, i) => `
      <button class="phase${i === 0 ? ' active' : ''}" type="button" aria-pressed="${i === 0}" data-phase="${i}">
        <b>Phase ${i + 1}</b><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p>
      </button>`).join(''),

    states: () => S.states.map((s) => `
      <article class="state-card" data-state="${esc(s.name)}" data-status="${esc(s.status)}">
        <span class="state-tag">${esc(s.tag)}</span>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.text)}</p>
        <a href="${esc(s.link.href)}"${s.link.external ? ' target="_blank" rel="noopener"' : ''}>${esc(s.link.label)}</a>
      </article>`).join(''),

    stateOptions: () => S.usStates.map((n) => `<option>${esc(n)}</option>`).join(''),
    stageOptions: () => S.stages.map((n) => `<option>${esc(n)}</option>`).join(''),

    scenarios: () => S.scenarios.map((s, i) => `
      <article data-scenario="${i}">
        <b>${esc(s.label)}</b>
        <p>${s.trips} trips/day × ${usd(s.rate)} average collected × ${s.days} days = <strong>${usd(s.trips * s.rate * s.days)}/month</strong>.</p>
        <button class="scenario-load" type="button" data-scenario-load="${i}">Load into calculator</button>
      </article>`).join(''),

    vehicleChecklist: () => S.vehicleChecklist.map((x) => `<li>${esc(x)}</li>`).join(''),
    vehicleFit: () => S.vehicleFit.map(([k, v]) => `<div><b>${esc(k)}</b><em>${esc(v)}</em></div>`).join(''),
    funding: () => S.funding.map((x, i) => `<div><b>${pad(i + 1)}</b><span>${esc(x)}</span></div>`).join(''),
    qualify: () => S.qualify.map((x) => `<div><span>✓</span><p>${esc(x)}</p></div>`).join(''),

    hours: () => {
      const rows = S.contact.hours.map((h) =>
        `<div class="dash-row" data-days="${h.days.join(',')}"><span>${esc(h.label)}</span><strong>${fmt12(h.open)} – ${fmt12(h.close)}</strong></div>`);
      rows.push(`<div class="dash-row is-closed"><span>${esc(S.contact.closedLabel)}</span><strong>Closed</strong></div>`);
      rows.push(`<div class="dash-row tz-row"><span>All times</span><strong>${esc(S.contact.timezoneLabel)}</strong></div>`);
      return rows.join('');
    },

    nextSteps: () => S.nextSteps.map((s) => `<li><b>${esc(s.title)}</b><span>${esc(s.text)}</span></li>`).join(''),

    topics: () => S.topics.map((t, i) => `
      <label class="chip"><input type="radio" name="topic" value="${esc(t.label)}" data-topic-id="${esc(t.id)}"${i === 0 ? ' checked' : ''}><span>${esc(t.label)}</span></label>`).join(''),

    faqs: () => S.faqs.map((f, i) => `
      <div class="faq-item">
        <h3><button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-${i}" id="faq-q-${i}"><span>${esc(f.q)}</span><i aria-hidden="true"></i></button></h3>
        <div class="faq-a" id="faq-${i}" role="region" aria-labelledby="faq-q-${i}" hidden><p>${esc(f.a)}</p></div>
      </div>`).join('')
  };

  function renderContent() {
    $$('[data-render]').forEach((el) => {
      const fn = renderers[el.dataset.render];
      if (!fn) return;
      const html = fn();
      // Selects and append-targets keep their existing children
      if (el.tagName === 'SELECT' || el.hasAttribute('data-append')) el.insertAdjacentHTML('beforeend', html);
      else el.innerHTML = html;
    });

    const c = S.contact;
    $$('[data-bind]').forEach((el) => {
      const key = el.dataset.bind;
      const keepText = el.textContent.trim() !== '';
      if (key === 'email' || key === 'emailLink') { el.href = 'mailto:' + c.email; if (!keepText) el.textContent = c.email; }
      else if (key === 'phoneLink') { el.href = 'tel:' + c.phoneHref; if (!keepText) el.textContent = c.phone; }
      else if (key === 'mapsLink') { el.href = mapsUrl; if (!keepText) el.textContent = c.location; }
      else if (c[key] != null) el.textContent = c[key];
    });
  }

  /* ---------------------------------------------------- Hero load sequence */
  function initHeroSequence() {
    const steps = $$('.hero-card .route-step');
    const lines = $$('.hero-card .route-line');
    const rows = $$('.hero-card .dash-row strong[data-final]');
    if (!steps.length || !rows.length) return;
    if (reduceMotion) {
      steps.forEach((s) => s.classList.add('active'));
      lines.forEach((l) => l.classList.add('done'));
      return;
    }
    rows.forEach((r) => { r.textContent = 'Pending'; r.classList.add('pending'); });
    const perRow = 520, delay = 600;
    rows.forEach((r, i) => setTimeout(() => {
      r.textContent = r.dataset.final;
      r.classList.remove('pending');
      r.classList.add('flip');
    }, delay + i * perRow));
    const stepGap = ((rows.length - 1) * perRow) / (steps.length - 1);
    steps.forEach((s, i) => setTimeout(() => {
      s.classList.add('active');
      if (lines[i - 1]) lines[i - 1].classList.add('done');
    }, delay + i * stepGap));
  }

  /* ------------------------------------------------------ Service card toggle */
  function initServiceCards() {
    $$('.card-toggle').forEach((btn) => btn.addEventListener('click', () => {
      const list = document.getElementById(btn.getAttribute('aria-controls'));
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Hide details' : 'What’s included';
      list.hidden = !open;
      btn.closest('.service-card').classList.toggle('is-open', open);
    }));
  }

  /* --------------------------------------------------------- Process phases */
  function initPhases() {
    const out = $('#phase-outcome');
    const phases = $$('.phase[data-phase]');
    if (!out || !phases.length) return;
    const show = (i, animate) => {
      phases.forEach((p, j) => { p.classList.toggle('active', j === i); p.setAttribute('aria-pressed', String(j === i)); });
      out.innerHTML = `<b>Phase ${i + 1} outcome</b><span>${esc(S.phases[i].outcome)}</span>`;
      if (animate) { out.classList.remove('flip'); void out.offsetWidth; out.classList.add('flip'); }
    };
    phases.forEach((p, i) => p.addEventListener('click', () => show(i, true)));
    show(0, false);
  }

  /* ------------------------------------------------------------ State lookup */
  function initStateLookup() {
    const sel = $('#state-lookup');
    const out = $('#state-result');
    if (!sel || !out) return;
    const cards = $$('.state-card');
    sel.addEventListener('change', () => {
      const name = sel.value;
      cards.forEach((c) => c.classList.remove('is-match'));
      if (!name) { out.textContent = 'Pick a state to see how we can support your launch.'; return; }
      const active = S.states.find((s) => s.status === 'active' && s.name === name);
      if (active) {
        const card = cards.find((c) => c.dataset.state === name);
        if (card) card.classList.add('is-match');
        out.innerHTML = `<strong>We build detailed launch roadmaps for ${esc(name)}.</strong> See the highlighted card below, or <a href="#apply">request a strategy call</a>.`;
      } else {
        const card = cards.find((c) => c.dataset.status === 'expanding');
        if (card) card.classList.add('is-match');
        out.innerHTML = `<strong>We review ${esc(name)} case by case.</strong> We check the regulatory pathway for your service model first. <a href="contact.html?topic=state&amp;state=${encodeURIComponent(name)}">Ask about ${esc(name)}</a>`;
      }
    });
  }

  /* ---------------------------------------------------------- Calculator */
  function initCalculator() {
    const ids = ['trips', 'rate', 'days'];
    const inputs = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
    if (!inputs.trips) return;
    const ranges = $$('.range[data-sync]');
    const monthly = $('#monthly');
    const formula = $('#formula');
    const cards = $$('[data-scenario]');
    let shown = 0;
    let raf = 0;

    ids.forEach((id) => { inputs[id].value = S.calculator[id]; });

    const clamp = (el) => Math.min(Number(el.max || Infinity), Math.max(0, Math.round(Number(el.value) || 0)));
    const paintRange = (r) => {
      const pct = ((Number(r.value) - Number(r.min)) / (Number(r.max) - Number(r.min))) * 100;
      r.style.setProperty('--fill', Math.max(0, Math.min(100, pct)) + '%');
    };
    const syncRanges = () => ranges.forEach((r) => { r.value = inputs[r.dataset.sync].value || 0; paintRange(r); });

    function animateTo(target) {
      cancelAnimationFrame(raf);
      if (reduceMotion) { shown = target; monthly.textContent = usd(target); return; }
      const from = shown, start = performance.now(), dur = 450;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        shown = from + (target - from) * (1 - Math.pow(1 - t, 3));
        monthly.textContent = usd(Math.round(shown));
        if (t < 1) raf = requestAnimationFrame(tick); else shown = target;
      };
      raf = requestAnimationFrame(tick);
    }

    function recalc() {
      const t = clamp(inputs.trips), r = clamp(inputs.rate), d = clamp(inputs.days);
      animateTo(t * r * d);
      formula.textContent = `${t} trips × ${usd(r)} × ${d} days`;
      cards.forEach((c, i) => {
        const s = S.scenarios[i];
        c.classList.toggle('is-active', s.trips === t && s.rate === r && s.days === d);
      });
    }

    ids.forEach((id) => inputs[id].addEventListener('input', () => { syncRanges(); recalc(); }));
    ranges.forEach((r) => r.addEventListener('input', () => { inputs[r.dataset.sync].value = r.value; paintRange(r); recalc(); }));
    $$('[data-scenario-load]').forEach((btn) => btn.addEventListener('click', () => {
      const s = S.scenarios[Number(btn.dataset.scenarioLoad)];
      ids.forEach((id) => { inputs[id].value = s[id]; });
      syncRanges(); recalc();
      const wrap = $('.calculator-wrap');
      const top = wrap.getBoundingClientRect().top;
      if (top < 70 || top > window.innerHeight * 0.6) wrap.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    }));

    syncRanges();
    shown = 0;
    recalc();
  }

  /* ------------------------------------------------------------ Office hours */
  function initHours() {
    const badge = $('#open-status');
    if (!badge) return;
    const c = S.contact;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const entryFor = (day) => c.hours.find((h) => h.days.includes(day));

    function zonedNow() {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: c.timezone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      const get = (t) => parts.find((p) => p.type === t).value;
      return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')), min: (Number(get('hour')) % 24) * 60 + Number(get('minute')) };
    }

    function update() {
      let now;
      try { now = zonedNow(); } catch (e) { $('span', badge).textContent = 'See hours below'; return; }
      const today = entryFor(now.day);
      const open = !!today && now.min >= toMin(today.open) && now.min < toMin(today.close);
      let text = 'Closed now';
      if (open) {
        text = `Open now, until ${fmt12(today.close)}`;
      } else {
        for (let i = 0; i < 8; i++) {
          const d = (now.day + i) % 7;
          const e = entryFor(d);
          if (!e || (i === 0 && now.min >= toMin(e.open))) continue;
          const when = i === 0 ? 'today' : i === 1 ? 'tomorrow' : dayNames[d];
          text = `Closed now. Opens ${when} at ${fmt12(e.open)}`;
          break;
        }
      }
      badge.classList.toggle('is-open', open);
      $('span', badge).textContent = text;

      const local = new Intl.DateTimeFormat('en-US', { timeZone: c.timezone, hour: 'numeric', minute: '2-digit' }).format(new Date());
      $('#local-time').textContent = `It’s ${local} ${c.timezoneLabel} right now.`;

      $$('[data-days]').forEach((row) => row.classList.toggle('is-today', row.dataset.days.split(',').map(Number).includes(now.day)));
      const closedRow = $('.dash-row.is-closed');
      if (closedRow) closedRow.classList.toggle('is-today', !today);
    }
    update();
    setInterval(update, 30000);
  }

  /* ----------------------------------------------------------- Copy buttons */
  function initCopy() {
    $$('[data-copy]').forEach((btn) => {
      const label = btn.textContent;
      btn.addEventListener('click', async () => {
        const value = btn.dataset.copy === 'email' ? S.contact.email : S.contact.phone;
        let ok = false;
        try { await navigator.clipboard.writeText(value); ok = true; } catch (e) {
          const ta = document.createElement('textarea');
          ta.value = value; document.body.appendChild(ta); ta.select();
          try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
          ta.remove();
        }
        btn.textContent = ok ? 'Copied' : 'Copy failed — select the text above';
        btn.classList.toggle('done', ok);
        setTimeout(() => { btn.textContent = label; btn.classList.remove('done'); }, 2000);
      });
    });
  }

  /* -------------------------------------------------------------------- FAQ */
  function initFaq() {
    $$('.faq-q').forEach((btn) => btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      document.getElementById(btn.getAttribute('aria-controls')).hidden = !open;
      btn.closest('.faq-item').classList.toggle('is-open', open);
    }));
  }

  /* ----------------------------------------------------------------- Forms */
  const MESSAGES = {
    first: 'Enter your first name.',
    last: 'Enter your last name.',
    email: 'Enter a valid email address, like name@example.com.',
    message: 'Add a short message so we know how to help.',
    consent: 'Check this box so we can reply to you.'
  };

  function fieldProblem(f) {
    if (!f.required) return '';
    let bad;
    if (f.type === 'checkbox') bad = !f.checked;
    else if (f.type === 'email') bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value.trim());
    else bad = !f.value.trim();
    return bad ? (MESSAGES[f.name] || 'Fill in this field.') : '';
  }

  function setError(field, msg) {
    const holder = field.closest('label') || field.parentElement;
    let err = holder.querySelector('.field-error');
    if (msg) {
      field.setAttribute('aria-invalid', 'true');
      if (!err) {
        err = document.createElement('span');
        err.className = 'field-error';
        err.id = 'err-' + field.name + '-' + Math.random().toString(36).slice(2, 6);
        holder.appendChild(err);
        field.setAttribute('aria-describedby', err.id);
      }
      err.textContent = msg;
    } else {
      field.removeAttribute('aria-invalid');
      if (err) { err.remove(); field.removeAttribute('aria-describedby'); }
    }
  }

  function validate(form) {
    let first = null;
    $$('[required]', form).forEach((f) => {
      const msg = fieldProblem(f);
      setError(f, msg);
      if (msg && !first) first = f;
    });
    if (first) first.focus();
    return !first;
  }

  function serialize(form) {
    const data = {};
    new FormData(form).forEach((v, k) => { if (k !== '_gotcha') data[k] = typeof v === 'string' ? v.trim() : v; });
    return data;
  }

  function initForms() {
    $$('.js-form').forEach((form) => {
      const note = $('[data-form-note]', form);
      const submit = $('button[type="submit"]', form);
      const submitLabel = submit.textContent;
      const isContact = form.dataset.form === 'contact';
      const draftKey = 'ct-draft-' + form.dataset.form;
      const doneTitle = isContact ? 'Message sent' : 'Strategy call requested';

      const setNote = (text, tone) => { note.textContent = text; note.dataset.tone = tone || ''; };
      setNote(S.forms.endpoint ? '' : demoNote);

      // Clear an error as soon as the field is fixed
      const recheck = (e) => { if (e.target.getAttribute('aria-invalid') && !fieldProblem(e.target)) setError(e.target, ''); };
      form.addEventListener('input', recheck);
      form.addEventListener('change', recheck);

      // Character counter
      const counter = $('[data-counter]', form);
      const ta = $('textarea', form);
      const count = () => { if (counter && ta) counter.textContent = `${ta.value.length} / ${ta.maxLength}`; };
      if (counter) ta.addEventListener('input', count);

      // Prefill from URL, e.g. contact.html?topic=state&state=Texas
      const urlTopic = params.get('topic');
      const urlState = params.get('state');
      if (isContact) {
        if (urlTopic) { const r = $(`[data-topic-id="${cssEsc(urlTopic)}"]`, form); if (r) r.checked = true; }
        if (urlState) { const s = $('select[name="state"]', form); if ([...s.options].some((o) => o.value === urlState)) s.value = urlState; }
        $$('[data-topic]').forEach((a) => a.addEventListener('click', () => {
          const r = $(`[data-topic-id="${cssEsc(a.dataset.topic)}"]`, form); if (r) r.checked = true;
        }));
      }

      // Unsent-draft memory (contact form only)
      const useDrafts = isContact && S.forms.saveDrafts;
      const store = {
        get() { try { return JSON.parse(localStorage.getItem(draftKey) || 'null'); } catch (e) { return null; } },
        set(v) { try { localStorage.setItem(draftKey, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
        clear() { try { localStorage.removeItem(draftKey); } catch (e) { /* ignore */ } }
      };
      if (useDrafts) {
        const draft = store.get();
        if (draft && draft.message) {
          Object.entries(draft).forEach(([k, v]) => {
            if ((k === 'topic' && urlTopic) || (k === 'state' && urlState)) return;
            $$(`[name="${cssEsc(k)}"]`, form).forEach((el) => {
              if (el.type === 'radio') el.checked = el.value === v;
              else if (el.type !== 'checkbox' && el.type !== 'hidden') el.value = v;
            });
          });
          const restored = document.createElement('p');
          restored.className = 'draft-note';
          restored.innerHTML = 'We restored your unsent message. <button type="button">Clear form</button>';
          form.prepend(restored);
          $('button', restored).addEventListener('click', () => {
            store.clear();
            form.reset();
            $$('[aria-invalid]', form).forEach((f) => setError(f, ''));
            count();
            restored.remove();
          });
        }
        let timer;
        form.addEventListener('input', () => {
          clearTimeout(timer);
          timer = setTimeout(() => { const d = serialize(form); delete d.consent; store.set(d); }, 400);
        });
      }
      count();

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validate(form)) { setNote('Fix the highlighted fields to continue.', 'error'); return; }
        setNote(S.forms.endpoint ? '' : demoNote);

        const data = serialize(form);
        // Honeypot: bots fill hidden fields; show success without sending
        if ($('.hp', form).value) { showSuccess(data); return; }

        data.formName = form.dataset.form;
        data.page = location.pathname.split('/').pop() || 'index.html';
        data.submittedAt = new Date().toISOString();

        submit.disabled = true;
        submit.textContent = 'Sending…';
        try {
          if (S.forms.endpoint) {
            // text/plain keeps this a "simple" request, which Google Apps Script accepts cross-origin
            const res = await fetch(S.forms.endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify(data),
              redirect: 'follow'
            });
            const out = await res.json().catch(() => null);
            if (!res.ok || !out || out.ok !== true) throw new Error((out && out.error) || 'HTTP ' + res.status);
          } else {
            await new Promise((r) => setTimeout(r, 700));
            console.info('[CareTransit demo form]', data);
          }
          if (useDrafts) store.clear();
          showSuccess(data);
        } catch (err) {
          setNote(`Your message wasn’t sent. Check your connection and try again, or email ${S.contact.email}.`, 'error');
        } finally {
          submit.disabled = false;
          submit.textContent = submitLabel;
        }
      });

      function showSuccess(data) {
        const name = data.first ? `, ${data.first}` : '';
        const panel = document.createElement('div');
        panel.className = 'form-success';
        panel.setAttribute('role', 'status');
        panel.tabIndex = -1;
        panel.innerHTML = `
          <span class="success-mark" aria-hidden="true">✓</span>
          <h3>${esc(doneTitle)}${esc(name)}.</h3>
          <p>${esc(S.contact.responseTime)}${data.email ? ` at <strong>${esc(data.email)}</strong>` : ''}.</p>
          ${S.forms.endpoint ? '' : '<p class="form-note">Demo mode: nothing was sent. Add your Google Apps Script URL in data.js to go live.</p>'}
          <button class="btn ghost" type="button">${isContact ? 'Send another message' : 'Request another call'}</button>`;
        form.hidden = true;
        form.after(panel);
        panel.focus();
        $('button', panel).addEventListener('click', () => {
          form.reset(); count();
          const dn = $('.draft-note', form); if (dn) dn.remove();
          panel.remove();
          form.hidden = false;
          $('input[name="first"]', form).focus();
        });
      }
    });
  }

  /* ------------------------------------------------------------------- Boot */
  renderHeader();
  renderFooter();
  renderContent();
  initScrollSpy();
  initHeroSequence();
  initServiceCards();
  initPhases();
  initStateLookup();
  initCalculator();
  initHours();
  initCopy();
  initFaq();
  initForms();

  // Content is rendered by JS, so re-apply #hash jumps (e.g. index.html#apply from the contact page)
  if (location.hash.length > 1) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) requestAnimationFrame(() => target.scrollIntoView());
  }
})();
