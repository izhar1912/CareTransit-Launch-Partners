/* ==========================================================================
   CareTransit Launch Partners — Site content & configuration
   --------------------------------------------------------------------------
   Edit this file to update text, contact details, services, states, FAQs and
   form settings on every page. No build step needed; just save and refresh.
   (Kept as a .js file rather than .json so the site also works when opened
   straight from disk via file://.)
   ========================================================================== */

window.SITE = {

  /* ---------- Brand & contact details (replace placeholders before launch) */
  brand: {
    name: "CareTransit",
    sub: "Launch Partners",
    legalName: "CareTransit Launch Partners",
    tagline: "Medical transportation business development, launch infrastructure, and growth readiness."
  },

  contact: {
    email: "intake@caretransitlaunchpartners.com",
    phone: "+1 (630) 343-9208",
    phoneHref: "+16303439208",
    location: "1600 McConnor Parkway, Suite 300, Schaumburg, IL 60173",
    serviceArea: "Serving Illinois, New Jersey & select markets",
    responseTime: "We reply within one business day",
    timezone: "America/Chicago",                 // used for the live "open now" badge
    timezoneLabel: "Central Time",
    // 0 = Sunday … 6 = Saturday. Times are 24h in the timezone above.
    hours: [
      { days: [1, 2, 3, 4, 5], open: "09:00", close: "18:00", label: "Mon – Fri" },
      { days: [6],             open: "10:00", close: "14:00", label: "Saturday" }
    ],
    closedLabel: "Sunday",
    bookingUrl: ""                                // optional: Calendly / booking link
  },

  /* ---------- Form delivery (Google Sheet + email)
     Paste the Google Apps Script web app URL (ends in /exec) below.
     See FORMS-SETUP.md. Each submission is saved as a row in your Google
     Sheet and emailed to intake@caretransitlaunchpartners.com.
     endpoint = "" → demo mode (validates and confirms, sends nothing).     */
  forms: {
    endpoint: "https://script.google.com/macros/s/AKfycbyyagKLLuI6bZc_VqTrmZoYbT5WgVM0VFgQtuKa8PbPau0_JNHJn_ch1dznVBGvFyloMQ/exec",
    saveDrafts: true   // remembers unsent contact-form text in this browser
  },

  /* ---------- Navigation (paths starting with "#" are home-page sections) */
  nav: [
    { label: "What We Build",     href: "#what-we-build" },
    { label: "Process",           href: "#process" },
    { label: "States",            href: "#states" },
    { label: "Revenue Path",      href: "#revenue" },
    { label: "Funding Readiness", href: "#funding" },
    { label: "Client Intake",     href: "intake.html", page: "intake" },
    { label: "Contact",           href: "contact.html", page: "contact" }
  ],
  navCta: { label: "Book a Strategy Call", href: "#apply" },

  /* ---------- Home: hero roadmap */
  heroRoute: ["Strategy", "Setup", "Credentialing", "Launch"],
  heroDashboard: [
    ["Business & compliance", "Mapped"],
    ["Vehicle & insurance", "Planned"],
    ["Driver & operations files", "Built"],
    ["Funding package", "Prepared"],
    ["Website & market presence", "Launched"]
  ],

  trust: [
    ["Clarity", "Know what must happen, in what order, and why."],
    ["Infrastructure", "Walk away with systems your company can actually operate with."],
    ["Readiness", "Prepare for vehicles, insurance, payer enrollment, and contracts before overspending."],
    ["Growth", "Build a model designed to pursue recurring transportation revenue."]
  ],

  /* ---------- Home: services */
  services: [
    { title: "Business Foundation", text: "Entity setup coordination, EIN/NPI guidance where applicable, business banking readiness, professional email, domain, and document organization.",
      includes: ["Entity setup coordination", "EIN / NPI guidance", "Banking readiness", "Domain & professional email", "Document vault structure"] },
    { title: "State Compliance Roadmap", text: "A written state- and service-specific launch plan covering registrations, enrollment steps, vehicle information, driver requirements, renewals, and dependencies.",
      includes: ["Written state pathway", "Registration & enrollment steps", "Driver requirement summary", "Renewal calendar", "Dependency map"] },
    { title: "Vehicle Acquisition Strategy", text: "We help you identify the appropriate vehicle category, build a pre-purchase checklist, and connect you with vehicle sources. You decide what to buy; we help you buy with the requirements in mind.",
      includes: ["Vehicle category fit", "Pre-purchase checklist", "Vendor introductions where available", "Lease vs. buy considerations"] },
    { title: "Insurance Readiness", text: "We organize the information commercial brokers typically need and help you verify payer- or state-specific requirements before binding coverage.",
      includes: ["Broker information packet", "Coverage requirement checklist", "Payer / state verification list"] },
    { title: "Driver & Operations System", text: "Driver file structure, onboarding checklists, vehicle logs, incident forms, maintenance documentation, trip workflows, complaint procedures, and compliance tracking.",
      includes: ["Driver file templates", "Onboarding checklist", "Vehicle & maintenance logs", "Incident & complaint forms", "Compliance tracker"] },
    { title: "Dispatch & Technology", text: "Support selecting scheduling/dispatch software, business phone, email, document storage, trip documentation, invoicing workflow, and mileage/GPS processes.",
      includes: ["Dispatch software shortlist", "Phone & email setup", "Trip documentation flow", "Invoicing workflow", "Mileage / GPS process"] },
    { title: "Credentialing Support", text: "Preparation and tracking for applicable Medicaid, broker, MCO, facility, or network applications. We help resolve deficiencies and organize documentation; approvals are never guaranteed.",
      includes: ["Application preparation", "Status tracking", "Deficiency response support", "Document organization"] },
    { title: "Brand & Website Launch", text: "Professional brand direction, customer-facing website, inquiry flow, capability statement, referral materials, and credibility assets for facilities and private-pay clients.",
      includes: ["Brand direction", "Customer-facing website", "Inquiry flow", "Capability statement", "Referral materials"] },
    { title: "Funding Readiness", text: "Business-plan support, startup budget, use-of-funds plan, financial projections, lender-ready documentation, and assistance identifying potential financing sources.",
      includes: ["Business plan support", "Startup budget", "Use-of-funds plan", "Financial projections", "Funding-source research"] }
  ],

  /* ---------- Home: process */
  phases: [
    { title: "Design the Business", text: "Market, service level, payer mix, business structure, state pathway, initial budget.",
      outcome: "You leave with a defined service model and a realistic startup budget." },
    { title: "Build the Infrastructure", text: "Policies, driver files, forms, technology stack, website, operating processes.",
      outcome: "Your company has the documents and systems it needs to operate." },
    { title: "Acquire & Credential", text: "Vehicle strategy, insurance readiness, enrollment support, broker/network preparation.",
      outcome: "Applications are prepared, submitted, and tracked in order." },
    { title: "Launch & Pursue Revenue", text: "Mock trip, documentation review, outreach materials, referral targets, trip economics.",
      outcome: "You start outreach with trip economics you understand." }
  ],

  /* ---------- Home & contact: states */
  states: [
    { code: "IL", tag: "ILLINOIS", name: "Illinois", status: "active",
      title: "Illinois NEMT Launch Support",
      text: "For Illinois Medicaid transportation, both managed-care and fee-for-service transportation providers must be enrolled in IMPACT, and transportation vehicle information must be included in enrollment. Certain medicar and service-car providers are also subject to recurring safety-training certification requirements.",
      link: { label: "Official Illinois HFS resource ↗", href: "https://hfs.illinois.gov/medicalproviders/noninstitutional/nonemergencytransportation.html", external: true } },
    { code: "NJ", tag: "NEW JERSEY", name: "New Jersey", status: "active",
      title: "New Jersey NEMT Launch Support",
      text: "NJ FamilyCare identifies Modivcare as the statewide non-emergency medical transportation broker. Provider readiness can involve broker requirements plus other state, vehicle, insurance, and service-level requirements depending on the operation.",
      link: { label: "Official NJ FamilyCare resource ↗", href: "https://www.nj.gov/humanservices/dmahs/individuals-families/transportation/", external: true } },
    { code: "", tag: "EXPANDING", name: "Additional Markets", status: "expanding",
      title: "Additional Markets",
      text: "We evaluate additional states based on service model and regulatory pathway. Before a client launches, we verify current public requirements and identify items that need legal, insurance, licensing, or agency confirmation.",
      link: { label: "Ask about your state →", href: "contact.html?topic=state" } }
  ],

  usStates: ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"],

  /* ---------- Home: revenue calculator */
  calculator: { trips: 14, rate: 75, days: 22 },
  scenarios: [
    { label: "$15K gross example",  trips: 10, rate: 70, days: 22 },
    { label: "$20K+ gross example", trips: 13, rate: 75, days: 22 },
    { label: "$30K gross example",  trips: 18, rate: 76, days: 22 }
  ],

  vehicleChecklist: [
    "Ambulatory vs. wheelchair-capable strategy",
    "New, used, lease, or fleet-financing considerations",
    "Dealer/vendor introductions where available",
    "Pre-purchase document checklist",
    "Operating-cost and replacement planning"
  ],
  vehicleFit: [
    ["Service model", "Mapped"],
    ["Accessibility", "Verified"],
    ["Insurance quote inputs", "Prepared"],
    ["Enrollment data needs", "Prepared"],
    ["Operating-cost estimate", "Modeled"]
  ],

  funding: ["Startup budget", "Use-of-funds plan", "Business plan", "Financial projections", "Funding-source research", "Application preparation"],

  qualify: [
    "You want to build a legitimate medical transportation company—not just buy a van and hope.",
    "You want help understanding the sequence before committing major capital.",
    "You are prepared to complete licensing, insurance, background, training, and payer requirements that apply to your model.",
    "You understand that approval, funding, contracts, and revenue depend on third parties and market execution."
  ],

  stages: ["Researching", "Business already formed", "Vehicle purchased", "Already operating"],

  /* ---------- Contact page */
  topics: [
    { id: "strategy",  label: "Strategy call" },
    { id: "state",     label: "My state's requirements" },
    { id: "funding",   label: "Funding readiness" },
    { id: "website",   label: "Brand & website" },
    { id: "partner",   label: "Partnership or referral" },
    { id: "other",     label: "Something else" }
  ],

  nextSteps: [
    { title: "We read your note", text: "A launch advisor reviews your state, stage, and goals." },
    { title: "We reply with a path", text: "You get a short reply with likely next steps and any questions we have." },
    { title: "We schedule a call", text: "If it's a fit, we book a strategy call to map your launch sequence." }
  ],

  thanksSteps: [
    { title: "We review your intake", text: "A launch advisor reads your answers, state requirements, and current stage." },
    { title: "We reach out", text: "Expect a call, text, or email using your preferred method within one business day." },
    { title: "We map your launch", text: "On your strategy call we walk through your likely launch path and next steps." }
  ],

  faqs: [
    { q: "Do you guarantee Medicaid or broker approval?",
      a: "No. Approvals are made by the agency, broker, or network. We prepare and organize your applications, track their status, and help you respond to deficiencies." },
    { q: "Which states do you support?",
      a: "We currently build detailed launch roadmaps for Illinois and New Jersey. For other states, we review the service model and regulatory pathway first, then confirm whether we can support your launch." },
    { q: "Should I buy a vehicle before we talk?",
      a: "We recommend waiting. The right vehicle depends on your service level, payer requirements, insurance, and inspection needs. Buying early can mean rework during enrollment." },
    { q: "Can you help me get funding?",
      a: "We help you become fundable: startup budget, use-of-funds plan, business plan, projections, and research on potential financing sources. The lender makes the decision." },
    { q: "Are the revenue figures on your site what I'll earn?",
      a: "No. They are gross revenue math examples, not earnings claims. Rates, trip volume, denials, and expenses vary widely, and net profit is lower after costs." },
    { q: "I'm already operating. Can you still help?",
      a: "Yes. Many owners come to us to tighten operations files, improve documentation, pursue additional payers, or launch a better website and referral materials." }
  ],

  /* ---------- Footer */
  resources: [
    { label: "Illinois HFS — Non-Emergency Transportation", href: "https://hfs.illinois.gov/medicalproviders/noninstitutional/nonemergencytransportation.html" },
    { label: "Illinois HFS — IMPACT", href: "https://hfs.illinois.gov/impact.html" },
    { label: "NJ FamilyCare — Transportation", href: "https://www.nj.gov/humanservices/dmahs/individuals-families/transportation/" }
  ],
  disclosure: "CareTransit Launch Partners is a business-development and implementation support company. It is not a government agency, insurer, lender, law firm, accounting firm, or payer. Requirements can change and should be confirmed with the responsible agency, insurer, payer, broker, licensing body, or qualified professional before action.",
  legalLinks: ["Privacy", "Terms", "Earnings & Funding Disclaimer"]
};
