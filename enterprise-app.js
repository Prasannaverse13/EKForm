import './styles.css';

const app = document.querySelector('#app');
const SERVICE_SCHEMAS = Object.freeze({
  'income-certificate': {
    id: 'income-certificate', prefix: 'INC', service: 'Income Certificate', icon: 'â–£', estimatedMinutes: 3, totalFields: 18,
    fields: ['full_name', 'date_of_birth', 'current_address', 'occupation', 'annual_income', 'application_purpose'],
    documents: ['identity_proof', 'address_proof', 'photograph'], photoRequirements: { format: ['jpg', 'jpeg'], width: 413, height: 531, maxSizeKB: 50 },
    plan: { verified: 12, profile: 3, missing: 3, formatting: 1 }, fee: 'Mock / no payment', integration: 'Simulated',
    questions: [
      { id: 'occupation', question: 'What is your occupation?', explanation: 'Occupation helps the department understand your current source of livelihood.', placeholder: 'For example: software professional', type: 'text' },
      { id: 'annual_income', question: 'What is your annual family income?', explanation: 'Enter the combined yearly income of your family before deductions.', placeholder: 'For example: 480000', type: 'number' },
      { id: 'application_purpose', question: 'Why do you need this certificate?', explanation: 'The department uses this to understand the purpose of your request.', placeholder: 'For example: higher-education scholarship', type: 'text' }
    ]
  },
  'scholarship-application': {
    id: 'scholarship-application', prefix: 'SCH', service: 'Scholarship Application', icon: 'â˜†', estimatedMinutes: 4, totalFields: 19,
    fields: ['full_name', 'date_of_birth', 'current_address', 'education_certificate', 'current_course', 'institution_name', 'annual_income'],
    documents: ['identity_proof', 'education_certificate', 'address_proof', 'photograph', 'signature'], photoRequirements: { format: ['jpg', 'jpeg'], width: 413, height: 531, maxSizeKB: 50 },
    signatureRequirements: { format: ['jpg', 'jpeg'], width: 140, height: 60, maxSizeKB: 30 },
    plan: { verified: 13, profile: 3, missing: 3, formatting: 2 }, fee: 'Mock / no payment', integration: 'Simulated',
    questions: [
      { id: 'current_course', question: 'What course are you currently studying?', explanation: 'This confirms which scholarship category your application belongs to.', placeholder: 'For example: B.Tech Computer Science', type: 'text' },
      { id: 'institution_name', question: 'What is the name of your institution?', explanation: 'The department needs the institution name for scholarship verification.', placeholder: 'For example: Anna University', type: 'text' },
      { id: 'annual_income', question: 'What is your annual family income?', explanation: 'Enter the combined yearly income of your family before deductions.', placeholder: 'For example: 480000', type: 'number' }
    ]
  }
});

const SIMULATED_DIGILOCKER_ADAPTER = Object.freeze({
  provider: 'Demo DigiLocker',
  requestAccess(documentIds) { return { token: `mock-dl-${Date.now().toString(36)}`, expiresOn: 'Sign out', documentIds }; },
  revoke() { return { revoked: true }; }
});

const SIMULATED_SERVICE_ADAPTERS = Object.freeze(Object.fromEntries(Object.values(SERVICE_SCHEMAS).map((schema) => [schema.id, {
  name: `${schema.service} simulated adapter`,
  validate(payload) { return { valid: Boolean(payload.consent && payload.documents.length === schema.documents.length), errors: [] }; },
  submit(payload) { return { accepted: true, reference: `EKF-${schema.prefix}-${new Date().getFullYear()}-1042`, payload }; }
}])));
const FIELD_PERMISSIONS = [
  { id: 'full_name', label: 'Full name', source: 'Identity document' },
  { id: 'date_of_birth', label: 'Date of birth', source: 'Identity document' },
  { id: 'current_address', label: 'Current address', source: 'Address proof' },
  { id: 'mobile_number', label: 'Mobile number', source: 'EkForm profile' },
  { id: 'photograph', label: 'Photograph', source: 'Document vault' }
];
const DOCUMENTS = [
  { id: 'basic_profile', label: 'Basic profile', detail: 'Name, mobile and preferred language' },
  { id: 'identity_proof', label: 'Identity document', detail: 'Synthetic identity details' },
  { id: 'address_proof', label: 'Address proof', detail: 'Synthetic current address' },
  { id: 'photograph', label: 'Photograph', detail: 'Demo portrait file' },
  { id: 'education', label: 'Educational certificate', detail: 'Synthetic qualification record' }
];
const DEFAULT_STATE = {
  authenticated: false,
  profile: { fullName: 'Demo User', mobile: '9876543210', language: 'English', pinConfigured: true },
  isDemoAccount: true,
  selectedServiceId: 'income-certificate',
  onboardingStep: 0,
  selectedDocuments: DOCUMENTS.map((document) => document.id),
  documentsConnected: false,
  fieldPermissions: FIELD_PERMISSIONS.map((field) => field.id),
  autofillComplete: false,
  selectedAddress: '',
  questionIndex: 0,
  answers: { occupation: '', annual_income: '', application_purpose: '' },
  photoFixed: false,
  signatureFixed: false,
  digiLockerToken: null,
  finalConsent: { accurate: false, simulated: false, sharing: false },
  application: null,
  accessibilityLargeText: false,
  flash: '',
  workflowStepIndex: 0
};

const ICON = {
  fallback: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0 1 16 0v1"/></svg>',
  vault: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M12 9v6"/></svg>',
  forms: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  document: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13l2 2 4-4"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.5 8.5-8 9-4.5-.5-8-4.5-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z"/><path d="M19 14l.8 2 2 .8-2 .8L19 19.6l-.8-2-2-.8 2-.8z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.4A8.5 8.5 0 1 1 21 11.5z"/><path d="M9 11h.01M12 11h.01M15 11h.01"/></svg>'
};

const CONNECTED_MODULES = [
  {
    id: 'citizen',
    side: 'left',
    row: 0,
    icon: 'user',
    title: 'Citizen Account',
    description: 'Your language, preferences and reusable information',
    tooltip: 'Profile fields and language preferences travel only after fresh consent for each application.'
  },
  {
    id: 'digilocker',
    side: 'left',
    row: 1,
    icon: 'vault',
    title: 'Demo DigiLocker',
    description: 'Verified documents shared only with permission',
    badge: 'Simulated',
    tooltip: 'Synthetic document attributes are fetched with a short-lived demo token that expires on signout.'
  },
  {
    id: 'forms',
    side: 'left',
    row: 2,
    icon: 'forms',
    title: 'Public-Service Forms',
    description: 'Different fields, formats and requirements',
    tooltip: 'Each service schema is loaded as a configured rule, so EkForm knows the exact required fields and formats.'
  },
  {
    id: 'documents',
    side: 'right',
    row: 0,
    icon: 'document',
    title: 'Document Readiness',
    description: 'Photos, signatures and PDFs prepared automatically',
    tooltip: 'Photographs and signatures are resized, compressed and stripped of metadata to match each service spec.'
  },
  {
    id: 'consent',
    side: 'right',
    row: 1,
    icon: 'shield',
    title: 'Consent and Privacy',
    description: 'Review and approve every field before sharing',
    tooltip: 'Nothing leaves EkForm until you explicitly approve each field, document and purpose for this submission.'
  },
  {
    id: 'submission',
    side: 'right',
    row: 2,
    icon: 'send',
    title: 'Submission and Tracking',
    description: 'Send the prepared application and follow its status',
    badge: 'Simulated',
    tooltip: 'The application is handed to a simulated service adapter and tracked through synthetic statuses.'
  }
];

