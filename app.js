import './styles.css';

const app = document.querySelector('#app');

const icons = {
  arrow: '→',
  check: '✓',
  vault: '▦',
  file: '▤',
  shield: '◈'
};

function marketingPage() {
  return `
    <div class="marketing">
      <div class="announcement"><span>Built for simpler public services</span><a href="#how-it-works">See how EkForm works ${icons.arrow}</a><button class="announcement-close" aria-label="Close announcement">×</button></div>
      <header class="nav">
        <a href="#top" class="brand"><img class="brand-logo" src="/ekform-logo.png" alt="EkForm" /></a>
        <nav class="nav-links" aria-label="Primary navigation"><a href="#how-it-works">How it works</a><a href="#why-ekform">Why EkForm</a><a href="#privacy">Privacy</a><a href="#about">About</a></nav>
        <div class="nav-actions"><button class="nav-auth-link" data-auth>Sign in</button><button class="button button-primary button-small" data-start>Try EkForm ${icons.arrow}</button></div>
      </header>
      <main id="top">
        <section class="hero">
          <div class="hero-inner"><p class="eyebrow">CONSENT-BASED FORM FILLING</p><h1>One profile. Every public service. Made simple.</h1><p>EkForm turns your verified documents into a clearer application—wherever you live in India. Answer only what is missing, understand every request, and apply with confidence.</p><div class="hero-actions"><button class="button button-light" data-start>Prepare an application ${icons.arrow}</button><a class="button button-outline" href="#how-it-works">See how it works</a></div><div class="hero-note">A safe concept prototype using synthetic documents and mock services.</div></div>
        </section>
        <section class="section" id="why-ekform"><div class="section-inner section-grid"><div><p class="eyebrow">THE PROBLEM</p><h2>Government forms ask the same questions again and again.</h2><p>Names, addresses and documents are scattered across portals. EkForm brings the useful parts together, then puts the citizen back in control.</p><button class="button button-primary" data-start>Start with income certificate ${icons.arrow}</button></div><div class="product-card lavender"><div class="window-bar"><div class="window-dots"><span></span><span></span><span></span></div><span class="window-label">EkForm · Application prep</span><span>•••</span></div><div class="progress"><span class="active"></span><span class="active"></span><span></span><span></span></div><h3 class="card-title">Your application, prepared.</h3><p class="card-copy">We found 17 details across your connected documents. Review the sources before anything is shared.</p><div class="field-list"><div class="field"><strong>Applicant name</strong><small>${icons.check} Verified</small></div><div class="field"><strong>Current address</strong><small>${icons.check} Verified</small></div><div class="field missing"><strong>Annual family income</strong><small>Needs your answer</small></div></div><button class="button button-primary mock-button" data-start>Review 17 details ${icons.arrow}</button></div></div><div class="section-inner stats"><div class="stat"><div class="stat-number">14</div><div class="stat-label">fields filled from your vault</div></div><div class="stat"><div class="stat-number">3</div><div class="stat-label">questions left for you</div></div><div class="stat"><div class="stat-number">1</div><div class="stat-label">clear consent moment</div></div></div></section>
        <section class="section parchment" id="how-it-works"><div class="section-inner"><p class="eyebrow">HOW EKFORM WORKS</p><h2>A calmer way to complete public-service forms.</h2><div class="steps"><article class="step"><div class="step-number">01</div><h3>Connect a document vault</h3><p>Use a mock DigiLocker account for this prototype. EkForm only requests what the selected service needs.</p></article><article class="step"><div class="step-number">02</div><h3>Review what we found</h3><p>Every value shows its source. Conflicts are called out clearly instead of being silently overwritten.</p></article><article class="step"><div class="step-number">03</div><h3>Share with consent</h3><p>Answer the missing questions, check each field, and submit only after your final approval.</p></article></div></div></section>
        <section class="section dark-section" id="privacy"><div class="section-inner section-grid"><div class="product-card"><div class="window-bar"><div class="window-dots"><span></span><span></span><span></span></div><span class="window-label">Privacy by design</span><span>•••</span></div><div class="field-list"><div class="field"><strong>Required for this service</strong><small>${icons.check} 9 fields</small></div><div class="field"><strong>Optional profile detail</strong><small>Not shared</small></div><div class="field"><strong>Consent receipt</strong><small>${icons.check} Saved</small></div><div class="field"><strong>Access expires</strong><small>In 24 hours</small></div></div></div><div><p class="eyebrow">PRIVACY, MADE VISIBLE</p><h2>Nothing moves without your say-so.</h2><p>EkForm is designed around field-level consent, short-lived access and a clear record of what was shared. The AI helps explain and map forms; it never submits for you.</p><a class="button button-light" href="#about">Read our safety promise ${icons.arrow}</a></div></div></section>
        <section class="cta-band" id="about"><p class="eyebrow" style="color:var(--lavender)">ONE CITIZEN JOURNEY</p><h2>Fill less. Understand more. Apply with confidence.</h2><p>Try the Income Certificate flow with synthetic documents and see what a better public-service form could feel like.</p><button class="button button-light" data-start>Start the demo ${icons.arrow}</button></section>
      </main>
      <footer class="footer"><a href="#top" class="brand"><img class="brand-logo" src="/ekform-logo.png" alt="EkForm" /></a><div class="footer-links"><a href="#privacy">Privacy</a><a href="#how-it-works">How it works</a><span>Independent concept prototype</span></div></footer>
    </div>`;
}

