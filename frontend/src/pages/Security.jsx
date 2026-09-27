import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "@/styles/UserGuide.css"; // Reusing the layout styles

export default function Security() {
  useEffect(() => {
    document.title = "Security | PreepX";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="user-guide-page">
      <header className="guide-hero" style={{ paddingBottom: '60px' }}>
        <h1>Security at PreepX</h1>
        <p className="guide-hero-sub">
          Security is built into how we design, develop, deploy and operate PreepX.
        </p>
        <p style={{ maxWidth: '700px', margin: '20px auto 0', color: '#e0f2fe', lineHeight: '1.6', fontSize: '15px' }}>
          PreepX is designed to protect the information entrusted to our platform while providing candidates and recruiters with a secure environment for interview preparation, assessments, job applications and hiring workflows.
        </p>
        <div style={{ marginTop: '20px', color: '#bae6fd', fontSize: '13px' }}>
          Security is an ongoing process. We continuously review and improve our platform, infrastructure and security practices.
        </div>
      </header>

      <div className="guide-container">
        <main className="guide-content" style={{ paddingBottom: '60px' }}>
          
          <section id="at-a-glance" className="guide-section-block">
            <h2>Security at a Glance</h2>
            <div className="guide-feature-grid">
              <div className="guide-feature-card">
                <h3>Secure Authentication</h3>
                <p>Protecting account access through authentication and authorization controls.</p>
              </div>
              <div className="guide-feature-card">
                <h3>Data Protection</h3>
                <p>Applying appropriate safeguards to personal, professional and platform data.</p>
              </div>
              <div className="guide-feature-card">
                <h3>Access Control</h3>
                <p>Limiting access to systems and information based on required permissions.</p>
              </div>
              <div className="guide-feature-card">
                <h3>Secure Infrastructure</h3>
                <p>Using controlled cloud infrastructure and deployment practices to support platform reliability and security.</p>
              </div>
              <div className="guide-feature-card">
                <h3>Monitoring & Logging</h3>
                <p>Monitoring platform activity and system behavior to help identify operational and security issues.</p>
              </div>
              <div className="guide-feature-card">
                <h3>Continuous Improvement</h3>
                <p>Regularly reviewing the platform to identify and address security risks.</p>
              </div>
            </div>
          </section>

          <section id="protecting-data" className="guide-section-block">
            <h2>Protecting the Data You Trust Us With</h2>
            <p>PreepX may process different categories of information depending on the features a user uses.</p>
            <h3 className="guide-subheading">Candidate-related information may include:</h3>
            <ul className="guide-bullet-list">
              <li>Account information</li>
              <li>Profile information</li>
              <li>Resume/CV</li>
              <li>Skills and experience</li>
              <li>Interview responses</li>
              <li>Interview transcripts</li>
              <li>Voice/audio data where applicable</li>
              <li>Assessment answers</li>
              <li>Coding submissions</li>
              <li>Performance results</li>
              <li>Job application information</li>
            </ul>
            <h3 className="guide-subheading">Recruiter-related information may include:</h3>
            <ul className="guide-bullet-list">
              <li>Account information</li>
              <li>Company information</li>
              <li>Job postings</li>
              <li>Assessment configurations</li>
              <li>Candidate evaluation data</li>
              <li>Hiring workflow information</li>
            </ul>
            <p>We apply appropriate technical and organizational safeguards to protect information against unauthorized access, misuse, alteration, disclosure and loss.</p>
          </section>

          <section id="account-security" className="guide-section-block">
            <h2>Account Security</h2>
            <p>PreepX uses authentication and authorization mechanisms to help ensure users can access only the features and information they are permitted to access. This includes secure authentication, authorization checks, session management, password/credential protection, and protection against unauthorized account access.</p>
            <p>Candidate and recruiter accounts have appropriate access boundaries to ensure isolation of workflows and profiles.</p>
            <p>Users are also responsible for protecting their account credentials and notifying PreepX if they believe their account has been compromised.</p>
          </section>

          <section id="access-control" className="guide-section-block">
            <h2>Access Control</h2>
            <p>PreepX separates access based on user roles and permissions where applicable.</p>
            <ul className="guide-bullet-list">
              <li><strong>Candidate:</strong> Access to own profile, interviews, assessments, performance, and applications.</li>
              <li><strong>Recruiter:</strong> Access to recruiter/company profile, recruiter-created assessments, authorized candidate information, and hiring workflow information.</li>
              <li><strong>Platform/Admin:</strong> Restricted administrative access.</li>
            </ul>
            <p>Access to sensitive systems and information is restricted according to operational requirements and permissions.</p>
          </section>

          <section id="encryption" className="guide-section-block">
            <h2>Encryption & Secure Transmission</h2>
            <p>PreepX uses secure communication protocols to protect data transmitted between users and the platform where implemented. Data transmitted between supported clients and PreepX services is protected using HTTPS/TLS.</p>
            <p>Where appropriate, sensitive information may be protected using encryption or other security controls at rest.</p>
          </section>

          <section id="document-security" className="guide-section-block">
            <h2>Resume & Document Security</h2>
            <p>Users may upload resumes, documents or other career-related information. PreepX takes measures to:</p>
            <ul className="guide-bullet-list">
              <li>Restrict unauthorized access</li>
              <li>Validate uploads where applicable</li>
              <li>Process documents through controlled services</li>
              <li>Limit access according to permissions</li>
              <li>Protect stored document metadata</li>
              <li>Remove data according to applicable retention/deletion practices</li>
            </ul>
            <p>Document processing may involve third-party infrastructure or AI/document-processing providers where applicable.</p>
          </section>

          <section id="ai-security" className="guide-section-block">
            <h2>AI & Interview Data</h2>
            <p>PreepX uses AI-powered functionality for interview preparation and evaluation. Depending on the feature, PreepX may process interview questions, text responses, voice/audio, transcripts, technical answers, HR/behavioral responses, AI-generated feedback, and performance metrics.</p>
            <p>Access to interview-related information is controlled according to the purpose for which the data is processed. AI-generated analysis is processed to provide the requested interview preparation and performance insights.</p>
            <p>Where third-party AI or processing providers are used, information may be processed by those providers as necessary to provide the requested functionality and subject to applicable contractual and privacy safeguards.</p>
          </section>

          <section id="assessment-security" className="guide-section-block">
            <h2>Assessment & Coding Security</h2>
            <p>PreepX supports objective assessments and coding practice. Security considerations include controlled assessment access, candidate authentication, assessment permissions, time and attempt controls where applicable, server-side validation, secure API communication, and protection against unauthorized assessment manipulation.</p>
            <p>Users must not attempt to manipulate assessment results, bypass restrictions, exploit assessment systems, access other candidates' submissions, or attack code execution infrastructure.</p>
          </section>

          <section id="recruiter-data-security" className="guide-section-block">
            <h2>Recruiter & Hiring Data</h2>
            <p>Recruiters may process candidate information through PreepX. PreepX aims to ensure that recruiter users can access only the candidate and hiring information available to them through their authorized workflows (such as candidate invitations, assessment results, candidate scorecards, shortlisting, and interview scheduling).</p>
            <p>Recruiters are responsible for handling candidate information lawfully and securely.</p>
          </section>

          <section id="job-application-security" className="guide-section-block">
            <h2>Job Application Security</h2>
            <p>When candidates apply for jobs, relevant information may be shared with the recruiter/employer associated with that opportunity. PreepX protects the transmission and handling of information within its platform using appropriate security controls.</p>
            <p>Once information is provided to a third-party employer/recruiter, that organization's own privacy and security practices may also apply. Read our <Link to="/privacy-policy" style={{ color: '#0284c7', fontWeight: '600', textDecoration: 'none' }}>Privacy Policy</Link> for more details.</p>
          </section>

          <section id="api-security" className="guide-section-block">
            <h2>Application & API Security</h2>
            <p>PreepX follows secure development practices around its web applications and APIs. Potential controls include authentication, authorization, input validation, request validation, secure API endpoints, error handling, logging, dependency updates, and security patches.</p>
            <p>We design and review application behavior with common web security risks in mind.</p>
          </section>

          <section id="infrastructure-security" className="guide-section-block">
            <h2>Cloud & Infrastructure Security</h2>
            <p>PreepX uses cloud infrastructure to operate its services. We apply controlled infrastructure access, environment separation where applicable, secure deployment processes, restricted administrative access, monitoring, logging, security updates, and infrastructure configuration management.</p>
          </section>

          <section id="secure-development" className="guide-section-block">
            <h2>Secure Development</h2>
            <p>Security is considered during architecture, development, code review, dependency management, testing, deployment, and maintenance.</p>
            <p>Security issues identified during development or operation are evaluated and addressed according to their severity and impact.</p>
          </section>

          <section id="secrets" className="guide-section-block">
            <h2>Secrets & Credentials</h2>
            <p>Application secrets and service credentials should not be exposed through frontend code, public repositories, client-side configuration, logs, or public APIs.</p>
            <p>Production credentials and service secrets are managed through controlled configuration mechanisms rather than being exposed directly in client-side application code.</p>
          </section>

          <section id="monitoring-logging" className="guide-section-block">
            <h2>Monitoring & Logging</h2>
            <p>PreepX may maintain logs and operational telemetry to detect failures, investigate incidents, troubleshoot services, monitor performance, detect suspicious activity, and improve reliability.</p>
            <p>Access to logs is restricted according to operational requirements.</p>
          </section>

          <section id="backups" className="guide-section-block">
            <h2>Backups & Recovery</h2>
            <p>Where backup systems are used, PreepX applies appropriate access controls and safeguards to help protect backup data.</p>
          </section>

          <section id="third-party" className="guide-section-block">
            <h2>Third-Party Services</h2>
            <p>PreepX may rely on third-party providers for certain services, such as cloud infrastructure, AI processing, payment processing, email, authentication, analytics, document processing, and communication.</p>
            <p>We evaluate third-party services based on their relevance to the service, security requirements and applicable contractual or operational considerations.</p>
          </section>

          <section id="payment-security" className="guide-section-block">
            <h2>Payment Security</h2>
            <p>Paid PreepX services may involve coins, subscriptions, premium services, or other paid features.</p>
            <p>Payment transactions may be processed through third-party payment providers. Payment providers may handle payment credentials according to their own security and privacy practices. PreepX only processes the payment information required for transaction management.</p>
          </section>

          <section id="privacy-security" className="guide-section-block">
            <h2>Privacy & Security</h2>
            <p>Security protects the systems and information we operate. Privacy governs how personal information is collected, used, shared and retained. For more details, <Link to="/privacy-policy" style={{ color: '#0284c7', fontWeight: '600', textDecoration: 'none' }}>Read Privacy Policy</Link> and <Link to="/terms-of-service" style={{ color: '#0284c7', fontWeight: '600', textDecoration: 'none' }}>Read Terms of Service</Link>.</p>
          </section>

          <section id="incident-response" className="guide-section-block">
            <h2>Security Incident Response</h2>
            <p>PreepX maintains processes for responding to suspected security incidents:</p>
            <ul className="guide-bullet-list">
              <li><strong>01 — Detect:</strong> Identify suspicious activity or security events.</li>
              <li><strong>02 — Assess:</strong> Determine scope, impact and severity.</li>
              <li><strong>03 — Contain:</strong> Take steps to limit further impact.</li>
              <li><strong>04 — Remediate:</strong> Address the underlying issue and restore affected services.</li>
              <li><strong>05 — Review:</strong> Identify improvements to prevent similar incidents.</li>
              <li><strong>06 — Notify:</strong> Provide notifications where required by applicable law or contractual obligations.</li>
            </ul>
          </section>

          <section id="responsible-disclosure" className="guide-section-block">
            <h2>Report a Security Vulnerability</h2>
            <p>If you believe you have discovered a security vulnerability in PreepX, please report it responsibly so our team can investigate and address it.</p>
            <p>When reporting a vulnerability, please provide enough information for our team to reproduce and investigate the issue.</p>
            <ul className="guide-bullet-list" style={{ listStyle: 'none', paddingLeft: 0 }}>
              <li><strong>Security Email:</strong> <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@preepx.in" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none' }}>contact@preepx.in</a></li>
            </ul>
          </section>

          <section id="researcher-guidelines" className="guide-section-block">
            <h2>Responsible Security Testing</h2>
            <p>Security researchers should:</p>
            <ul className="guide-bullet-list">
              <li>Avoid accessing other users' data</li>
              <li>Avoid disrupting services</li>
              <li>Avoid destructive testing</li>
              <li>Avoid denial-of-service testing</li>
              <li>Avoid social engineering PreepX employees</li>
              <li>Avoid spam</li>
              <li>Report findings privately</li>
              <li>Provide reproducible technical details</li>
              <li>Allow reasonable time for remediation</li>
            </ul>
          </section>

          <section id="user-responsibilities" className="guide-section-block">
            <h2>Your Role in Security</h2>
            <p>Security is a shared responsibility between PreepX, our service providers and our users. Users should:</p>
            <ul className="guide-bullet-list">
              <li>Keep credentials private and use strong passwords</li>
              <li>Avoid sharing account credentials</li>
              <li>Keep devices and browsers updated</li>
              <li>Report suspicious activity</li>
              <li>Avoid uploading unnecessary sensitive information</li>
              <li>Follow assessment rules and avoid attempting unauthorized access</li>
            </ul>
          </section>

          <section id="limitations" className="guide-section-block">
            <h2>No System Is Completely Secure</h2>
            <p>While PreepX takes reasonable measures to protect information and services, no internet-based service, transmission method or storage system can be guaranteed to be completely secure.</p>
          </section>

          <section id="security-updates" className="guide-section-block">
            <h2>Continuous Security Improvement</h2>
            <p>PreepX may continuously improve application security, infrastructure security, authentication, monitoring, access controls, data protection, and incident response. As the platform evolves, security practices may also change.</p>
          </section>

          <section id="contact-security" className="guide-section-block">
            <h2>Contact PreepX Security</h2>
            <p>For security-related questions or to report a potential vulnerability, contact our security team.</p>
            <ul className="guide-bullet-list" style={{ listStyle: 'none', paddingLeft: 0 }}>
              <li><strong>Security Email:</strong> <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@preepx.in" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none' }}>contact@preepx.in</a></li>
              <li><strong>Privacy Email:</strong> <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@preepx.in" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none' }}>contact@preepx.in</a></li>
              <li><strong>Support:</strong> <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@preepx.in" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none' }}>contact@preepx.in</a></li>
            </ul>
          </section>

          <div style={{ marginTop: '60px', paddingTop: '20px', borderTop: '1px solid var(--hpw-border-light)', fontSize: '13px', color: 'var(--hpw-text-muted)', textAlign: 'center' }}>
            <p>This Security page is provided for informational purposes only and does not constitute a legally binding agreement.</p>
          </div>

        </main>
      </div>
    </div>
  );
}
