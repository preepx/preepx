const fs = require('fs');

// 1. Update CreateJob.jsx
let cj = fs.readFileSync('frontend/src/pages/recruiter/CreateJob.jsx', 'utf8');
const cjTarget = '<div style={{ background: "var(--primary-light)", border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)", borderRadius: 8, padding: 20, marginBottom: 24 }}>';

if (cj.includes(cjTarget)) {
  cj = cj.replace(cjTarget, '<div className="rx-ai-autofill-banner">');
  cj = cj.replace('<Sparkles size={20} color="var(--primary)" />', '<Sparkles size={20} className="rx-ai-autofill-icon" />');
  cj = cj.replace('<h3 style={{ margin: 0, color: "var(--primary)" }}>AI Job Auto-Fill</h3>', '<h3 className="rx-ai-autofill-title">AI Job Auto-Fill</h3>');
  cj = cj.replace('<p style={{ margin: "0 0 16px 0", fontSize: 13, color: "var(--text-muted)" }}>', '<p className="rx-ai-autofill-desc">');
  fs.writeFileSync('frontend/src/pages/recruiter/CreateJob.jsx', cj, 'utf8');
  console.log('Updated CreateJob.jsx');
} else {
  console.log('CreateJob target not found');
}

// 2. Update RecruiterLayout.jsx
let rl = fs.readFileSync('frontend/src/layouts/RecruiterLayout.jsx', 'utf8');
if (rl.includes("color: companyStatus === 'PENDING' ? '#22c55e' : '#f59e0b'")) {
  rl = rl.replace("color: companyStatus === 'PENDING' ? '#22c55e' : '#f59e0b'", "color: companyStatus === 'PENDING' ? '#0284c7' : '#f59e0b'");
  fs.writeFileSync('frontend/src/layouts/RecruiterLayout.jsx', rl, 'utf8');
  console.log('Updated RecruiterLayout.jsx');
}

// 3. Update RecruiterLayout.css
let rlc = fs.readFileSync('frontend/src/styles/RecruiterLayout.css', 'utf8');

// Update .rx-root to define Sky Blue variables
const rxRootTarget = '.rx-root {\r\n  display: flex;';
const rxRootTargetLF = '.rx-root {\n  display: flex;';
const rxRootReplace = `.rx-root {
  --primary: #0284c7;
  --primary-light: #f0f9ff;
  --primary-dark: #0369a1;
  --primary-border: #bae6fd;
  --accent: #38bdf8;
  display: flex;`;

if (rlc.includes(rxRootTarget)) {
  rlc = rlc.replace(rxRootTarget, rxRootReplace.replace(/\n/g, '\r\n'));
} else if (rlc.includes(rxRootTargetLF)) {
  rlc = rlc.replace(rxRootTargetLF, rxRootReplace);
}

// Update .rx-form-section-icon
const iconTarget = `.rx-form-section-icon {
  color: var(--primary);
  background: color-mix(in srgb, var(--primary) 10%, transparent);`;
const iconReplace = `.rx-form-section-icon {
  color: #0284c7;
  background: #e0f2fe;`;

if (rlc.includes(iconTarget.replace(/\n/g, '\r\n'))) {
  rlc = rlc.replace(iconTarget.replace(/\n/g, '\r\n'), iconReplace.replace(/\n/g, '\r\n'));
} else if (rlc.includes(iconTarget)) {
  rlc = rlc.replace(iconTarget, iconReplace);
}

// Add .rx-ai-autofill-banner styles if not present
if (!rlc.includes('.rx-ai-autofill-banner')) {
  const bannerCss = `
/* Sky Blue AI Auto-Fill Section Banner */
.rx-ai-autofill-banner {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

[data-theme="dark"] .rx-ai-autofill-banner {
  background: rgba(14, 165, 233, 0.1);
  border-color: rgba(56, 189, 248, 0.25);
}

.rx-ai-autofill-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.rx-ai-autofill-icon {
  color: #0284c7;
}

.rx-ai-autofill-title {
  margin: 0;
  color: #0284c7;
  font-size: 16px;
  font-weight: 700;
}

.rx-ai-autofill-desc {
  margin: 0 0 16px 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
}
`;
  rlc += bannerCss;
}

fs.writeFileSync('frontend/src/styles/RecruiterLayout.css', rlc, 'utf8');
console.log('Updated RecruiterLayout.css');