function authPage() {
  return `<div class="auth-screen" id="auth-screen"><div class="auth-shell"><div class="auth-visual"><img class="auth-logo" src="/ekform-logo.png" alt="EkForm" /><div class="auth-visual-copy"><p class="eyebrow">A SIMPLER PUBLIC-SERVICE JOURNEY</p><h1>One profile.<br />More possibilities.</h1><p>Keep your verified details ready, then use them when a public-service application needs them.</p></div><div class="auth-visual-foot"><span>Private by design</span><span>·</span><span>Built for India</span></div></div><div class="auth-form-wrap"><button class="auth-back" data-public-home>← Back to homepage</button><div class="auth-form"><div class="auth-tabs" role="tablist"><button class="auth-tab active" data-auth-tab="signin" role="tab">Sign in</button><button class="auth-tab" data-auth-tab="signup" role="tab">Create account</button></div><p class="eyebrow" id="auth-eyebrow">WELCOME BACK</p><h2 id="auth-title">Sign in to EkForm</h2><p class="auth-copy" id="auth-copy">Use your demo profile to continue preparing an application.</p><form id="auth-form"><label class="auth-field"><span>Email or mobile number</span><input type="text" placeholder="name@example.com" autocomplete="off" /></label><label class="auth-field" id="auth-name-field" hidden><span>Your name</span><input type="text" placeholder="Kavya Sharma" autocomplete="off" /></label><label class="auth-field"><span>Demo password</span><input type="password" placeholder="••••••••" value="ekform-demo" autocomplete="off" /></label><button class="button button-primary auth-submit" type="submit">Continue to EkForm ${icons.arrow}</button></form><div class="auth-divider"><span>or</span></div><button class="button button-outline auth-demo" data-enter-home>Continue with demo account ${icons.arrow}</button><p class="auth-disclaimer">This is a prototype. No real credentials, OTPs or identity documents are collected.</p></div></div></div></div>`;
}