const WORKFLOW_STEPS = [
  {
    icon: 'user',
    title: 'Sign in or create an account',
    description: 'Choose your language and securely access your EkForm profile.',
    detail: 'A short demo sign-in opens the same temporary Demo User account. No real OTP, password or personal data is created or stored.'
  },
  {
    icon: 'vault',
    title: 'Connect your documents',
    description: 'Allow selected synthetic documents from the simulated DigiLocker connection.',
    detail: 'The Demo DigiLocker holds synthetic documents. You decide which items EkForm can request, and the connection is revoked on signout.',
    badge: 'Demo'
  },
  {
    icon: 'forms',
    title: 'Choose a service',
    description: 'Select the public-service application you want to complete.',
    detail: 'Each supported service has a configured schema that describes the fields, documents, photo and signature rules EkForm must satisfy.'
  },
  {
    icon: 'sparkle',
    title: 'EkForm prepares everything',
    description: 'Verified fields are mapped, missing answers are identified, and photos, signatures and PDFs are checked against the service requirements.',
    detail: 'Form understanding, verified field mapping, missing-information detection, document preparation and consent management run as a single pass before you see any questions.',
    emphasis: true
  },
  {
    icon: 'chat',
    title: 'Answer only what is missing',
    description: 'Provide the few details that cannot be found in your connected documents.',
    detail: 'EkForm asks only the questions the configured schema could not auto-fill, with plain-language explanations for every field.'
  },
  {
    icon: 'shield',
    title: 'Review and give consent',
    description: 'Check every field, document and source before approving what will be shared.',
    detail: 'Every field, document, photo and signature is listed with its source. Approval applies only to this single application.'
  },
  {
    icon: 'send',
    title: 'Submit, track and sign out',
    description: 'Send the application to the simulated service, receive an acknowledgement, track its status and securely end the session.',
    detail: 'Submission goes to a simulated service adapter. You receive a mock acknowledgement, can advance synthetic statuses and end the session from the profile menu.',
    badge: 'Simulated submission'
  }
];

