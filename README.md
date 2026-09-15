# CareTransit Launch Partners — Website Package (Dynamic)

A static, two-page website with no build step. Content is driven from one file
(`data.js`) and rendered by `script.js`, so text, contact details, services,
states and FAQs can be updated in one place.

## Files
- `index.html` — home page (layout shell; repeatable sections render from data.js)
- `contact.html` — contact page: live office-hours status, contact methods, full inquiry form, FAQ
- `data.js` — **all editable content and settings** (brand, contact info, hours, nav, services, phases, states, calculator, FAQs, footer)
- `script.js` — shared header/footer, content rendering, and all interactions
- `styles.css` — original styles, plus a clearly marked "Dynamic site additions" block at the end
- `assets/` — logo (horizontal lockup for header/footer, full logo for link previews), favicon, touch icon
- `google-apps-script/Code.gs` — form backend: saves to Google Sheets and emails the intake inbox
- `FORMS-SETUP.md` — step-by-step guide to connect the forms

## Preview
Open `index.html` in any modern browser (works from disk or any static host).

## What's dynamic
- Shared header and footer on every page; active-section highlighting while scrolling
- Hero roadmap animates once on load (skipped for users who prefer reduced motion)
- Service cards expand to show "What's included"
- Process phases are selectable and show each phase's outcome
- State lookup highlights the matching state card and links to a pre-filled contact form
- Revenue calculator with synced sliders, animated total, and one-click "Load into calculator" scenarios
- Contact page: open/closed badge computed live in the business time zone, today's hours highlighted, copy-to-clipboard for email and phone
- Forms: inline validation, spam honeypot, loading and success states, error messaging
- Contact form: topic chips, URL pre-fill (`contact.html?topic=state&state=Texas`), character counter, unsent-draft memory in the browser
- FAQ accordion

## Connecting the forms (required before launch)
Submissions are saved to a Google Sheet and emailed to intake@caretransitlaunchpartners.com
through a Google Apps Script. Follow `FORMS-SETUP.md`, then paste the web app URL
into `forms.endpoint` in `data.js`. While it is empty, the forms run in demo mode:
they validate and confirm, but send nothing.

## Before publishing
1. Confirm the office hours in `data.js`.
2. Connect the forms (above) and send a test from each one.
3. Confirm the brand name and domain are available. A basic web search is not a trademark clearance.
4. Have a qualified attorney review your Terms, Privacy Policy, service agreement, funding language, and earnings disclaimers.
5. Re-check state and payer requirements before publishing detailed claims; rules can change.
6. Add analytics, cookie/privacy controls where applicable, and accessibility testing.

## Revenue language
The website presents $15K–$30K as *illustrative gross revenue scenarios*, not guaranteed income. The calculator shows the math and warns that rates, volume, expenses, and net profit vary.

## Regulatory sources embedded in the site
- Illinois HFS Non-Emergency Transportation
- Illinois HFS IMPACT
- NJ FamilyCare Transportation