function dashboardPage() {
  return `<div class="dashboard" id="dashboard"><header class="dashboard-header"><a class="brand" href="#"><img class="brand-logo" src="/ekform-logo.png" alt="EkForm" /></a><div class="dashboard-header-actions"><span class="dashboard-status"><i></i> Demo profile active</span><button class="dashboard-avatar" data-logout aria-label="Sign out">KS</button></div></header><main class="dashboard-shell"><div class="dashboard-welcome"><div><p class="eyebrow">YOUR EKFORM HOME</p><h1>Good morning, Kavya.</h1><p>Pick up where you left off, or start a new public-service application.</p></div><button class="button button-primary" data-dashboard-start>Start an application ${icons.arrow}</button></div><div class="dashboard-grid"><section class="dashboard-main"><div class="dashboard-section-head"><h2>Your applications</h2><button class="text-button" data-dashboard-start>New application ${icons.arrow}</button></div><div class="application-card active-application"><div class="application-icon">▣</div><div class="application-info"><span class="application-kicker">IN PROGRESS</span><h3>Income Certificate</h3><p>14 of 17 details are ready from your document vault.</p><div class="application-progress"><span style="width:72%"></span></div></div><button class="button button-outline button-small" data-dashboard-start>Continue</button></div><div class="application-card"><div class="application-icon muted">◇</div><div class="application-info"><span class="application-kicker muted-text">COMING NEXT</span><h3>Scholarship application</h3><p>Reuse your profile and documents when you’re ready.</p></div><span class="application-arrow">→</span></div></section><aside class="dashboard-side"><div class="profile-card"><div class="profile-top"><div class="profile-avatar">KS</div><div><strong>Kavya Sharma</strong><span>Demo citizen profile</span></div><span class="verified-badge">${icons.check}</span></div><div class="profile-detail"><span>Document vault</span><strong>4 documents connected</strong></div><div class="profile-detail"><span>Profile completeness</span><strong>82%</strong></div><button class="button button-outline button-small profile-button">Manage profile ${icons.arrow}</button></div><div class="privacy-card"><div class="privacy-icon">${icons.shield}</div><div><strong>Your information stays yours.</strong><p>EkForm only shares fields you approve for a specific service.</p></div></div></aside></div></main></div>`;
}

function workspacePage() {
  return `<div class="workspace" id="workspace"><header class="app-header"><button class="back-link" data-home>← Back to EkForm</button><a class="brand" href="#"><img class="brand-logo" src="/ekform-logo.png" alt="EkForm" /></a><span class="app-title">Income Certificate application</span><select class="app-language" aria-label="Choose language"><option>English</option><option>हिंदी</option><option>தமிழ்</option></select></header><div class="app-shell"><div class="app-progress" id="app-progress"><div class="app-step current" data-step-dot="1"><i>1</i><span>Connect vault</span></div><div class="app-step" data-step-dot="2"><i>2</i><span>Choose service</span></div><div class="app-step" data-step-dot="3"><i>3</i><span>Complete details</span></div><div class="app-step" data-step-dot="4"><i>4</i><span>Review & consent</span></div><div class="app-step" data-step-dot="5"><i>5</i><span>Submitted</span></div></div><div id="app-panel" class="app-panel"></div></div></div>`;
}

app.innerHTML = authPage() + marketingPage() + dashboardPage() + workspacePage();
const auth = document.querySelector('.auth-screen');
const marketing = document.querySelector('.marketing');
const dashboard = document.querySelector('.dashboard');
const workspace = document.querySelector('.workspace');
const panel = document.querySelector('#app-panel');
let currentStep = 1;
let authenticated = false;
marketing.classList.add('hidden');
dashboard.classList.add('hidden');

// Reveal content as it enters the viewport, with a no-motion fallback for accessibility.
const motionTargets = document.querySelectorAll('.marketing .section, .marketing .cta-band, .marketing .stats, .marketing .step');
motionTargets.forEach((element) => element.classList.add('motion-target'));
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  motionTargets.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  motionTargets.forEach((element) => revealObserver.observe(element));
}

function setProgress(step) {
  currentStep = step;
  document.querySelectorAll('[data-step-dot]').forEach((dot) => {
    const n = Number(dot.dataset.stepDot);
    dot.classList.toggle('current', n === step);
    dot.classList.toggle('complete', n < step);
  });
}