function cloneDefault() { return JSON.parse(JSON.stringify(DEFAULT_STATE)); }
function loadState() {
  try {
    const saved = JSON.parse(sessionStorage.getItem('ekform-session')) || {};
    return { ...cloneDefault(), ...saved, profile: { ...cloneDefault().profile, language: saved.profile?.language || 'English' }, isDemoAccount: true };
  } catch { return cloneDefault(); }
}
let state = loadState();
let routeRun = 0;
function persist() { sessionStorage.setItem('ekform-session', JSON.stringify(state)); }
function activeService() { return SERVICE_SCHEMAS[state.selectedServiceId] || SERVICE_SCHEMAS['income-certificate']; }
function resetApplicationDraft(serviceId) {
  state.selectedServiceId = serviceId;
  state.autofillComplete = false;
  state.selectedAddress = '';
  state.questionIndex = 0;
  state.answers = {};
  state.photoFixed = false;
  state.signatureFixed = false;
  state.finalConsent = { accurate: false, simulated: false, sharing: false };
}
function applicationHistory() { try { return JSON.parse(localStorage.getItem('ekform-applications') || '[]'); } catch { return []; } }
function saveApplication(application) { localStorage.setItem('ekform-applications', JSON.stringify([application, ...applicationHistory().filter((item) => item.id !== application.id)])); }
function h(value = '') { return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]); }
function go(path, replace = false) { if (replace) history.replaceState({}, '', path); else history.pushState({}, '', path); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function logo() { return `<img class="brand-logo" src="/ekform-logo.png" alt="EkForm" />`; }
function mockBadge(label = 'SIMULATED INTEGRATION') { return `<span class="mock-badge">${label}</span>`; }
function flash() { if (!state.flash) return ''; const message = state.flash; state.flash = ''; return `<div class="inline-notice" role="status">${h(message)}</div>`; }

function connectedPlatformSection() {
  const leftModules = CONNECTED_MODULES.filter((module) => module.side === 'left');
  const rightModules = CONNECTED_MODULES.filter((module) => module.side === 'right');
  const moduleCard = (module) => `
    <article class="conn-module" data-module-id="${module.id}" tabindex="0" aria-describedby="conn-tip-${module.id}">
      <div class="conn-module-icon">${ICON[module.icon] || ICON.fallback}<span class="conn-connection-dot" aria-hidden="true"></span></div>
      <h3>${h(module.title)}</h3>
      <p>${h(module.description)}</p>
      ${module.badge ? `<span class="conn-module-badge">${h(module.badge)}</span>` : ''}
      <div class="conn-tooltip" id="conn-tip-${module.id}" role="tooltip">${h(module.tooltip)}</div>
    </article>`;
  return `<section class="section section-connected" id="connected-platform">
    <div class="section-inner">
      <div class="section-head-centered">
        <p class="eyebrow">UNIVERSAL INTEROPERABILITY LAYER</p>
        <h2>One profile. Every form. Complete control.</h2>
        <p class="section-lead">EkForm connects your verified documents with supported public-service applications, understands each form's requirements and prepares everything for you—with your consent at every step.</p>
      </div>
      <div class="conn-stage" role="group" aria-label="Connected platform modules">
        <svg class="conn-traces" viewBox="0 0 1200 520" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="connTrace" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#137fbd" stop-opacity="0"/>
              <stop offset="50%" stop-color="#137fbd" stop-opacity=".7"/>
              <stop offset="100%" stop-color="#0c76cf" stop-opacity=".95"/>
            </linearGradient>
            <linearGradient id="connTraceRight" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stop-color="#137fbd" stop-opacity="0"/>
              <stop offset="50%" stop-color="#137fbd" stop-opacity=".7"/>
              <stop offset="100%" stop-color="#0c76cf" stop-opacity=".95"/>
            </linearGradient>
          </defs>
          <g class="conn-trace-group" fill="none" stroke="url(#connTrace)" stroke-width="1.4" stroke-linecap="round">
            <path d="M260,90 C420,90 420,180 600,260" />
            <path d="M260,260 L600,260" />
            <path d="M260,430 C420,430 420,340 600,260" />
          </g>
          <g class="conn-trace-group" fill="none" stroke="url(#connTraceRight)" stroke-width="1.4" stroke-linecap="round">
            <path d="M940,90 C780,90 780,180 600,260" />
            <path d="M940,260 L600,260" />
            <path d="M940,430 C780,430 780,340 600,260" />
          </g>
          <g class="conn-particles" aria-hidden="true">
            <circle r="2.4" fill="#7fdcff" class="conn-particle p-1"><animateMotion dur="3.4s" repeatCount="indefinite" rotate="auto" path="M260,90 C420,90 420,180 600,260" /></circle>
            <circle r="2.4" fill="#7fdcff" class="conn-particle p-2"><animateMotion dur="3.4s" begin="-.9s" repeatCount="indefinite" rotate="auto" path="M260,260 L600,260" /></circle>
            <circle r="2.4" fill="#7fdcff" class="conn-particle p-3"><animateMotion dur="3.4s" begin="-1.8s" repeatCount="indefinite" rotate="auto" path="M260,430 C420,430 420,340 600,260" /></circle>
            <circle r="2.4" fill="#7fdcff" class="conn-particle p-4"><animateMotion dur="3.4s" begin="-2.6s" repeatCount="indefinite" rotate="auto" path="M940,90 C780,90 780,180 600,260" /></circle>
            <circle r="2.4" fill="#7fdcff" class="conn-particle p-5"><animateMotion dur="3.4s" begin="-1.2s" repeatCount="indefinite" rotate="auto" path="M940,260 L600,260" /></circle>
            <circle r="2.4" fill="#7fdcff" class="conn-particle p-6"><animateMotion dur="3.4s" begin="-.3s" repeatCount="indefinite" rotate="auto" path="M940,430 C780,430 780,340 600,260" /></circle>
          </g>
        </svg>
        <div class="conn-column conn-column-left" aria-label="Source modules">
          ${leftModules.map(moduleCard).join('')}
        </div>
        <div class="conn-hub" role="img" aria-label="EkForm Intelligence Layer">
          <div class="conn-hub-glow" aria-hidden="true"></div>
          <div class="conn-hub-card">
            <span class="conn-hub-eyebrow">EKFORM</span>
            <strong>Intelligence Layer</strong>
            <ul>
              <li><span class="conn-hub-dot"></span>Form understanding</li>
              <li><span class="conn-hub-dot"></span>Verified field mapping</li>
              <li><span class="conn-hub-dot"></span>Missing-information detection</li>
              <li><span class="conn-hub-dot"></span>Document preparation</li>
              <li><span class="conn-hub-dot"></span>Consent management</li>
            </ul>
          </div>
        </div>
        <div class="conn-column conn-column-right" aria-label="Destination modules">
          ${rightModules.map(moduleCard).join('')}
        </div>
      </div>
      <p class="conn-foot">Privacy-first prototype using synthetic data and simulated integrations.</p>
    </div>
  </section>`;
}

function workflowSection() {
  const index = Math.max(0, Math.min(WORKFLOW_STEPS.length - 1, state.workflowStepIndex || 0));
  const active = WORKFLOW_STEPS[index];
  return `<section class="section section-workflow" id="how-ekform-works">
    <div class="section-inner">
      <div class="section-head-centered">
        <p class="eyebrow">HOW EKFORM WORKS</p>
        <h2>From sign-in to a tracked application.</h2>
        <p class="section-lead">Connect your verified information once. EkForm prepares each supported public-service application and asks you only for what is missing.</p>
      </div>
      <ol class="wf-rail" role="tablist" aria-label="EkForm workflow steps">
        <span class="wf-line" aria-hidden="true"></span>
        <span class="wf-traveler" aria-hidden="true"></span>
        ${WORKFLOW_STEPS.map((step, stepIndex) => `
          <li class="wf-step ${stepIndex === index ? 'active' : ''} ${step.emphasis ? 'emphasis' : ''}" data-step-index="${stepIndex}">
            <button class="wf-step-button" type="button" role="tab" aria-selected="${stepIndex === index}" aria-controls="wf-panel" data-action="workflow-step" data-step-index="${stepIndex}" id="wf-step-${stepIndex}">
              <span class="wf-node" aria-hidden="true"><i>${stepIndex + 1}</i></span>
              <span class="wf-icon" aria-hidden="true">${ICON[step.icon] || ICON.fallback}</span>
              <span class="wf-step-title">${h(step.title)}</span>
              <span class="wf-step-description">${h(step.description)}</span>
              ${step.badge ? `<span class="wf-step-badge">${h(step.badge)}</span>` : ''}
            </button>
          </li>`).join('')}
      </ol>
      <div class="wf-panel" id="wf-panel" role="tabpanel" aria-labelledby="wf-step-${index}">
        <div class="wf-panel-head">
          <span class="wf-panel-kicker">STEP ${index + 1} OF ${WORKFLOW_STEPS.length}</span>
          <strong>${h(active.title)}</strong>
        </div>
        <p>${h(active.detail)}</p>
        <ul class="wf-panel-points">
          <li><span>&#8226;</span>Each step pauses for explicit user action&mdash;no silent transitions.</li>
          <li><span>&#8226;</span>Field-level consent is collected before any data leaves EkForm.</li>
          <li><span>&#8226;</span>All integrations remain simulated for this privacy-first prototype.</li>
        </ul>
        <div class="wf-panel-actions">
          <button class="button button-primary" data-action="try-demo">See EkForm in action </button>
        </div>
      </div>
    </div>
  </section>`;
}

function publicNav() {
  return `<header class="nav route-nav"><a class="brand" data-nav="/">${logo()}</a><nav class="nav-links"><a data-nav="/#how-it-works">How it works</a><a data-nav="/privacy">Privacy</a><a data-nav="/#about">About</a></nav><div class="nav-actions"><button class="nav-auth-link" data-nav="/signin">Sign in</button></div></header>`;
}

function appHeader() {
  const initials = state.profile.fullName.split(' ').map((part) => part[0]).join('').slice(0, 2);
  return `<header class="product-header">
    <a class="brand" data-nav="/dashboard">${logo()}</a>
    <div class="product-header-tools">
      <label class="header-select"><span>Language</span><select data-language><option ${state.profile.language === 'English' ? 'selected' : ''}>English</option><option ${state.profile.language === 'à¤¹à¤¿à¤‚à¤¦à¥€' ? 'selected' : ''}>à¤¹à¤¿à¤‚à¤¦à¥€</option><option ${state.profile.language === 'à®¤à®®à®¿à®´à¯' ? 'selected' : ''}>à®¤à®®à®¿à®´à¯</option></select></label>
      <button class="accessibility-button ${state.accessibilityLargeText ? 'active' : ''}" data-action="toggle-text" aria-label="Toggle large text">A<span>A</span></button>
      <details class="profile-menu"><summary>${h(initials)}</summary><div class="profile-menu-popover"><strong>Demo User</strong><span>Demo account</span><button data-nav="/privacy">Privacy & consent</button><button data-nav="/dashboard">Application history</button><button data-action="signout">Sign out</button></div></details>
    </div>
  </header>`;
}

function privatePage(content, options = {}) {
  return `${appHeader()}<main class="product-page ${state.accessibilityLargeText ? 'large-text' : ''}">${options.step && options.step !== 'DASHBOARD' ? `<div class="route-progress"><span>${h(options.step)}</span><strong>${h(options.title || '')}</strong></div>` : ''}${content}</main>`;
}

function landingPage() {
  const signedOut = new URLSearchParams(location.search).get('signedOut');
  return `<div class="marketing">
    ${signedOut ? `<div class="secure-signout">✓ You have signed out securely. Your temporary application data has been cleared.</div>` : ''}
    <div class="announcement"><span>Independent prototype · Government and DigiLocker integrations are simulated</span><a data-nav="/#how-it-works">See how it works </a></div>
    ${publicNav()}
    <main>
      <section class="hero"><div class="hero-inner"><p class="eyebrow">CONSENT-BASED APPLICATION PREPARATION</p><h1>Fill once. Format automatically. Apply anywhere.</h1><p>EkForm prepares public-service applications using verified information you approve—then asks only for what is missing.</p><div class="hero-actions"><button class="button button-light" data-action="try-demo">Try Demo </button></div><div class="hero-note">No real Aadhaar, PAN, OTP, payment or government system is used.</div></div></section>
      <section class="section" id="how-it-works"><div class="section-inner"><p class="eyebrow">THE COMPLETE CITIZEN JOURNEY</p><h2>From verified documents to a ready application.</h2><div class="steps"><article class="step"><div class="step-number">01</div><h3>Connect with consent</h3><p>Choose exactly which synthetic documents and profile fields EkForm may use.</p></article><article class="step"><div class="step-number">02</div><h3>Answer only what’s missing</h3><p>EkForm maps verified details, resolves conflicts with you and asks three simple questions.</p></article><article class="step"><div class="step-number">03</div><h3>Review and submit</h3><p>Approve every field, prepare the photograph and receive a mock acknowledgement.</p></article></div></div></section>
      ${connectedPlatformSection()}
      ${workflowSection()}
      <section class="cta-band" id="about"><p class="eyebrow">ONE CITIZEN JOURNEY</p><h2>Fill less. Understand more. Apply with confidence.</h2><p>Complete the Income Certificate journey with synthetic documents and a simulated service adapter.</p><button class="button button-light" data-action="try-demo">Start the demo </button></section>
    </main>
    <footer class="footer"><a class="brand" data-nav="/">${logo()}</a><div class="footer-links"><a data-nav="/privacy">Privacy</a><span>Independent concept prototype</span></div></footer>
  </div>`;
}

function authVisual() {
  return `<div class="auth-visual">${logo()}<div class="auth-visual-copy"><p class="eyebrow">A SIMPLER PUBLIC-SERVICE JOURNEY</p><h1>One profile.<br />More possibilities.</h1><p>Keep verified details ready and use them only after fresh, purpose-specific consent.</p></div><div class="auth-visual-foot"><span>Private by design</span><span>Â·</span><span>Built for India</span></div></div>`;
}

function signinPage() {
  return `<div class="auth-screen"><div class="auth-shell">${authVisual()}<div class="auth-form-wrap"><button class="auth-back" data-nav="/">â† Back to homepage</button><div class="auth-form"><div class="auth-tabs"><button class="auth-tab active">Demo sign in</button><button class="auth-tab" data-nav="/signup">Demo account setup</button></div><p class="eyebrow">DEMO ACCESS</p><h2>Continue as Demo User</h2><p class="auth-copy">Every sign-in path opens the same temporary demo account and uses synthetic credentials only.</p>${flash()}<form id="signin-form"><label class="auth-field"><span>Demo mobile number</span><input name="mobile" inputmode="numeric" value="9876543210" maxlength="10" required /></label><label class="auth-field"><span>Demo four-digit PIN</span><input name="pin" inputmode="numeric" type="password" value="1234" maxlength="4" required /></label><button class="button button-primary auth-submit" type="submit">Continue as Demo User </button></form><div class="demo-credentials"><strong>Demo credentials</strong><span>Mobile: 9876543210</span><span>PIN: 1234</span></div><p class="auth-disclaimer">No real profile, password or authentication data is created.</p></div></div></div></div>`;
}

function signupPage() {
  return `<div class="auth-screen"><div class="auth-shell">${authVisual()}<div class="auth-form-wrap"><button class="auth-back" data-nav="/">â† Back to homepage</button><div class="auth-form"><div class="auth-tabs"><button class="auth-tab" data-nav="/signin">Sign in</button><button class="auth-tab active">Create demo account</button></div><p class="eyebrow">CREATE A DEMO ACCOUNT</p><h2>Explore with Demo User</h2><p class="auth-copy">All signup details are synthetic and lead to the same temporary Demo User account.</p>${flash()}<form id="signup-form"><label class="auth-field"><span>Demo user name</span><input name="fullName" value="Demo User" readonly /></label><label class="auth-field"><span>Demo mobile number</span><input name="mobile" inputmode="numeric" value="9876543210" maxlength="10" readonly /></label><label class="auth-field"><span>Preferred language</span><select name="language"><option>English</option><option>à¤¹à¤¿à¤‚à¤¦à¥€</option><option>à®¤à®®à®¿à®´à¯</option></select></label><label class="auth-field"><span>Demo four-digit PIN</span><input name="pin" inputmode="numeric" type="password" value="1234" maxlength="4" readonly /></label><button class="button button-primary auth-submit" type="submit">Continue as Demo User </button></form><p class="auth-disclaimer">For the prototype, use OTP 123456. No real profile is created.</p></div></div></div></div>`;
}

function otpPage() {
  return `<div class="centered-route"><div class="compact-panel"><button class="auth-back compact-back" data-nav="/signup">â† Edit demo setup</button><div class="route-icon">âœ¦</div><p class="eyebrow">MOCK MOBILE VERIFICATION</p><h1>Verify Demo User</h1><p>We sent a simulated OTP to the Demo User mobile number.</p>${flash()}<form id="otp-form"><label class="otp-input"><span>One-time password</span><input name="otp" inputmode="numeric" value="123456" maxlength="6" required /></label><button class="button button-primary" type="submit">Open Demo User </button></form><div class="demo-credentials horizontal"><strong>Demo OTP</strong><span>123456</span></div>${mockBadge('MOCK OTP Â· NO SMS SENT')}</div></div>`;
}

const ONBOARDING = [
  { eyebrow: 'WELCOME TO EKFORM', title: 'Prepare applications with less repetition.', copy: 'EkForm prepares public-service applications using information you explicitly approve.', icon: 'â–¤' },
  { eyebrow: 'YOU STAY IN CONTROL', title: 'Nothing is shared silently.', copy: 'Your documents and profile fields are never shared without a clear consent step.', icon: 'â—ˆ' },
  { eyebrow: 'CONNECT YOUR SOURCE', title: 'Bring verified information into one journey.', copy: 'Connect the demo DigiLocker to experience reusable, synthetic documents.', icon: 'â–¦' }
];

function onboardingPage() {
  const item = ONBOARDING[state.onboardingStep] || ONBOARDING[0];
  return `${appHeader()}<main class="onboarding-page"><div class="onboarding-panel"><div class="onboarding-count">${state.onboardingStep + 1} / 3</div><div class="onboarding-icon">${item.icon}</div><p class="eyebrow">${item.eyebrow}</p><h1>${item.title}</h1><p>${item.copy}</p><div class="onboarding-dots">${ONBOARDING.map((_, index) => `<i class="${index <= state.onboardingStep ? 'active' : ''}"></i>`).join('')}</div><div class="route-actions">${state.onboardingStep ? `<button class="button button-outline" data-action="onboarding-back">Back</button>` : ''}<button class="button button-primary" data-action="onboarding-next">${state.onboardingStep === 2 ? 'Connect document source' : 'Continue'} </button></div></div></main>`;
}

function connectDocumentsPage() {
  const success = state.documentsConnected;
  return privatePage(`<div class="content-panel consent-panel"><div class="panel-heading"><div><p class="eyebrow">DEMO DIGILOCKER CONSENT</p><h1>${success ? 'Documents connected successfully.' : 'Choose what EkForm may request.'}</h1><p>${success ? 'Four reusable documents and your basic profile are now available for this demo session.' : 'You can enable or disable each item. This permission can be revoked from Privacy controls.'}</p></div>${mockBadge('MOCK DIGILOCKER')}</div>${success ? `<div class="connection-success"><div class="success-mark">âœ“</div><div><strong>Connection ready</strong><span>Short-lived demo access token Â· expires on signout</span></div></div><div class="route-actions"><button class="button button-primary" data-nav="/dashboard">Continue to dashboard </button></div>` : `<div class="permission-list">${DOCUMENTS.map((document) => `<label class="permission-row"><div><strong>${document.label}</strong><span>${document.detail}</span></div><input type="checkbox" data-document="${document.id}" ${state.selectedDocuments.includes(document.id) ? 'checked' : ''} /></label>`).join('')}</div><div class="consent-note">EkForm will receive synthetic structured attributes—not real documents or identity numbers.</div><div class="route-actions"><button class="button button-outline" data-action="skip-documents">Not now</button><button class="button button-primary" data-action="connect-documents">Allow selected documents </button></div>`}</div>`, { step: 'SETUP', title: 'Connect documents' });
}

function dashboardPage() {
  const submitted = applicationHistory();
  return privatePage(`<div class="dashboard-welcome"><div><p class="eyebrow">YOUR EKFORM HOME</p><h1>Which service do you want to apply for?</h1><p>Welcome back, ${h(state.profile.fullName)}. Reuse approved information and answer only service-specific questions.</p></div></div><div class="service-grid enterprise-services"><button class="service-card selected" data-action="start-service" data-service-id="income-certificate"><div class="service-icon">â–£</div><strong>Income Certificate</strong><span>Complete working journey Â· about 3 minutes</span><em>Start application </em></button><button class="service-card" data-action="preview-service"><div class="service-icon">â—‡</div><strong>Community Certificate</strong><span>Explore the reusable profile concept</span><em>Demo preview</em></button><button class="service-card" data-action="start-service" data-service-id="scholarship-application"><div class="service-icon">â˜†</div><strong>Scholarship Application</strong><span>Complete working journey Â· profile reuse + signature formatting</span><em>Start application </em></button><button class="service-card" data-action="preview-service"><div class="service-icon">âŒ</div><strong>Senior Citizen Travel Concession</strong><span>Prepare identity and eligibility details</span><em>Demo preview</em></button></div>${flash()}<div class="dashboard-sections"><section class="dashboard-list"><div class="dashboard-section-head"><h2>Applications in progress</h2></div><div class="application-card"><div class="application-icon">${activeService().icon}</div><div class="application-info"><span class="application-kicker">READY TO CONTINUE</span><h3>${activeService().service}</h3><p>Start with reusable information and service-specific missing questions.</p></div><button class="button button-outline button-small" data-action="start-service" data-service-id="${activeService().id}">Open</button></div></section><section class="dashboard-list"><div class="dashboard-section-head"><h2>Submitted applications</h2></div>${submitted.length ? submitted.slice(0, 2).map((item) => `<div class="application-card"><div class="application-icon">âœ“</div><div class="application-info"><span class="application-kicker">${h(item.status).toUpperCase()}</span><h3>${h(item.service)}</h3><p>${h(item.id)} Â· ${h(item.submittedAt)}</p></div><button class="button button-outline button-small" data-nav="/applications/${encodeURIComponent(item.id)}">Track</button></div>`).join('') : `<div class="empty-state">No submitted applications yet.</div>`}</section><section class="dashboard-list documents-summary"><div class="dashboard-section-head"><h2>Connected documents</h2><button class="text-button" data-nav="/privacy">Manage</button></div><div class="document-chips"><span>Identity proof âœ“</span><span>Address proof âœ“</span><span>Photograph âœ“</span><span>Education certificate âœ“</span><span>Signature âœ“</span></div></section></div>`, { step: 'DASHBOARD', title: 'Citizen services' });
}

function serviceOverviewPage() {
  const service = activeService();
  return privatePage(`<div class="content-panel service-overview"><button class="back-row" data-nav="/dashboard">â† Back to services</button><div class="service-title"><div class="service-large-icon">${service.icon}</div><div><p class="eyebrow">PUBLIC SERVICE APPLICATION</p><h1>${service.service}</h1><p>Prepare a simulated application using verified synthetic information from your EkForm profile and document vault.</p></div></div><div class="overview-stats"><div><span>Estimated time</span><strong>${service.estimatedMinutes} minutes</strong></div><div><span>Total fields</span><strong>${service.totalFields}</strong></div><div><span>Documents required</span><strong>${service.documents.length}</strong></div><div><span>Application fee</span><strong>${service.fee}</strong></div></div><div class="requirements-preview"><h2>What youâ€™ll need</h2>${service.documents.map((document, index) => `<div class="requirement-row"><span>${document === 'photograph' || document === 'signature' ? '!' : 'âœ“'}</span><div><strong>${document.replaceAll('_', ' ')}</strong><small>${document === 'photograph' ? 'Needs automatic formatting' : document === 'signature' ? 'Needs automatic formatting' : index === 1 ? 'Connected with one conflict to review' : 'Connected and ready'}</small></div></div>`).join('')}</div><div class="simulated-callout">${mockBadge(`${service.integration.toUpperCase()} SERVICE ADAPTER`)}<p>This prototype does not connect to a live government service or accept payment.</p></div><div class="route-actions"><button class="button button-primary" data-nav="/applications/new/plan">Prepare my application </button></div></div>`, { step: 'SUPPORTED SERVICE', title: service.service });
}

function applicationPlanPage() {
  const service = activeService();
  const formatLabel = service.signatureRequirements ? 'photograph + signature need formatting' : 'photograph needs formatting';
  return privatePage(`<div class="content-panel plan-panel"><p class="eyebrow">THE EKFORM MOMENT</p><h1>Your application plan</h1><p>EkForm compared the configured ${service.service} requirements with your approved demo profile and documents.</p><div class="plan-grid"><div class="plan-card"><strong>${service.plan.verified}</strong><span>fields from verified documents</span></div><div class="plan-card"><strong>${service.plan.profile}</strong><span>fields from your EkForm profile</span></div><div class="plan-card attention"><strong>${service.plan.missing}</strong><span>questions need your answer</span></div><div class="plan-card attention"><strong>${service.plan.formatting}</strong><span>${formatLabel}</span></div></div><div class="rules-card"><div><span>Service rule source</span><strong>Configured schema Â· not AI-generated</strong></div><code>Photo: JPG/JPEG Â· 413 Ã— 531 px Â· max 50 KB${service.signatureRequirements ? ' Â· Signature: 140 Ã— 60 px Â· max 30 KB' : ''}</code></div><div class="route-actions"><button class="button button-outline" data-nav="/services/${service.id}">Back</button><button class="button button-primary" data-nav="/applications/new/consent">Continue with EkForm </button></div></div>`, { step: 'STEP 1 OF 8', title: 'Application plan' });
}

function fieldConsentPage() {
  const service = activeService();
  const fields = service.id === 'scholarship-application' ? [...FIELD_PERMISSIONS, { id: 'education_certificate', label: 'Educational certificate', source: 'Document vault' }] : FIELD_PERMISSIONS;
  return privatePage(`<div class="content-panel consent-panel"><p class="eyebrow">FIELD-LEVEL CONSENT</p><h1>Choose the information EkForm may use.</h1><p>Nothing is filled into the application until you approve these fields.</p>${flash()}<div class="consent-table"><div class="consent-table-head"><span>Field</span><span>Source</span><span>Permission</span></div>${fields.map((field) => `<label class="consent-table-row"><strong>${field.label}</strong><span>${field.source}</span><input type="checkbox" data-field-permission="${field.id}" ${state.fieldPermissions.includes(field.id) || field.id === 'education_certificate' ? 'checked' : ''} /></label>`).join('')}</div><div class="consent-note">Permission applies only to this ${service.service} application.</div><div class="route-actions"><button class="button button-outline" data-nav="/applications/new/plan">Back</button><button class="button button-primary" data-action="use-selected-fields">Use selected information </button></div></div>`, { step: 'STEP 2 OF 8', title: 'Information consent' });
}

function autofillPage() {
  const stages = ['Understanding the application', 'Matching verified information', 'Checking required documents', 'Finding missing answers'];
  return privatePage(`<div class="content-panel autofill-panel"><p class="eyebrow">FORM UNDERSTANDING</p><h1>${state.autofillComplete ? '15 of 18 fields completed.' : 'EkForm is preparing your application.'}</h1><p>The configured schema supplies exact requirements. AI assists only with field-label understanding and plain-language explanations.</p><div class="autofill-steps">${stages.map((stage, index) => `<div class="autofill-step" style="--delay:${index * .55}s"><i>${state.autofillComplete ? 'âœ“' : index + 1}</i><span>${stage}</span></div>`).join('')}</div>${state.autofillComplete ? `<div class="mapping-preview"><div><span>Name of Applicant</span><strong>Full name</strong><small>From identity document</small></div><div><span>Residential Details</span><strong>Current address</strong><small>From address proof</small></div><div><span>DOB of Beneficiary</span><strong>Date of birth</strong><small>From identity document</small></div><div><span>Reason for Certificate</span><strong>Application purpose</strong><small>Needs your answer</small></div></div><div class="route-actions"><button class="button button-primary" data-nav="/applications/new/conflicts">Review one conflict </button></div>` : `<div class="processing-line"><span></span></div>`}</div>`, { step: 'STEP 3 OF 8', title: 'Autofill verified information' });
}

function conflictPage() {
  return privatePage(`<div class="content-panel conflict-panel"><p class="eyebrow">ONE CONFLICT NEEDS YOU</p><h1>Which address should this application use?</h1><p>Your synthetic identity document and address proof contain different addresses. EkForm will never choose for you.</p>${flash()}<div class="address-options"><label class="address-option ${state.selectedAddress === 'current' ? 'selected' : ''}"><input type="radio" name="address" value="current" data-address ${state.selectedAddress === 'current' ? 'checked' : ''} /><span>Current address</span><strong>24 Lake View Road, Adyar, Chennai 600020</strong><small>From address proof Â· issued 12 May 2026</small></label><label class="address-option ${state.selectedAddress === 'permanent' ? 'selected' : ''}"><input type="radio" name="address" value="permanent" data-address ${state.selectedAddress === 'permanent' ? 'checked' : ''} /><span>Permanent address</span><strong>18 Temple Street, Madurai 625001</strong><small>From identity document Â· issued 04 January 2024</small></label><label class="address-option ${state.selectedAddress === 'another' ? 'selected' : ''}"><input type="radio" name="address" value="another" data-address ${state.selectedAddress === 'another' ? 'checked' : ''} /><span>Enter another address</span><strong>I will provide a different address</strong></label></div><div class="route-actions"><button class="button button-outline" data-nav="/applications/new/autofill">Back</button><button class="button button-primary" data-action="confirm-address">Use selected address </button></div></div>`, { step: 'STEP 4 OF 8', title: 'Resolve conflicts' });
}

function serviceQuestions() { return activeService().questions; }

function questionsPage() {
  const questions = serviceQuestions();
  const question = questions[state.questionIndex] || questions[0];
  const value = state.answers[question.id] || '';
  return privatePage(`<div class="content-panel question-panel"><div class="question-progress"><span>Question ${state.questionIndex + 1} of ${questions.length}</span><div><i style="width:${((state.questionIndex + 1) / questions.length) * 100}%"></i></div></div><p class="eyebrow">ONLY WHATâ€™S MISSING</p><h1>${question.question}</h1><p>${question.explanation}</p><label class="question-input"><input id="question-answer" type="${question.type}" value="${h(value)}" placeholder="${question.placeholder}" /><button type="button" data-action="voice-input" aria-label="Use voice input">â—‰ Voice</button></label><details class="why-details"><summary>Why are we asking this?</summary><p>${question.explanation} This answer is required by the configured service schema.</p></details><div class="route-actions"><button class="button button-outline" data-action="question-back">Back</button><button class="button button-primary" data-action="question-next">${state.questionIndex === questions.length - 1 ? 'Check my documents' : 'Next question'} </button></div></div>`, { step: 'STEP 5 OF 8', title: 'Missing questions' });
}

function documentsPage() {
  const service = activeService();
  const needsSignature = Boolean(service.signatureRequirements);
  const ready = state.photoFixed && (!needsSignature || state.signatureFixed);
  const formatDetails = needsSignature ? `Photograph and signature need correction.` : `Two documents are ready. One needs correction.`;
  return privatePage(`<div class="content-panel documents-panel"><p class="eyebrow">DOCUMENT READINESS</p><h1>${formatDetails}</h1><p>Exact upload limits come from the ${service.service} service configuration.</p><div class="readiness-list"><div class="readiness-item"><div class="file-symbol">ID</div><div><strong>Identity document</strong><span>PDF Â· 640 KB Â· name and date of birth matched</span></div><em class="ready">âœ“ Ready</em></div><div class="readiness-item"><div class="file-symbol">AP</div><div><strong>Address proof</strong><span>PDF Â· 1.2 MB Â· selected current address matched</span></div><em class="ready">âœ“ Ready</em></div>${service.id === 'scholarship-application' ? `<div class="readiness-item"><div class="file-symbol">EDU</div><div><strong>Educational certificate</strong><span>PDF Â· 720 KB Â· qualification matched</span></div><em class="ready">âœ“ Ready</em></div>` : ''}<div class="readiness-item photo-readiness"><div class="file-symbol">IMG</div><div><strong>Photograph</strong><span>${state.photoFixed ? 'JPG Â· 413 Ã— 531 px Â· 42 KB Â· metadata removed' : 'JPG Â· 920 Ã— 1200 px Â· 310 KB'}</span></div>${state.photoFixed ? `<em class="ready">âœ“ Ready</em>` : `<em class="needs-fix">Needs correction</em>`}</div>${needsSignature ? `<div class="readiness-item photo-readiness"><div class="file-symbol">SIG</div><div><strong>Signature</strong><span>${state.signatureFixed ? 'JPG Â· 140 Ã— 60 px Â· 18 KB Â· metadata removed' : 'JPG Â· 98 Ã— 48 px Â· 74 KB'}</span></div>${state.signatureFixed ? `<em class="ready">âœ“ Ready</em>` : `<em class="needs-fix">Needs correction</em>`}</div>` : ''}</div>${state.photoFixed ? `<div class="photo-comparison"><div><span>Before</span><div class="photo-placeholder before-photo">310 KB</div><small>920 Ã— 1200 px</small></div><div class="format-arrow"></div><div><span>After</span><div class="photo-placeholder after-photo">42 KB âœ“</div><small>413 Ã— 531 px</small></div><ul><li>Crop completed</li><li>Resized to configured dimensions</li><li>Compressed under 50 KB</li><li>Face visibility check simulated</li><li>Metadata removed</li></ul></div>` : `<div class="photo-rule"><strong>Photo required</strong><code>JPG/JPEG Â· 413 Ã— 531 px Â· under 50 KB</code><button class="button button-primary" data-action="fix-photo">Fix photograph </button></div>`}${needsSignature ? (state.signatureFixed ? `<div class="signature-success">âœ“ Signature ready — JPG Â· 140 Ã— 60 px Â· 18 KB</div>` : `<div class="photo-rule"><strong>Signature required</strong><code>JPG/JPEG Â· 140 Ã— 60 px Â· under 30 KB</code><button class="button button-primary" data-action="fix-signature">Fix signature </button></div>`) : ''}<div class="route-actions"><button class="button button-outline" data-nav="/applications/new/questions">Back</button><button class="button button-primary" data-action="documents-next" ${ready ? '' : 'disabled'}>Review application </button></div></div>`, { step: 'STEP 6 OF 8', title: 'Document readiness' });
}

function source(label) { return `<small class="source-label">${label}</small>`; }

function reviewPage() {
  const service = activeService();
  const address = state.selectedAddress === 'permanent' ? '18 Temple Street, Madurai 625001' : '24 Lake View Road, Adyar, Chennai 600020';
  const questionRows = serviceQuestions().map((question) => `<div class="review-field"><span>${h(question.question.replace('What is your ', '').replace('What course are you currently studying?', 'Current course').replace('What is the name of your institution?', 'Institution name').replace('Why do you need this certificate?', 'Application purpose'))}</span><strong>${h(question.id === 'annual_income' ? `â‚¹${Number(state.answers[question.id] || 0).toLocaleString('en-IN')}` : state.answers[question.id])}</strong>${source('Provided by you')}</div>`).join('');
  const extraDocs = service.signatureRequirements ? `<span>Formatted signature Â· 18 KB âœ“</span>` : '';
  return privatePage(`<div class="content-panel review-panel"><p class="eyebrow">COMPLETED APPLICATION</p><h1>Review every detail and source.</h1><p>${service.service} Â· nothing has been submitted. You can still edit or save this draft.</p><div class="review-sections"><section><h2>Personal details</h2><div class="review-field"><span>Full name</span><strong>${h(state.profile.fullName)}</strong>${source('From identity document')}</div><div class="review-field"><span>Date of birth</span><strong>12 August 2002</strong>${source('From identity document')}</div><div class="review-field"><span>Mobile number</span><strong>+91 ${h(state.profile.mobile)}</strong>${source('From EkForm profile')}</div></section><section><h2>Address</h2><div class="review-field full-review-field"><span>Current address</span><strong>${address}</strong>${source(state.selectedAddress === 'permanent' ? 'From identity document' : 'From address proof')}</div><div class="review-field"><span>District</span><strong>${state.selectedAddress === 'permanent' ? 'Madurai' : 'Chennai'}</strong>${source('Mapped by EkForm')}</div><div class="review-field"><span>PIN code</span><strong>${state.selectedAddress === 'permanent' ? '625001' : '600020'}</strong>${source('From selected address')}</div></section><section><h2>Service details</h2>${questionRows}</section><section><h2>Documents</h2><div class="document-chips"><span>Identity proof âœ“</span><span>Address proof âœ“</span>${service.id === 'scholarship-application' ? `<span>Educational certificate âœ“</span>` : ''}<span>Formatted photograph Â· 42 KB âœ“</span>${extraDocs}</div></section></div><div class="route-actions three-actions"><button class="button button-outline" data-nav="/applications/new/questions">Edit</button><button class="button button-outline" data-action="save-draft">Save and continue later</button><button class="button button-primary" data-nav="/applications/new/final-consent">Continue to consent </button></div></div>`, { step: 'STEP 7 OF 8', title: 'Application review' });
}

function finalConsentPage() {
  const service = activeService();
  const ready = Object.values(state.finalConsent).every(Boolean);
  return privatePage(`<div class="content-panel final-consent-panel"><div class="consent-shield">â—ˆ</div><p class="eyebrow">FINAL SHARING CONSENT</p><h1>Approve this simulated submission.</h1><p>EkForm will share <strong>${service.totalFields} form fields and ${service.documents.length} documents</strong> with the simulated ${service.service} service.</p><div class="sharing-summary"><div><span>Form fields</span><strong>${service.totalFields}</strong></div><div><span>Documents</span><strong>${service.documents.length}</strong></div><div><span>Purpose</span><strong>${service.service}</strong></div><div><span>Access</span><strong>Single submission</strong></div></div><div class="final-checks"><label><input type="checkbox" data-final-consent="accurate" ${state.finalConsent.accurate ? 'checked' : ''} /><span>I confirm that the information is correct.</span></label><label><input type="checkbox" data-final-consent="simulated" ${state.finalConsent.simulated ? 'checked' : ''} /><span>I understand this is a simulated submission.</span></label><label><input type="checkbox" data-final-consent="sharing" ${state.finalConsent.sharing ? 'checked' : ''} /><span>I approve sharing the selected information for this application.</span></label></div><p class="unselected-hint">All checkboxes require an active choice and are unselected by default.</p><div class="route-actions"><button class="button button-outline" data-nav="/applications/new/review">Back</button><button class="button button-primary" data-action="submit-application" ${ready ? '' : 'disabled'}>Approve and submit </button></div></div>`, { step: 'STEP 8 OF 8', title: 'Final consent' });
}

function successPage() {
  const application = state.application || applicationHistory()[0];
  const service = Object.values(SERVICE_SCHEMAS).find((item) => item.service === application?.service) || activeService();
  if (!application) return `<div class="centered-route"><div class="compact-panel"><h1>No submitted application found.</h1><button class="button button-primary" data-nav="/dashboard">Return to dashboard</button></div></div>`;
  return privatePage(`<div class="content-panel success-panel"><div class="success-mark large">âœ“</div><p class="eyebrow">SUBMISSION COMPLETE</p><h1>Application submitted successfully.</h1><p>Your application passed the configured field and document validations, then reached the simulated service adapter.</p><div class="receipt-grid"><div><span>Application ID</span><strong>${h(application.id)}</strong></div><div><span>Submitted service</span><strong>${h(application.service)}</strong></div><div><span>Submission time</span><strong>${h(application.submittedAt)}</strong></div><div><span>Current status</span><strong>${h(application.status)}</strong></div><div><span>Documents shared</span><strong>${application.documentsShared || service.documents.length} synthetic documents</strong></div><div><span>Consent receipt</span><strong>${h(application.consentReceipt)}</strong></div></div>${mockBadge('SUBMISSION ADAPTER Â· SIMULATED')}<div class="impact-callout"><strong>EkForm completed ${service.plan.verified + service.plan.profile} fields automatically and prepared ${service.documents.length} documents.</strong><span>You answered only ${service.questions.length} questions.</span></div><div class="route-actions success-actions"><button class="button button-outline" data-action="download-receipt">Download mock receipt</button><button class="button button-outline" data-nav="/dashboard">Return to dashboard</button><button class="button button-primary" data-nav="/applications/${encodeURIComponent(application.id)}">Track application </button></div></div>`, { step: 'SUBMITTED', title: 'Acknowledgement' });
}

function trackingPage(applicationId) {
  const application = applicationHistory().find((item) => item.id === applicationId) || state.application;
  if (!application) return privatePage(`<div class="content-panel"><h1>Application not found.</h1><button class="button button-primary" data-nav="/dashboard">Return to dashboard</button></div>`);
  const statuses = ['Submitted', 'Under review', 'Approved'];
  const current = Math.max(0, statuses.indexOf(application.status));
  return privatePage(`<div class="content-panel tracking-panel"><button class="back-row" data-nav="/dashboard">â† Back to dashboard</button><p class="eyebrow">APPLICATION TRACKING</p><h1>${h(application.service)}</h1><p>${h(application.id)} Â· Last updated ${h(application.updatedAt || application.submittedAt)}</p><div class="tracking-timeline">${statuses.map((status, index) => `<div class="tracking-step ${index <= current ? 'complete' : ''} ${index === current ? 'current' : ''}"><i>${index < current ? 'âœ“' : index + 1}</i><strong>${status}</strong><span>${index <= current ? (index === current ? 'Current status' : 'Completed') : 'Pending'}</span></div>`).join('')}</div><div class="simulated-callout">${mockBadge('MOCK STATUS CONTROL')}<p>For the prototype, advance the application to demonstrate tracking.</p></div><div class="route-actions"><button class="button button-primary" data-action="advance-status" ${current === statuses.length - 1 ? 'disabled' : ''}>Simulate next status </button></div></div>`, { step: 'TRACKING', title: application.id });
}

function privacyPage() {
  const savedApplications = applicationHistory();
  const content = `<div class="content-panel privacy-controls"><button class="back-row" data-nav="${state.authenticated ? '/dashboard' : '/'}">â† Back</button><p class="eyebrow">PROFILE & PRIVACY CONTROLS</p><h1>See and control your information.</h1><p>Review what was connected, what each service received and when consent was provided.</p><div class="privacy-grid"><section><h2>Connected documents</h2><div class="privacy-list">${DOCUMENTS.slice(1).map((document) => `<div><span>${document.label}</span><strong>${state.documentsConnected ? 'Connected' : 'Not connected'}</strong></div>`).join('')}</div></section><section><h2>Saved information</h2><div class="privacy-list"><div><span>Basic profile</span><strong>${h(state.profile.fullName)}</strong></div><div><span>Preferred language</span><strong>${h(state.profile.language)}</strong></div><div><span>Temporary draft</span><strong>${state.answers.occupation ? 'Stored in this session' : 'None'}</strong></div></div></section><section class="full-privacy-section"><h2>Consent history</h2>${savedApplications.length ? `<div class="consent-history"><div class="consent-history-head"><span>Service</span><span>Information shared</span><span>Provided</span></div>${savedApplications.map((item) => `<div><strong>${h(item.service)}</strong><span>18 fields Â· 3 documents</span><span>${h(item.submittedAt)}</span></div>`).join('')}</div>` : `<div class="empty-state">No consent receipts yet.</div>`}</section></div><div class="danger-zone"><div><strong>Delete saved demo profile</strong><span>Clears temporary profile and document connection from this browser.</span></div><button class="button button-outline" data-action="delete-profile">Delete saved profile</button></div>${state.authenticated ? `<button class="button button-primary" data-action="signout">Sign out securely</button>` : ''}</div>`;
  return state.authenticated ? privatePage(content, { step: 'PRIVACY', title: 'Consent controls' }) : `${publicNav()}<main class="public-privacy">${content}</main>`;
}
function guard(path) {
  return ['/onboarding', '/connect-documents', '/dashboard', '/services/', '/applications/'].some((prefix) => path.startsWith(prefix)) && !state.authenticated;
}

function render() {
  routeRun += 1;
  const run = routeRun;
  const path = location.pathname;
  if (guard(path)) { go('/signin', true); return; }
  let html;
  if (path === '/') html = landingPage();
  else if (path === '/signin') html = signinPage();
  else if (path === '/signup') html = signupPage();
  else if (path === '/verify-otp') html = otpPage();
  else if (path === '/onboarding') html = onboardingPage();
  else if (path === '/connect-documents') html = connectDocumentsPage();
  else if (path === '/dashboard') html = dashboardPage();
  else if (path === '/services/income-certificate') { state.selectedServiceId = 'income-certificate'; html = serviceOverviewPage(); }
  else if (path === '/services/scholarship-application') { state.selectedServiceId = 'scholarship-application'; html = serviceOverviewPage(); }
  else if (path === '/applications/new/plan') html = applicationPlanPage();
  else if (path === '/applications/new/consent') html = fieldConsentPage();
  else if (path === '/applications/new/autofill') html = autofillPage();
  else if (path === '/applications/new/conflicts') html = conflictPage();
  else if (path === '/applications/new/questions') html = questionsPage();
  else if (path === '/applications/new/documents') html = documentsPage();
  else if (path === '/applications/new/review') html = reviewPage();
  else if (path === '/applications/new/final-consent') html = finalConsentPage();
  else if (path === '/applications/new/success') html = successPage();
  else if (path.startsWith('/applications/')) html = trackingPage(decodeURIComponent(path.split('/').pop()));
  else if (path === '/privacy') html = privacyPage();
  else html = `<div class="centered-route"><div class="compact-panel"><h1>Page not found.</h1><button class="button button-primary" data-nav="/">Return home</button></div></div>`;
  app.innerHTML = html;
  if (path === '/applications/new/autofill' && !state.autofillComplete) {
    setTimeout(() => {
      if (run !== routeRun || location.pathname !== path) return;
      state.autofillComplete = true;
      persist();
      render();
    }, 2400);
  }
}

function validateSignup(form) {
  const data = new FormData(form);
  const mobile = String(data.get('mobile') || '').trim();
  const pin = String(data.get('pin') || '').trim();
  if (!/^\d{10}$/.test(mobile) || !/^\d{4}$/.test(pin)) {
    state.flash = 'Enter a valid 10-digit mobile number and four-digit PIN.';
    render();
    return;
  }
  state.profile = { fullName: 'Demo User', mobile: '9876543210', language: String(data.get('language') || 'English'), pinConfigured: true };
  state.isDemoAccount = true;
  persist();
  go('/verify-otp');
}

function completeSignout() {
  const largeText = state.accessibilityLargeText;
  if (state.digiLockerToken) SIMULATED_DIGILOCKER_ADAPTER.revoke(state.digiLockerToken);
  state = cloneDefault();
  state.accessibilityLargeText = largeText;
  sessionStorage.removeItem('ekform-session');
  go('/?signedOut=1');
}

document.addEventListener('submit', (event) => {
  event.preventDefault();
  if (event.target.id === 'signin-form') {
    const data = new FormData(event.target);
    if (data.get('mobile') !== '9876543210' || data.get('pin') !== '1234') {
      state.flash = 'Use the synthetic credentials shown below the form.';
      render();
      return;
    }
    state.authenticated = true;
    state.isDemoAccount = true;
    state.profile = { fullName: 'Demo User', mobile: '9876543210', language: 'English', pinConfigured: true };
    state.onboardingStep = 0;
    persist();
    go('/onboarding');
  }
  if (event.target.id === 'signup-form') validateSignup(event.target);
  if (event.target.id === 'otp-form') {
    const otp = String(new FormData(event.target).get('otp') || '');
    if (otp !== '123456') { state.flash = 'Use the synthetic OTP 123456.'; render(); return; }
    state.authenticated = true;
    state.isDemoAccount = true;
    state.profile = { fullName: 'Demo User', mobile: '9876543210', language: state.profile.language || 'English', pinConfigured: true };
    state.onboardingStep = 0;
    persist();
    go('/onboarding');
  }
});

document.addEventListener('change', (event) => {
  const target = event.target;
  if (target.matches('[data-language]')) { state.profile.language = target.value; persist(); }
  if (target.matches('[data-document]')) { state.selectedDocuments = target.checked ? [...new Set([...state.selectedDocuments, target.dataset.document])] : state.selectedDocuments.filter((id) => id !== target.dataset.document); persist(); }
  if (target.matches('[data-field-permission]')) { state.fieldPermissions = target.checked ? [...new Set([...state.fieldPermissions, target.dataset.fieldPermission])] : state.fieldPermissions.filter((id) => id !== target.dataset.fieldPermission); persist(); }
  if (target.matches('[data-address]')) { state.selectedAddress = target.value; persist(); render(); }
  if (target.matches('[data-final-consent]')) { state.finalConsent[target.dataset.finalConsent] = target.checked; persist(); render(); }
});

document.addEventListener('click', (event) => {
  const nav = event.target.closest('[data-nav]');
  if (nav) {
    event.preventDefault();
    const destination = nav.dataset.nav;
    if (destination.includes('#')) {
      const [path, hash] = destination.split('#');
      go(path || '/');
      requestAnimationFrame(() => document.querySelector(`#${hash}`)?.scrollIntoView({ behavior: 'smooth' }));
    } else go(destination);
    return;
  }
  const actionElement = event.target.closest('[data-action]');
  const action = actionElement?.dataset.action;
  if (!action) return;
  if (action === 'workflow-step') {
    const nextIndex = Number(actionElement.dataset.stepIndex);
    if (Number.isInteger(nextIndex) && nextIndex >= 0 && nextIndex < WORKFLOW_STEPS.length) {
      state.workflowStepIndex = nextIndex;
      persist();
      render();
      requestAnimationFrame(() => document.querySelector('.wf-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
    }
    return;
  }
  if (action === 'try-demo') {
    state.authenticated = true;
    state.isDemoAccount = true;
    state.profile = { fullName: 'Demo User', mobile: '9876543210', language: 'English', pinConfigured: true };
    state.documentsConnected = true;
    state.selectedDocuments = DOCUMENTS.map((document) => document.id);
    state.digiLockerToken = SIMULATED_DIGILOCKER_ADAPTER.requestAccess(state.selectedDocuments);
    resetApplicationDraft('income-certificate');
    persist();
    go('/dashboard');
  }
  if (action === 'toggle-text') { state.accessibilityLargeText = !state.accessibilityLargeText; persist(); render(); }
  if (action === 'start-service') { const serviceId = actionElement.dataset.serviceId; if (!SERVICE_SCHEMAS[serviceId]) return; resetApplicationDraft(serviceId); persist(); go(`/services/${serviceId}`); }
  if (action === 'onboarding-back') { state.onboardingStep = Math.max(0, state.onboardingStep - 1); persist(); render(); }
  if (action === 'onboarding-next') { if (state.onboardingStep < 2) { state.onboardingStep += 1; persist(); render(); } else go('/connect-documents'); }
  if (action === 'connect-documents') { if (!state.selectedDocuments.length) { state.flash = 'Select at least one item to continue.'; render(); return; } state.documentsConnected = true; state.digiLockerToken = SIMULATED_DIGILOCKER_ADAPTER.requestAccess(state.selectedDocuments); persist(); render(); }
  if (action === 'skip-documents') go('/dashboard');
  if (action === 'preview-service') { state.flash = 'This service is a demo preview. Income Certificate contains the complete journey.'; persist(); render(); }
  if (action === 'use-selected-fields') { if (state.fieldPermissions.length < 3) { state.flash = 'Allow at least the required name, address and date fields to continue.'; render(); return; } state.autofillComplete = false; persist(); go('/applications/new/autofill'); }
  if (action === 'confirm-address') { if (!state.selectedAddress) { state.flash = 'Select the address you want to use.'; render(); return; } go('/applications/new/questions'); }
  if (action === 'question-back') { if (state.questionIndex === 0) go('/applications/new/conflicts'); else { state.questionIndex -= 1; persist(); render(); } }
  if (action === 'question-next') {
    const questions = serviceQuestions();
    const question = questions[state.questionIndex];
    const answer = String(document.querySelector('#question-answer')?.value || '').trim();
    if (!answer) { document.querySelector('#question-answer')?.focus(); return; }
    state.answers[question.id] = answer;
    if (state.questionIndex < questions.length - 1) { state.questionIndex += 1; persist(); render(); } else { persist(); go('/applications/new/documents'); }
  }
  if (action === 'voice-input') {
    const examples = { occupation: 'Software professional', annual_income: '480000', application_purpose: 'Higher-education scholarship', current_course: 'B.Tech Computer Science', institution_name: 'Anna University' };
    document.querySelector('#question-answer').value = examples[serviceQuestions()[state.questionIndex].id];
    event.target.closest('button').textContent = 'âœ“ Voice demo captured';
  }
  if (action === 'fix-photo') { state.photoFixed = true; persist(); render(); }
  if (action === 'fix-signature') { state.signatureFixed = true; persist(); render(); }
  if (action === 'documents-next' && state.photoFixed && (!activeService().signatureRequirements || state.signatureFixed)) go('/applications/new/review');
  if (action === 'save-draft') { state.flash = 'Draft saved in this browser session.'; persist(); go('/dashboard'); }
  if (action === 'submit-application') {
    if (!Object.values(state.finalConsent).every(Boolean)) return;
    const now = new Date();
    const service = activeService();
    const adapter = SIMULATED_SERVICE_ADAPTERS[service.id];
    const payload = { serviceId: service.id, fields: service.fields, documents: service.documents, consent: true, preparedAt: now.toISOString() };
    const validation = adapter.validate(payload);
    if (!validation.valid) { state.flash = 'The simulated service adapter rejected an incomplete payload.'; render(); return; }
    const submission = adapter.submit(payload);
    const application = { id: submission.reference, service: service.service, submittedAt: now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }), updatedAt: now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }), status: 'Submitted', consentReceipt: `CONSENT-${now.getTime().toString().slice(-8)}`, integration: service.integration, documentsShared: service.documents.length };
    state.application = application;
    saveApplication(application);
    persist();
    go('/applications/new/success');
  }
  if (action === 'advance-status') {
    const statuses = ['Submitted', 'Under review', 'Approved'];
    const applicationId = decodeURIComponent(location.pathname.split('/').pop());
    const items = applicationHistory();
    const item = items.find((application) => application.id === applicationId);
    if (!item) return;
    item.status = statuses[Math.min(statuses.indexOf(item.status) + 1, statuses.length - 1)];
    item.updatedAt = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    localStorage.setItem('ekform-applications', JSON.stringify(items));
    state.application = item;
    persist();
    render();
  }
  if (action === 'download-receipt') {
    const application = state.application || applicationHistory()[0];
    const receipt = `EKFORM MOCK RECEIPT\n\nApplication ID: ${application.id}\nService: ${application.service}\nSubmitted: ${application.submittedAt}\nStatus: ${application.status}\nConsent receipt: ${application.consentReceipt}\nIntegration: SIMULATED\n`;
    const url = URL.createObjectURL(new Blob([receipt], { type: 'text/plain' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${application.id}-mock-receipt.txt`; anchor.click(); URL.revokeObjectURL(url);
  }
  if (action === 'delete-profile') { localStorage.removeItem('ekform-applications'); state = cloneDefault(); sessionStorage.removeItem('ekform-session'); go('/?signedOut=1'); }
  if (action === 'signout') completeSignout();
});

window.addEventListener('popstate', render);
render();
