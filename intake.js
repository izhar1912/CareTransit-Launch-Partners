/* ==========================================================================
   CareTransit Launch Partners — Client Intake (multi-step form)
   Builds intake.html from intake-schema.js, handles conditional sections,
   validation, save-and-resume, review, and submission.
   Also powers the answer summary on thank-you.html.
   ========================================================================== */
(function () {
  'use strict';

  const S = window.SITE;
  const I = window.INTAKE;
  if (!S || !I) return;

  const page = document.body.dataset.page;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cssEsc = (s) => (window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/["\\\]\[]/g, '\\$&'));
  const slug = (s) => String(s).replace(/[^\w]+/g, '-');
  const storage = (type) => ({
    get(k) { try { return JSON.parse(window[type].getItem(k) || 'null'); } catch (e) { return null; } },
    set(k, v) { try { window[type].setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { window[type].removeItem(k); } catch (e) { /* ignore */ } }
  });
  const local = storage('localStorage');
  const session = storage('sessionStorage');

  const allQuestions = I.sections.flatMap((s) => s.questions);
  const qByKey = Object.fromEntries(allQuestions.map((q) => [q.key, q]));

  /* ------------------------------------------------------------ Conditions */
  function evalCond(c, A) {
    if (!c) return true;
    const v = A[c.key];
    if ('equals' in c) return v === c.equals;
    if ('includes' in c) return Array.isArray(v) && v.includes(c.includes);
    if (c.in) return c.in.includes(v);
    return true;
  }
  const visibleSections = (A) => I.sections.filter((s) => evalCond(s.showIf, A));

  /* --------------------------------------------------------- Value helpers */
  const isEmpty = (v) => v == null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length);

  function fieldText(f, v) {
    if (isEmpty(v)) return '';
    v = String(v).trim();
    return f.suffix ? v + f.suffix : v;
  }

  function objectExport(fields, obj) {
    const out = {};
    fields.forEach((f) => { const t = fieldText(f, obj && obj[f.name]); if (t) out[f.label] = t; });
    return Object.keys(out).length ? out : '';
  }

  // Value as sent to the Sheet / email
  function exportValue(q, A) {
    const v = A[q.key];
    const other = (A[q.key + '__other'] || '').trim();
    const withOther = (x) => (x === 'Other' && other ? 'Other: ' + other : x);
    switch (q.type) {
      case 'address': {
        const a = v || {};
        const cityLine = [a.city, [a.state, a.zip].filter(Boolean).join(' ')].filter((x) => x && x.trim()).join(', ');
        return [a.street, a.unit, cityLine].filter((x) => x && x.trim()).map((x) => x.trim()).join(', ');
      }
      case 'radio': return v ? withOther(v) : '';
      case 'checkbox':
      case 'states': return Array.isArray(v) ? v.map(withOther) : [];
      case 'textOrNone': return A[q.key + '__none'] ? q.noneLabel : (v || '').trim();
      case 'group': return objectExport(q.fields, v);
      case 'repeater': return (Array.isArray(v) ? v : []).map((item) => objectExport(q.fields, item)).filter(Boolean);
      default: return typeof v === 'string' ? v.trim() : (v || '');
    }
  }

  function buildPayload(A) {
    const out = {};
    visibleSections(A).forEach((s) => s.questions.forEach((q) => {
      if (!evalCond(q.showIf, A)) return;
      const v = exportValue(q, A);
      if (!isEmpty(v)) out[q.key] = v;
    }));
    return out;
  }

  /* ------------------------------------------------ Summary (review + thanks) */
  function displayHTML(v) {
    if (isEmpty(v)) return '<span class="rv-empty">Not answered</span>';
    if (Array.isArray(v)) {
      if (typeof v[0] === 'object') {
        return '<ol class="rv-items">' + v.map((o) => '<li>' + Object.entries(o).map(([k, x]) => `<span><em>${esc(k)}</em> ${esc(x)}</span>`).join('') + '</li>').join('') + '</ol>';
      }
      return '<ul class="rv-tags">' + v.map((x) => `<li>${esc(x)}</li>`).join('') + '</ul>';
    }
    if (typeof v === 'object') {
      return '<div class="rv-pairs">' + Object.entries(v).map(([k, x]) => `<span><em>${esc(k)}</em> ${esc(x)}</span>`).join('') + '</div>';
    }
    return esc(v).replace(/\n/g, '<br>');
  }

  function summaryHTML(A, editable) {
    return visibleSections(A).map((s) => `
      <section class="rv-sec">
        <header>
          <h3>${esc(s.title)}</h3>
          ${editable ? `<button type="button" class="rv-edit" data-goto="${esc(s.id)}">Edit<span class="sr-only"> ${esc(s.title)}</span></button>` : ''}
        </header>
        <dl>
          ${s.questions.filter((q) => evalCond(q.showIf, A)).map((q) => `
            <div class="rv-row${q.sub ? ' rv-sub' : ''}"><dt>${esc(q.label)}</dt><dd>${displayHTML(exportValue(q, A))}</dd></div>`).join('')}
        </dl>
      </section>`).join('');
  }

  /* ======================================================================
     THANK-YOU PAGE
     ====================================================================== */
  if (page === 'thanks') {
    const done = session.get(I.doneKey);
    const box = $('#thanks-app');
    if (!box) return;
    if (!done) { box.classList.add('no-summary'); return; }
    $$('[data-thanks="name"]').forEach((el) => { el.textContent = ', ' + done.name; });
    $$('[data-thanks="email"]').forEach((el) => { el.textContent = done.email; });
    $$('[data-thanks="states"]').forEach((el) => { el.textContent = (done.states || []).join(', ') || 'Not specified'; });
    $$('[data-thanks="time"]').forEach((el) => { el.textContent = new Date(done.at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }); });
    const receipt = $('.thanks-receipt');
    if (receipt) receipt.hidden = false;
    if (done.demo) { const d = $('.thanks-demo'); if (d) d.hidden = false; }
    const sum = $('#thanks-summary');
    if (sum) {
      sum.innerHTML = summaryHTML(done.answers || {}, false);
      $('.thanks-copy').hidden = false;
      const toggle = $('[data-summary-toggle]');
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(open));
        toggle.textContent = open ? 'Hide my answers' : 'View my answers';
        sum.hidden = !open;
      });
      $('[data-print]').addEventListener('click', () => {
        sum.hidden = false; toggle.setAttribute('aria-expanded', 'true'); toggle.textContent = 'Hide my answers';
        window.print();
      });
    }
    return;
  }

  /* ======================================================================
     INTAKE PAGE
     ====================================================================== */
  const app = $('#intake-app');
  if (!app) return;

  const draft = local.get(I.draftKey);
  const state = {
    A: (draft && draft.answers) || {},
    step: (draft && draft.step) || I.sections[0].id,
    visited: new Set((draft && draft.visited) || [I.sections[0].id])
  };
  const A = state.A;

  /* ------------------------------------------------------------- Rendering */
  const reqTag = (on) => (on ? '<span class="req">Required</span>' : '');
  const hintHTML = (q) => (q.hint ? `<p class="q-hint" id="hint-${slug(q.key)}">${esc(q.hint)}</p>` : '');
  const condAttr = (q) => (q.showIf ? ` data-cond="${esc(JSON.stringify(q.showIf))}"` : '');
  const describedBy = (q) => (q.hint ? ` aria-describedby="hint-${slug(q.key)}"` : '');

  function inputHTML(f, name, id, extra = '') {
    const attrs = [
      `id="${id}"`, `name="${esc(name)}"`,
      f.required ? 'aria-required="true"' : '',
      f.autocomplete ? `autocomplete="${esc(f.autocomplete)}"` : '',
      f.placeholder ? `placeholder="${esc(f.placeholder)}"` : '',
      f.maxlength ? `maxlength="${f.maxlength}"` : '',
      f.inputmode ? `inputmode="${f.inputmode}"` : '',
      f.format ? `data-format="${f.format}"` : '',
      extra
    ].filter(Boolean).join(' ');
    switch (f.type) {
      case 'textarea': return `<textarea ${attrs} rows="4"></textarea>`;
      case 'select':
        return `<select ${attrs}><option value="">Select…</option>${f.options.map((o) => `<option>${esc(o)}</option>`).join('')}</select>`;
      case 'number':
        return `<span class="suffix-input"><input type="number" ${attrs} min="${f.min ?? ''}" max="${f.max ?? ''}" step="1">${f.suffix ? `<span>${esc(f.suffix)}</span>` : ''}</span>`;
      case 'email': return `<input type="email" ${attrs} autocapitalize="off" spellcheck="false">`;
      case 'tel': return `<input type="tel" ${attrs}>`;
      default: return `<input type="text" ${attrs}>`;
    }
  }

  function subField(f, name, full) {
    const id = 'f-' + slug(name);
    return `<div class="sf${full || f.full || f.type === 'textarea' ? ' sf-full' : ''}" data-sf="${esc(name)}">
      <label for="${id}">${esc(f.label)}${f.required ? ' <span class="req-dot" aria-hidden="true">*</span>' : ''}</label>
      ${inputHTML(f, name, id)}
      <span class="sf-err" aria-live="polite"></span>
    </div>`;
  }

  function optionsHTML(q, kind) {
    const other = q.options.includes('Other');
    return `<div class="opts ${q.pills ? 'pills' : 'cards'}"${q.exclusive ? ` data-exclusive="${esc(JSON.stringify(q.exclusive))}"` : ''}>
        ${q.options.map((o) => `<label class="opt"><input type="${kind}" name="${esc(q.key)}" value="${esc(o)}"><span class="opt-ui" aria-hidden="true"></span><span class="opt-text">${esc(o)}</span></label>`).join('')}
      </div>
      ${other ? `<div class="other-wrap" data-other-for="${esc(q.key)}" hidden><label class="sr-only" for="f-${slug(q.key)}-other">Please specify</label><input type="text" id="f-${slug(q.key)}-other" name="${esc(q.key)}__other" placeholder="Please specify"></div>` : ''}`;
  }

  function repItemHTML(q, i, count) {
    return `<div class="rep-item" data-index="${i}">
      <div class="rep-head"><b>${esc(q.itemLabel)} ${i + 1}</b>
        ${count > (q.min || 0) ? `<button type="button" class="rep-remove" data-rep-remove="${esc(q.key)}" data-i="${i}">Remove<span class="sr-only"> ${esc(q.itemLabel)} ${i + 1}</span></button>` : ''}
      </div>
      <div class="sub-grid">${q.fields.map((f) => subField(f, `${q.key}[${i}].${f.name}`)).join('')}</div>
    </div>`;
  }

  function questionHTML(q) {
    const cls = `q q-${q.type}${q.sub ? ' q-sub' : ''}`;
    const id = 'f-' + slug(q.key);
    const open = (legend) => `<fieldset class="${cls}" data-q="${esc(q.key)}"${condAttr(q)}${describedBy(q)}><legend class="q-label">${esc(legend)}${reqTag(q.required)}</legend>${hintHTML(q)}`;
    const err = '<p class="q-err" aria-live="polite"></p>';
    switch (q.type) {
      case 'radio': return open(q.label) + optionsHTML(q, 'radio') + err + '</fieldset>';
      case 'checkbox': return open(q.label) + optionsHTML(q, 'checkbox') + err + '</fieldset>';
      case 'address': {
        const p = q.key;
        return open(q.label) + `<div class="sub-grid">
          ${subField({ label: 'Street address', required: true, autocomplete: 'address-line1' }, `${p}.street`, true)}
          ${subField({ label: 'Apt, suite, unit', autocomplete: 'address-line2' }, `${p}.unit`)}
          ${subField({ label: 'City', required: true, autocomplete: 'address-level2' }, `${p}.city`)}
          ${subField({ label: 'State', type: 'select', required: true, options: S.usStates, autocomplete: 'address-level1' }, `${p}.state`)}
          ${subField({ label: 'ZIP code', required: true, autocomplete: 'postal-code', inputmode: 'numeric', maxlength: 10, format: 'zip' }, `${p}.zip`)}
        </div>` + err + '</fieldset>';
      }
      case 'states': {
        const pop = q.popular || [];
        const rest = S.usStates.filter((s) => !pop.includes(s));
        const box = (s) => `<label class="st" data-st="${esc(s.toLowerCase())}"><input type="checkbox" name="${esc(q.key)}" value="${esc(s)}"><span class="opt-ui" aria-hidden="true"></span>${esc(s)}</label>`;
        return open(q.label) + `
          <div class="opts cards pop-states">${pop.map((s) => `<label class="opt"><input type="checkbox" name="${esc(q.key)}" value="${esc(s)}"><span class="opt-ui" aria-hidden="true"></span><span class="opt-text">${esc(s)}<small>Detailed launch roadmap available</small></span></label>`).join('')}</div>
          <div class="st-picker">
            <div class="st-top">
              <label class="sr-only" for="${id}-search">Search other states</label>
              <input type="search" id="${id}-search" class="st-search" placeholder="Search other states" autocomplete="off">
              <div class="st-chips" aria-live="polite"></div>
            </div>
            <div class="st-grid">${rest.map(box).join('')}<p class="st-none" hidden>No states match that search.</p></div>
          </div>` + err + '</fieldset>';
      }
      case 'textOrNone':
        return `<div class="${cls}" data-q="${esc(q.key)}"${condAttr(q)}>
          <label class="q-label" for="${id}">${esc(q.label)}${reqTag(q.required)}</label>${hintHTML(q)}
          <div class="or-none">${inputHTML(q, q.key, id)}
            <label class="none-toggle"><input type="checkbox" name="${esc(q.key)}__none"><span class="opt-ui" aria-hidden="true"></span>${esc(q.noneLabel)}</label>
          </div>${err}</div>`;
      case 'group':
        return open(q.label) + `<div class="sub-grid">${q.fields.map((f) => subField(f, `${q.key}.${f.name}`)).join('')}</div>` + err + '</fieldset>';
      case 'repeater':
        return open(q.label) + `<div class="rep-items" data-rep="${esc(q.key)}"></div>
          <div class="rep-foot">
            <button type="button" class="rep-add" data-rep-add="${esc(q.key)}">+ Add another ${esc(q.itemLabel.toLowerCase())}</button>
            ${q.ownershipCheck ? '<p class="rep-total" aria-live="polite"></p>' : ''}
          </div>` + err + '</fieldset>';
      default:
        return `<div class="${cls}" data-q="${esc(q.key)}"${condAttr(q)}>
          <label class="q-label" for="${id}">${esc(q.label)}${reqTag(q.required)}</label>${hintHTML(q)}
          ${inputHTML(q, q.key, id, describedBy(q).trim())}${err}</div>`;
    }
  }

  function renderApp() {
    app.innerHTML = `
      <div class="intake-shell">
        <aside class="intake-rail" aria-label="Intake progress"></aside>
        <div class="intake-main">
          <div class="resume-note" hidden></div>
          <form id="intake-form" class="intake-card" novalidate>
            ${I.sections.map((s) => `
              <section class="step" data-step="${esc(s.id)}" aria-labelledby="h-${esc(s.id)}" hidden>
                <header class="step-head">
                  <p class="eyebrow" data-step-count></p>
                  <h2 id="h-${esc(s.id)}" tabindex="-1">${esc(s.title)}</h2>
                  ${s.badge ? `<span class="step-badge">${esc(s.badge)}</span>` : ''}
                  <p>${esc(s.intro)}</p>
                </header>
                <div class="q-list">${s.questions.map(questionHTML).join('')}</div>
              </section>`).join('')}
            <section class="step" data-step="review" aria-labelledby="h-review" hidden>
              <header class="step-head">
                <p class="eyebrow" data-step-count></p>
                <h2 id="h-review" tabindex="-1">Review your answers</h2>
                <p>Check everything below. Use Edit to change a section, then submit when you’re ready.</p>
              </header>
              <div class="review-body"></div>
              <div class="q q-consent" data-q="__consent">
                <label class="none-toggle consent"><input type="checkbox" name="__consent"><span class="opt-ui" aria-hidden="true"></span>
                  <span>I confirm this information is accurate to the best of my knowledge, and I agree to be contacted about my launch. I understand CareTransit does not guarantee approvals, funding, contracts, or revenue.</span></label>
                <p class="q-err" aria-live="polite"></p>
              </div>
              <input type="text" name="_gotcha" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
            </section>
            <div class="step-alert" role="alert" hidden></div>
            <div class="step-nav">
              <button type="button" class="btn ghost" data-back>Back</button>
              <span class="save-status" aria-live="polite"></span>
              <button type="submit" class="btn primary" data-next>Continue</button>
            </div>
          </form>
        </div>
      </div>`;
    I.sections.forEach((s) => s.questions.filter((q) => q.type === 'repeater').forEach((q) => renderRepeater(q)));
  }

  function renderRepeater(q) {
    const holder = $(`[data-rep="${cssEsc(q.key)}"]`, app);
    if (!Array.isArray(A[q.key])) A[q.key] = [];
    while (A[q.key].length < (q.min || 0)) A[q.key].push({});
    const list = A[q.key];
    holder.innerHTML = list.map((_, i) => repItemHTML(q, i, list.length)).join('');
    list.forEach((item, i) => q.fields.forEach((f) => {
      const el = $(`[name="${cssEsc(`${q.key}[${i}].${f.name}`)}"]`, holder);
      if (el && item[f.name] != null) el.value = item[f.name];
    }));
    const add = $(`[data-rep-add="${cssEsc(q.key)}"]`, app);
    add.hidden = list.length >= (q.max || 10);
    add.textContent = `+ Add ${list.length ? 'another' : 'an'} ${q.itemLabel.toLowerCase()}`;
    updateOwnership(q);
  }

  /* ------------------------------------------------ DOM ⇄ answers syncing */
  function fillFromState() {
    allQuestions.forEach((q) => {
      const v = A[q.key];
      if (q.type === 'radio') {
        $$(`[name="${cssEsc(q.key)}"]`, app).forEach((el) => { el.checked = el.value === v; });
      } else if (q.type === 'checkbox' || q.type === 'states') {
        const arr = Array.isArray(v) ? v : [];
        $$(`[name="${cssEsc(q.key)}"]`, app).forEach((el) => { el.checked = arr.includes(el.value); });
      } else if (q.type === 'address' || q.type === 'group') {
        Object.entries(v || {}).forEach(([k, x]) => { const el = $(`[name="${cssEsc(q.key + '.' + k)}"]`, app); if (el) el.value = x; });
      } else if (q.type === 'textOrNone') {
        const el = $(`[name="${cssEsc(q.key)}"]`, app); if (el) el.value = v || '';
        const none = $(`[name="${cssEsc(q.key)}__none"]`, app); if (none) none.checked = !!A[q.key + '__none'];
        toggleNone(q.key);
      } else if (q.type !== 'repeater') {
        const el = $(`[name="${cssEsc(q.key)}"]`, app); if (el && v != null) el.value = v;
      }
      const other = $(`[name="${cssEsc(q.key)}__other"]`, app);
      if (other) other.value = A[q.key + '__other'] || '';
      updateOther(q.key);
    });
    updateStateChips();
  }

  const NAME_RE = /^(\w+?)(?:\[(\d+)\])?(?:\.(\w+))?$/;

  function onField(e) {
    const el = e.target;
    if (!el.name || el.name === '_gotcha') return;
    if (el.name === '__consent') { recheck(el); return; }
    const m = NAME_RE.exec(el.name);
    if (!m) return;
    const [, key, idx, field] = m;
    const base = key.replace(/__(other|none)$/, '');

    if (key.endsWith('__none')) {
      A[key] = el.checked;
      toggleNone(base);
    } else if (el.type === 'checkbox') {
      const wrap = el.closest('[data-exclusive]');
      const excl = wrap ? JSON.parse(wrap.dataset.exclusive) : [];
      if (el.checked && excl.length) {
        $$(`[name="${cssEsc(key)}"]`, app).forEach((o) => {
          if (o !== el && (excl.includes(el.value) || excl.includes(o.value))) o.checked = false;
        });
      }
      A[key] = $$(`[name="${cssEsc(key)}"]`, app).filter((o) => o.checked).map((o) => o.value);
      if (qByKey[key] && qByKey[key].type === 'states') {
        // keep a stable, alphabetical order
        A[key].sort((a, b) => S.usStates.indexOf(a) - S.usStates.indexOf(b));
        updateStateChips();
      }
    } else if (el.type === 'radio') {
      A[key] = el.value;
    } else if (idx != null) {
      if (!Array.isArray(A[key])) A[key] = [];
      A[key][idx] = A[key][idx] || {};
      A[key][idx][field] = el.value;
      updateOwnership(qByKey[key]);
    } else if (field) {
      A[key] = A[key] || {};
      A[key][field] = el.value;
    } else {
      A[key] = el.value;
    }

    updateOther(base);
    const condChanged = applyConditions();
    if (condChanged) renderRail();
    recheck(el);
    scheduleSave();
  }

  function toggleNone(key) {
    const input = $(`[name="${cssEsc(key)}"]`, app);
    if (!input) return;
    input.disabled = !!A[key + '__none'];
    input.closest('.or-none').classList.toggle('is-none', input.disabled);
  }

  function updateOther(key) {
    const wrap = $(`[data-other-for="${cssEsc(key)}"]`, app);
    if (!wrap) return;
    const v = A[key];
    const on = v === 'Other' || (Array.isArray(v) && v.includes('Other'));
    const was = !wrap.hidden;
    wrap.hidden = !on;
    if (on && !was && document.activeElement && document.activeElement.value === 'Other') {
      setTimeout(() => $('input', wrap).focus(), 0);
    }
  }

  function updateStateChips() {
    const chips = $('.st-chips', app);
    if (!chips) return;
    const sel = A.serviceStates || [];
    chips.innerHTML = sel.length
      ? sel.map((s) => `<button type="button" class="st-chip" data-unselect="${esc(s)}">${esc(s)}<span aria-hidden="true">×</span><span class="sr-only"> (remove)</span></button>`).join('')
      : '<span class="st-chips-empty">No states selected yet</span>';
  }

  function updateOwnership(q) {
    if (!q || !q.ownershipCheck) return;
    const out = $(`[data-q="${cssEsc(q.key)}"] .rep-total`, app);
    if (!out) return;
    const total = (A[q.key] || []).reduce((sum, it) => sum + (Number(it && it[q.ownershipCheck]) || 0), 0);
    out.classList.toggle('over', total >= 100);
    out.textContent = total
      ? (total >= 100 ? `Additional owners total ${total}%. Leave room for your own share.` : `Additional owners: ${total}%. Your share: ${100 - total}%.`)
      : '';
  }

  // Returns true if the set of visible sections changed
  let lastSectionIds = '';
  function applyConditions() {
    $$('[data-cond]', app).forEach((el) => {
      const show = evalCond(JSON.parse(el.dataset.cond), A);
      if (show && el.hidden) { el.hidden = false; if (!reduceMotion) { el.classList.remove('reveal'); void el.offsetWidth; el.classList.add('reveal'); } }
      else if (!show) el.hidden = true;
    });
    const ids = visibleSections(A).map((s) => s.id).join();
    const changed = ids !== lastSectionIds;
    lastSectionIds = ids;
    return changed;
  }

  /* ------------------------------------------------------------ Validation */
  const FORMAT = {
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Enter a valid email address, like name@example.com.',
    tel: (v) => v.replace(/\D/g, '').length >= 10 || 'Enter a phone number with at least 10 digits.',
    zip: (v) => /^\d{5}(-\d{4})?$/.test(v) || 'Enter a 5-digit ZIP code.',
    year: (v) => { const y = Number(v); return (/^\d{4}$/.test(v) && y >= 1980 && y <= new Date().getFullYear() + 2) || 'Enter a 4-digit year, like 2021.'; },
    mileage: (v) => /^[\d,]+$/.test(v) || 'Enter mileage using numbers only.',
    vin6: (v) => /^[A-Za-z0-9]{6}$/.test(v) || 'Enter exactly the last 6 characters of the VIN.',
    npi: (v) => /^\d{10}$/.test(v) || 'An NPI is 10 digits.'
  };

  function checkValue(f, v, el) {
    v = (v == null ? '' : String(v)).trim();
    if (!v) return f.required ? (f.type === 'select' ? `Select ${/^[aeiou]/i.test(f.label) ? 'an' : 'a'} ${f.label.toLowerCase()}.` : `${f.label.replace(/\?$/, '')} is required.`) : '';
    const fmt = f.format || (f.type === 'email' || f.type === 'tel' ? f.type : '');
    if (fmt && FORMAT[fmt]) { const r = FORMAT[fmt](v); if (r !== true) return r; }
    if (f.type === 'number') {
      const n = Number(v);
      if (!Number.isFinite(n) || n < (f.min ?? -Infinity) || n > (f.max ?? Infinity)) return `Enter a number from ${f.min} to ${f.max}.`;
    }
    return '';
  }

  const qWrap = (key) => $(`[data-q="${cssEsc(key)}"]`, app);

  function setSubError(name, msg) {
    const sf = $(`[data-sf="${cssEsc(name)}"]`, app);
    if (!sf) return;
    const input = $('input,select,textarea', sf);
    $('.sf-err', sf).textContent = msg || '';
    sf.classList.toggle('has-error', !!msg);
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  }

  // Validate one question. Returns the first element to focus, or null.
  function checkQuestion(q) {
    const wrap = qWrap(q.key);
    const qErr = $(':scope > .q-err', wrap);
    let qMsg = '';
    let focus = null;
    const flag = (el) => { if (!focus) focus = el; };
    const v = A[q.key];

    switch (q.type) {
      case 'address': {
        const parts = { street: 'Street address', city: 'City', state: 'State', zip: 'ZIP code' };
        const a = v || {};
        Object.entries(parts).forEach(([k, label]) => {
          const name = `${q.key}.${k}`;
          const msg = checkValue({ label, required: q.required, type: k === 'state' ? 'select' : 'text', format: k === 'zip' ? 'zip' : '' }, a[k]);
          setSubError(name, msg);
          if (msg) flag($(`[name="${cssEsc(name)}"]`, app));
        });
        break;
      }
      case 'group':
        q.fields.forEach((f) => {
          const name = `${q.key}.${f.name}`;
          const msg = checkValue(f, (v || {})[f.name]);
          setSubError(name, msg);
          if (msg) flag($(`[name="${cssEsc(name)}"]`, app));
        });
        break;
      case 'repeater': {
        (v || []).forEach((item, i) => q.fields.forEach((f) => {
          const name = `${q.key}[${i}].${f.name}`;
          const msg = checkValue(f, (item || {})[f.name]);
          setSubError(name, msg);
          if (msg) flag($(`[name="${cssEsc(name)}"]`, app));
        }));
        if (q.ownershipCheck) {
          const total = (v || []).reduce((s, it) => s + (Number(it && it[q.ownershipCheck]) || 0), 0);
          if (total >= 100) { qMsg = 'Additional owners’ shares must total less than 100%.'; flag($(`[name^="${cssEsc(q.key)}["][name$=".${q.ownershipCheck}"]`, app)); }
        }
        break;
      }
      case 'radio':
      case 'checkbox':
      case 'states': {
        if (q.required && isEmpty(v)) {
          qMsg = q.type === 'states' ? 'Choose at least one state.' : 'Choose an option.';
          flag($(`[name="${cssEsc(q.key)}"]`, app));
        }
        const otherOn = v === 'Other' || (Array.isArray(v) && v.includes('Other'));
        const otherEl = $(`[name="${cssEsc(q.key)}__other"]`, app);
        if (!qMsg && otherOn && otherEl && !otherEl.value.trim()) { qMsg = 'Tell us what “Other” means for you.'; flag(otherEl); }
        break;
      }
      case 'textOrNone':
        if (q.required && !A[q.key + '__none'] && isEmpty(v)) { qMsg = 'Enter a name or check “' + q.noneLabel + '”.'; flag($(`[name="${cssEsc(q.key)}"]`, app)); }
        break;
      default: {
        const el = $(`[name="${cssEsc(q.key)}"]`, app);
        qMsg = checkValue(q, v, el);
        if (qMsg) { flag(el); el.setAttribute('aria-invalid', 'true'); } else if (el) el.removeAttribute('aria-invalid');
        if (qMsg && /is required\.$/.test(qMsg)) qMsg = 'Please answer this question.';
      }
    }
    if (qErr) qErr.textContent = qMsg;
    const bad = !!focus || !!qMsg;
    wrap.classList.toggle('has-error', bad);
    return bad ? (focus || wrap) : null;
  }

  function clearQuestion(q) {
    const wrap = qWrap(q.key);
    wrap.classList.remove('has-error');
    const e = $(':scope > .q-err', wrap); if (e) e.textContent = '';
    $$('.sf.has-error', wrap).forEach((sf) => setSubError(sf.dataset.sf, ''));
    $$('[aria-invalid]', wrap).forEach((x) => x.removeAttribute('aria-invalid'));
  }

  function validateSection(sec) {
    let first = null, count = 0;
    sec.questions.forEach((q) => {
      if (!evalCond(q.showIf, A)) { clearQuestion(q); return; }
      const f = checkQuestion(q);
      if (f) { count++; if (!first) first = f; }
    });
    return { first, count };
  }

  function checkConsent() {
    const wrap = qWrap('__consent');
    const box = $('[name="__consent"]', wrap);
    const bad = !box.checked;
    $('.q-err', wrap).textContent = bad ? 'Check this box to submit your intake.' : '';
    wrap.classList.toggle('has-error', bad);
    return bad ? box : null;
  }

  // Live re-check once a question has shown an error
  function recheck(el) {
    const wrap = el.closest('[data-q]');
    if (!wrap || !wrap.classList.contains('has-error')) return;
    if (wrap.dataset.q === '__consent') { checkConsent(); } else { checkQuestion(qByKey[wrap.dataset.q]); }
    const alert = $('.step-alert', app);
    if (!alert.hidden && !$('.step:not([hidden]) .has-error', app)) alert.hidden = true;
  }

  /* ------------------------------------------------------------ Navigation */
  const steps = () => visibleSections(A).map((s) => s.id).concat('review');
  const sectionById = (id) => I.sections.find((s) => s.id === id);

  function renderRail() {
    const list = steps();
    const cur = Math.max(0, list.indexOf(state.step));
    const pct = Math.round((cur / (list.length - 1)) * 100);
    const rail = $('.intake-rail', app);
    const title = (id) => (id === 'review' ? 'Review & submit' : sectionById(id).title);
    rail.innerHTML = `
      <div class="rail-progress">
        <div class="rail-meta"><span>Step ${cur + 1} of ${list.length}<span class="rail-inline">: ${esc(title(list[cur]))}</span></span><strong>${pct}%</strong></div>
        <div class="rail-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Intake progress"><i style="width:${pct}%"></i></div>
      </div>
      <ol class="rail-steps">
        ${list.map((id, i) => {
          const s = sectionById(id);
          const cls = i === cur ? 'is-current' : (state.visited.has(id) && i < cur ? 'is-done' : (state.visited.has(id) ? 'is-seen' : ''));
          const can = state.visited.has(id) && i !== cur;
          return `<li><button type="button" class="rail-step ${cls}" data-goto="${esc(id)}"${can ? '' : ' disabled'}${i === cur ? ' aria-current="step"' : ''}>
            <b>${cls === 'is-done' ? '<span aria-hidden="true">✓</span><span class="sr-only">Completed:</span>' : i + 1}</b>
            <span>${esc(title(id))}${s && s.badge ? `<small>${esc(s.id === 'nj' ? 'Added for New Jersey' : 'Added for Illinois')}</small>` : ''}</span>
          </button></li>`;
        }).join('')}
      </ol>
      <div class="rail-help">
        <b>Questions while you fill this out?</b>
        <a href="tel:${esc(S.contact.phoneHref)}">${esc(S.contact.phone)}</a>
        <a href="mailto:${esc(S.contact.email)}">${esc(S.contact.email)}</a>
      </div>`;
  }

  function showStep(id, { focus = true, scroll = true, save = true } = {}) {
    const list = steps();
    if (!list.includes(id)) id = list[0];
    state.step = id;
    state.visited.add(id);
    const i = list.indexOf(id);

    $$('.step', app).forEach((sec) => {
      const on = sec.dataset.step === id;
      sec.hidden = !on;
      if (on && !reduceMotion) { sec.classList.remove('enter'); void sec.offsetWidth; sec.classList.add('enter'); }
    });
    $$('[data-step-count]', app).forEach((el) => { el.textContent = `Step ${i + 1} of ${list.length}`; });
    if (id === 'review') $('.review-body', app).innerHTML = summaryHTML(A, true);

    $('.step-alert', app).hidden = true;
    const back = $('[data-back]', app);
    back.hidden = i === 0;
    const next = $('[data-next]', app);
    next.textContent = id === 'review' ? 'Submit Intake' : (list[i + 1] === 'review' ? 'Review Answers' : 'Continue');

    renderRail();
    if (save) saveNow();

    if (scroll) {
      const top = $('.intake-main', app).getBoundingClientRect().top + window.scrollY - 100;
      if (window.scrollY > top) window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    if (focus) $(`#h-${cssEsc(id)}`, app).focus({ preventScroll: true });
  }

  function showAlert(count) {
    const alert = $('.step-alert', app);
    alert.textContent = count === 1 ? '1 answer needs attention before you continue.' : `${count} answers need attention before you continue.`;
    alert.hidden = false;
  }

  function focusError(el) {
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    setTimeout(() => (el.focus ? el.focus({ preventScroll: true }) : null), reduceMotion ? 0 : 350);
  }

  function next() {
    const list = steps();
    const i = list.indexOf(state.step);
    if (state.step === 'review') { submit(); return; }
    const { first, count } = validateSection(sectionById(state.step));
    if (first) { showAlert(count); focusError(first); return; }
    showStep(list[i + 1]);
  }

  function back() {
    const list = steps();
    const i = list.indexOf(state.step);
    if (i > 0) showStep(list[i - 1]);
  }

  function goto(id) {
    const list = steps();
    const cur = list.indexOf(state.step);
    const target = list.indexOf(id);
    if (target > cur && state.step !== 'review') {
      const { first, count } = validateSection(sectionById(state.step));
      if (first) { showAlert(count); focusError(first); return; }
    }
    showStep(id);
  }

  /* ------------------------------------------------------ Save and resume */
  let saveTimer = 0;
  let submitted = false;
  function saveNow() {
    clearTimeout(saveTimer);
    saveTimer = 0;
    if (submitted) return;
    const ok = local.set(I.draftKey, { v: 1, answers: A, step: state.step, visited: [...state.visited], savedAt: Date.now() });
    const status = $('.save-status', app);
    if (status) status.textContent = ok ? `Progress saved on this device at ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : '';
  }
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 350);
  }
  // Never lose the last few keystrokes when the tab closes or goes to the background
  window.addEventListener('pagehide', () => { if (saveTimer) saveNow(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && saveTimer) saveNow(); });

  function showResume() {
    if (!draft || !draft.answers || !Object.keys(draft.answers).length) return;
    const note = $('.resume-note', app);
    const when = draft.savedAt ? new Date(draft.savedAt).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' }) : '';
    note.innerHTML = `<span><b>Welcome back.</b> We restored the progress you saved${when ? ' on ' + esc(when) : ''}.</span><button type="button" data-reset>Start over</button>`;
    note.hidden = false;
    const btn = $('[data-reset]', note);
    let armed = false, t;
    btn.addEventListener('click', () => {
      if (!armed) {
        armed = true; btn.textContent = 'Click again to erase all answers'; btn.classList.add('armed');
        t = setTimeout(() => { armed = false; btn.textContent = 'Start over'; btn.classList.remove('armed'); }, 4000);
        return;
      }
      clearTimeout(t);
      local.del(I.draftKey);
      location.reload();
    });
  }

  /* ---------------------------------------------------------------- Submit */
  let sending = false;
  async function submit() {
    if (sending) return;
    // Every visible section must be valid
    for (const s of visibleSections(A)) {
      const { first, count } = validateSection(s);
      if (first) {
        showStep(s.id, { focus: false });
        showAlert(count);
        focusError(first);
        return;
      }
    }
    const consentBad = checkConsent();
    if (consentBad) { focusError(consentBad); return; }

    const form = $('#intake-form', app);
    const btn = $('[data-next]', app);
    const alert = $('.step-alert', app);
    const answers = buildPayload(A);
    const first = (A.preferredName || '').trim() || String(A.fullName || '').trim().split(/\s+/)[0] || '';
    const done = () => {
      session.set(I.doneKey, { name: first, email: answers.email, states: answers.serviceStates || [], at: Date.now(), demo: !S.forms.endpoint, answers: A });
      submitted = true;
      clearTimeout(saveTimer);
      local.del(I.draftKey);
      window.location.href = 'thank-you.html';
    };

    if (form.elements._gotcha.value) { done(); return; } // bot trap

    const body = Object.assign({ formName: 'intake' }, answers, {
      page: 'intake.html',
      submittedAt: new Date().toISOString()
    });

    sending = true;
    btn.disabled = true;
    btn.textContent = 'Submitting…';
    alert.hidden = true;
    try {
      if (S.forms.endpoint) {
        const res = await fetch(S.forms.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(body),
          redirect: 'follow'
        });
        const out = await res.json().catch(() => null);
        if (!res.ok || !out || out.ok !== true) throw new Error((out && out.error) || 'HTTP ' + res.status);
      } else {
        await new Promise((r) => setTimeout(r, 800));
        console.info('[CareTransit demo intake]', body);
      }
      done();
    } catch (err) {
      alert.textContent = `Your intake wasn’t submitted. Your answers are still saved on this device, so try again, or call ${S.contact.phone}.`;
      alert.hidden = false;
      btn.disabled = false;
      btn.textContent = 'Submit Intake';
      sending = false;
    }
  }

  /* ------------------------------------------------------------------ Boot */
  renderApp();
  fillFromState();
  applyConditions();
  lastSectionIds = visibleSections(A).map((s) => s.id).join();
  showStep(steps().includes(state.step) ? state.step : steps()[0], { focus: false, scroll: false, save: false });
  showResume();

  const form = $('#intake-form', app);
  form.addEventListener('input', onField);
  form.addEventListener('change', (e) => { if (e.target.type === 'radio' || e.target.type === 'checkbox' || e.target.tagName === 'SELECT') onField(e); });
  form.addEventListener('submit', (e) => { e.preventDefault(); next(); });
  // Enter in a text field should not jump steps unexpectedly
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'submit') e.preventDefault();
  });

  app.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.matches('[data-back]')) back();
    else if (t.dataset.goto) goto(t.dataset.goto);
    else if (t.dataset.repAdd) {
      const q = qByKey[t.dataset.repAdd];
      A[q.key].push({});
      renderRepeater(q);
      scheduleSave();
      const items = $$(`[data-rep="${cssEsc(q.key)}"] .rep-item`, app);
      const last = items[items.length - 1];
      if (!reduceMotion) last.classList.add('reveal');
      $('input', last).focus();
    } else if (t.dataset.repRemove) {
      const q = qByKey[t.dataset.repRemove];
      A[q.key].splice(Number(t.dataset.i), 1);
      renderRepeater(q);
      clearQuestion(q);
      scheduleSave();
      $(`[data-rep-add="${cssEsc(q.key)}"]`, app).focus();
    } else if (t.dataset.unselect) {
      const box = $(`[name="serviceStates"][value="${cssEsc(t.dataset.unselect)}"]`, app);
      if (box) { box.checked = false; box.dispatchEvent(new Event('change', { bubbles: true })); }
    }
  });

  // State search
  const search = $('.st-search', app);
  if (search) {
    search.addEventListener('input', () => {
      const term = search.value.trim().toLowerCase();
      let shown = 0;
      $$('.st-grid .st', app).forEach((l) => { const on = !term || l.dataset.st.includes(term); l.hidden = !on; if (on) shown++; });
      $('.st-none', app).hidden = shown > 0;
    });
  }
})();