function renderStep(step) {
  setProgress(step);
  const screens = {
    1: `<p class="eyebrow">STEP 1 OF 4 · YOUR INFORMATION</p><h1>Start with the details you already have.</h1><p>Connect your demo document vault so EkForm can prepare the application. No real identity documents are used here.</p><div class="vault-card"><div class="vault-icon">${icons.vault}</div><div><strong>Demo document vault</strong><span>4 synthetic documents ready to review</span></div><button class="button button-primary button-small" data-next>Connect vault ${icons.arrow}</button></div><div class="app-actions"><button class="button button-outline" data-home>Exit demo</button></div>`,
    2: `<p class="eyebrow">STEP 2 OF 4 · SELECT A SERVICE</p><h1>What do you need to apply for?</h1><p>EkForm will use this service’s requirements to map your information and prepare the right uploads.</p><div class="service-grid"><button class="service-card selected" data-service><div class="service-icon">▣</div><strong>Income Certificate</strong><span>For scholarships, admissions and government schemes · About 5 min</span></button><button class="service-card" disabled><div class="service-icon">◇</div><strong>Scholarship application</strong><span>Preview only · coming next</span></button></div><div class="app-actions"><button class="button button-primary" data-next>Prepare my form ${icons.arrow}</button><button class="button button-outline" data-prev>Back</button></div>`,
    3: `<p class="eyebrow">STEP 3 OF 4 · ONLY WHAT’S MISSING</p><h1>We found 14 details. You add 3.</h1><p>These answers are specific to your application and are not present in the connected documents.</p><div class="form-grid"><div class="form-field"><label for="income">Annual family income</label><input id="income" value="₹ 4,80,000" /></div><div class="form-field"><label for="occupation">Primary occupation</label><select id="occupation"><option>Software professional</option><option>Self-employed</option><option>Student</option><option>Other</option></select></div><div class="form-field full"><label for="reason">Why do you need this certificate?</label><input id="reason" value="For a higher-education scholarship" /><small>EkForm explains complex questions in plain language.</small></div></div><div class="upload-list" style="margin-top:24px"><div class="upload-item"><div class="file-icon">${icons.file}</div><div><strong>Identity document</strong><span>PDF · 640 KB · Name and date of birth matched</span></div><div class="upload-status">${icons.check} Ready</div></div><div class="upload-item"><div class="file-icon">${icons.file}</div><div><strong>Address certificate</strong><span>PDF · 1.2 MB · Current address matched</span></div><div class="upload-status">${icons.check} Ready</div></div><div class="upload-item"><div class="file-icon">◉</div><div><strong>Passport photograph</strong><span>380 KB · This service requires under 50 KB</span></div><button class="button button-outline button-small" data-fix>Fix for this form</button></div></div><div class="app-actions"><button class="button button-primary" data-next>Continue to review ${icons.arrow}</button><button class="button button-outline" data-prev>Back</button></div>`,
    4: `<p class="eyebrow">STEP 4 OF 4 · YOUR APPROVAL</p><h1>Check every value before it goes anywhere.</h1><p>EkForm will create a consent receipt for this application. You can change any answer before sharing.</p><div class="review-layout"><div class="review-list"><h3>Information to share</h3><div class="review-row"><label>Applicant name</label><strong>Kavya Sharma</strong><span class="source-tag">Identity document</span></div><div class="review-row"><label>Date of birth</label><strong>12 August 2002</strong><span class="source-tag">Identity document</span></div><div class="review-row"><label>Current address</label><strong>Chennai, Tamil Nadu</strong><span class="source-tag">Address certificate</span></div><div class="review-row"><label>Annual income</label><strong>₹ 4,80,000</strong><span class="source-tag ask">Your answer</span></div><div class="review-row"><label>Purpose</label><strong>Higher-education scholarship</strong><span class="source-tag ask">Your answer</span></div></div><div class="summary-card"><h3>Sharing summary</h3><div class="summary-item">9 required fields <em>Included</em></div><div class="summary-item">3 synthetic documents <em>Included</em></div><div class="summary-item">No Aadhaar/PAN sent to AI <em>Protected</em></div><div class="summary-item">Access expires in 24 hours <em>Limited</em></div></div></div><div class="consent-box" style="margin-top:18px"><label class="consent-row"><input type="checkbox" checked /> <span>I understand what EkForm will share for this application and approve the mock submission.</span></label><label class="consent-row"><input type="checkbox" checked /> <span>Save a consent receipt so I can see exactly what was shared.</span></label></div><div class="app-actions"><button class="button button-primary" data-submit>Approve & submit demo ${icons.arrow}</button><button class="button button-outline" data-prev>Back</button></div>`,
    5: `<div class="success"><div class="success-mark">${icons.check}</div><p class="eyebrow">APPLICATION SUBMITTED</p><h1>You’re all set, Kavya.</h1><p>Your Income Certificate application was submitted to the EkForm demo service. In a real deployment, this step would connect to an approved department integration.</p><div class="receipt"><div class="receipt-line"><span>Acknowledgement number</span><strong>EKF-2026-8X4K</strong></div><div class="receipt-line"><span>Submitted on</span><strong>29 August 2026</strong></div><div class="receipt-line"><span>Consent receipt</span><strong>Saved securely</strong></div><div class="receipt-line"><span>Next step</span><strong>Review by department</strong></div></div><button class="button button-primary" data-home>Return to EkForm ${icons.arrow}</button></div>`
  };
  panel.innerHTML = screens[step];
  panel.classList.remove('panel-enter');
  requestAnimationFrame(() => panel.classList.add('panel-enter'));
}

function start() {
  auth.classList.add('hidden');
  marketing.classList.add('hidden');
  dashboard.classList.add('hidden');
  workspace.classList.add('active');
  renderStep(1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function home() {
  auth.classList.add('hidden');
  workspace.classList.remove('active');
  dashboard.classList.toggle('hidden', !authenticated);
  marketing.classList.toggle('hidden', authenticated);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function enterHome() {
  authenticated = true;
  auth.classList.add('hidden');
  workspace.classList.remove('active');
  marketing.classList.add('hidden');
  dashboard.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function publicHome() {
  authenticated = false;
  auth.classList.add('hidden');
  dashboard.classList.add('hidden');
  workspace.classList.remove('active');
  marketing.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-start], [data-next], [data-prev], [data-home], [data-submit], [data-fix], [data-auth], [data-enter-home], [data-public-home], [data-auth-tab], [data-dashboard-start], [data-logout], .announcement-close');
  if (!target) return;
  if (target.matches('[data-start]')) start();
  if (target.matches('[data-home]')) home();
  if (target.matches('.announcement-close')) publicHome();
  if (target.matches('[data-auth]')) {
    auth.classList.remove('hidden');
    marketing.classList.add('hidden');
    workspace.classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (target.matches('[data-enter-home]')) enterHome();
  if (target.matches('[data-public-home]')) publicHome();
  if (target.matches('[data-dashboard-start]')) start();
  if (target.matches('[data-logout]')) publicHome();
  if (target.matches('[data-auth-tab]')) {
    const signup = target.dataset.authTab === 'signup';
    document.querySelectorAll('[data-auth-tab]').forEach((tab) => tab.classList.toggle('active', tab === target));
    document.querySelector('#auth-eyebrow').textContent = signup ? 'NEW TO EKFORM' : 'WELCOME BACK';
    document.querySelector('#auth-title').textContent = signup ? 'Create your EkForm profile' : 'Sign in to EkForm';
    document.querySelector('#auth-copy').textContent = signup ? 'Save your reusable details and make your next application simpler.' : 'Use your demo profile to continue preparing an application.';
    document.querySelector('#auth-name-field').hidden = !signup;
    document.querySelector('.auth-submit').innerHTML = signup ? `Create demo profile ${icons.arrow}` : `Continue to EkForm ${icons.arrow}`;
  }
  if (target.matches('[data-next]')) renderStep(Math.min(currentStep + 1, 5));
  if (target.matches('[data-prev]')) renderStep(Math.max(currentStep - 1, 1));
  if (target.matches('[data-submit]')) renderStep(5);
  if (target.matches('[data-fix]')) {
    target.textContent = 'Fixed ✓';
    target.classList.remove('button-outline');
    target.classList.add('button-primary');
    target.closest('.upload-item').querySelector('.upload-item span');
    const details = target.closest('.upload-item').querySelector('span');
    details.textContent = 'JPEG · 47 KB · 413 × 531 px · Ready to share';
    target.closest('.upload-item').querySelector('.upload-status')?.remove();
  }
});

document.querySelector('#auth-form').addEventListener('submit', (event) => {
  event.preventDefault();
  enterHome();
});
