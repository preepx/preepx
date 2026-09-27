import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "@/styles/UserGuide.css"; // Reusing the layout styles

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy | PreepX";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="user-guide-page">
      <header className="guide-hero" style={{ paddingBottom: '60px' }}>
        <h1>Privacy Policy</h1>
        <p className="guide-hero-sub">
          Your privacy matters to us. This Privacy Policy explains how PreepX collects, uses, stores and protects your information when you use our platform and services.
        </p>
        <div style={{ marginTop: '20px', color: '#bae6fd', fontSize: '15px' }}>
          <strong>Last Updated:</strong> October 2026
        </div>
        <p style={{ maxWidth: '700px', margin: '20px auto 0', color: '#e0f2fe', lineHeight: '1.6', fontSize: '15px' }}>
          By accessing or using PreepX, you acknowledge that you have read and understood this Privacy Policy.
        </p>
      </header>

      <div className="guide-container">
        <main className="guide-content" style={{ paddingBottom: '60px' }}>
          <section id="introduction" className="guide-section-block">
            <h2>Introduction</h2>
            <p>PreepX is an interview preparation, assessment, coding practice, career opportunity and recruiter hiring platform.</p>
            <p>This Privacy Policy explains how information may be collected and processed when users:</p>
            <ul className="guide-bullet-list">
              <li>visit the PreepX website</li>
              <li>create an account</li>
              <li>use candidate features</li>
              <li>use AI mock interviews</li>
              <li>participate in assessments</li>
              <li>submit coding solutions</li>
              <li>upload resumes/documents</li>
              <li>apply for jobs</li>
              <li>use recruiter functionality</li>
              <li>create assessments</li>
              <li>invite candidates</li>
              <li>purchase coins/subscriptions</li>
              <li>contact PreepX</li>
              <li>otherwise interact with PreepX services</li>
            </ul>
          </section>

          <section id="information-collected" className="guide-section-block">
            <h2>Information We Collect</h2>
            
            <h3 className="guide-subheading">A. Account and Identity Information</h3>
            <p>Depending on the features you use, we may collect:</p>
            <ul className="guide-bullet-list">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number, if provided</li>
              <li>Profile photo, if provided</li>
              <li>Login credentials/authentication information</li>
              <li>Account type</li>
              <li>Candidate/recruiter profile information</li>
            </ul>

            <h3 className="guide-subheading">B. Professional and Career Information</h3>
            <p>Potential information may include:</p>
            <ul className="guide-bullet-list">
              <li>Resume/CV</li>
              <li>Education</li>
              <li>Skills</li>
              <li>Work experience</li>
              <li>Job preferences</li>
              <li>Career interests</li>
              <li>Professional profile information</li>
              <li>Portfolio links</li>
              <li>GitHub/LinkedIn or other links when voluntarily provided</li>
              <li>Certifications</li>
              <li>Assessment history</li>
              <li>Interview preparation information</li>
            </ul>
            <p>This information may be used to provide candidate-facing services and, where applicable, support job applications.</p>

            <h3 className="guide-subheading">C. Interview and AI Data</h3>
            <p>Because PreepX provides AI mock interviews, depending on the feature used, PreepX may process:</p>
            <ul className="guide-bullet-list">
              <li>Interview questions</li>
              <li>User responses</li>
              <li>Text answers</li>
              <li>Voice/audio input</li>
              <li>Interview transcripts</li>
              <li>AI-generated feedback</li>
              <li>Interview scores</li>
              <li>Performance metrics</li>
              <li>Communication-related evaluation data</li>
              <li>Technical interview responses</li>
            </ul>
            <p>AI-generated analysis may be based on the information submitted during an interview.</p>

            <h3 className="guide-subheading">D. Assessment and Coding Information</h3>
            <p>PreepX may collect/process:</p>
            <ul className="guide-bullet-list">
              <li>Assessment attempts</li>
              <li>Questions presented</li>
              <li>Answers submitted</li>
              <li>Scores</li>
              <li>Coding submissions</li>
              <li>Programming language used</li>
              <li>Test results</li>
              <li>Execution results</li>
              <li>Time taken</li>
              <li>Assessment completion status</li>
              <li>Proctoring-related information where applicable</li>
            </ul>
            <p>Recruiter-created assessments may involve sharing relevant candidate performance information with the recruiter who created or administers the assessment.</p>

            <h3 className="guide-subheading">E. Job Application Information</h3>
            <p>When candidates apply for jobs through PreepX, information may include:</p>
            <ul className="guide-bullet-list">
              <li>Candidate profile</li>
              <li>Resume</li>
              <li>Skills</li>
              <li>Experience</li>
              <li>Assessment results</li>
              <li>Relevant performance information</li>
              <li>Application information</li>
              <li>Information voluntarily provided during the application</li>
            </ul>
            <p>Relevant information may be shared with the recruiter/employer associated with the job application.</p>

            <h3 className="guide-subheading">F. Recruiter Information</h3>
            <p>For recruiters/company users, information may include:</p>
            <ul className="guide-bullet-list">
              <li>Name</li>
              <li>Work email</li>
              <li>Company name</li>
              <li>Job title/role</li>
              <li>Company profile information</li>
              <li>Job postings</li>
              <li>Assessment configuration</li>
              <li>Candidate evaluation activity</li>
              <li>Hiring workflow information</li>
              <li>Communications with candidates</li>
            </ul>

            <h3 className="guide-subheading">G. Payment and Transaction Information</h3>
            <p>When users purchase paid services, PreepX may process:</p>
            <ul className="guide-bullet-list">
              <li>Transaction details</li>
              <li>Purchase information</li>
              <li>Subscription information</li>
              <li>Coins/credits purchased</li>
              <li>Payment status</li>
              <li>Billing information where applicable</li>
            </ul>
            <p>Payment providers may process payment information according to their own privacy policies.</p>
          </section>

          <section id="automatically-collected" className="guide-section-block">
            <h2>Automatically Collected Information</h2>
            <p>PreepX may automatically collect technical and usage information such as:</p>
            <ul className="guide-bullet-list">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Device type</li>
              <li>Operating system</li>
              <li>Approximate location derived from IP where applicable</li>
              <li>Pages visited</li>
              <li>Features used</li>
              <li>Session information</li>
              <li>Date/time of activity</li>
              <li>Referral/source information</li>
              <li>Error logs</li>
              <li>Performance information</li>
            </ul>
            <p>This information may be used for security, fraud prevention, debugging, analytics, platform improvement, performance monitoring, and service reliability.</p>
          </section>

          <section id="cookies" className="guide-section-block">
            <h2>Cookies and Tracking Technologies</h2>
            <p>PreepX may use:</p>
            <ul className="guide-bullet-list">
              <li>Cookies</li>
              <li>Session cookies</li>
              <li>Persistent cookies</li>
              <li>Local storage</li>
              <li>Similar technologies</li>
              <li>Analytics technologies</li>
            </ul>
            <p>Purposes may include authentication, keeping users signed in, remembering preferences, security, understanding website usage, measuring performance, and improving the platform.</p>
            <p>Some third-party services integrated into PreepX may also use cookies or similar technologies. Their use of such technologies is governed by their own policies.</p>
          </section>

          <section id="how-we-use" className="guide-section-block">
            <h2>How We Use Your Information</h2>
            <p>PreepX may use information to:</p>
            <ul className="guide-bullet-list">
              <li>Create and manage accounts</li>
              <li>Provide interview preparation services</li>
              <li>Conduct AI mock interviews</li>
              <li>Generate interview feedback</li>
              <li>Provide assessments</li>
              <li>Evaluate coding submissions</li>
              <li>Track performance</li>
              <li>Provide certificates and achievements</li>
              <li>Maintain leaderboards where applicable</li>
              <li>Provide job opportunities</li>
              <li>Process job applications</li>
              <li>Connect candidates with recruiters</li>
              <li>Provide recruiter assessment tools</li>
              <li>Manage candidate invitations</li>
              <li>Support candidate evaluation</li>
              <li>Process payments</li>
              <li>Provide customer support</li>
              <li>Communicate service updates</li>
              <li>Detect fraud and abuse</li>
              <li>Protect platform security</li>
              <li>Troubleshoot technical issues</li>
              <li>Analyze platform performance</li>
              <li>Improve features</li>
              <li>Develop new products/services</li>
              <li>Comply with applicable law</li>
              <li>Enforce our Terms of Service</li>
            </ul>
          </section>

          <section id="ai-processing" className="guide-section-block">
            <h2>AI and Automated Processing</h2>
            <p>PreepX may use AI and automated systems to:</p>
            <ul className="guide-bullet-list">
              <li>Conduct mock interviews</li>
              <li>Generate interview questions</li>
              <li>Ask follow-up questions</li>
              <li>Analyze responses</li>
              <li>Generate feedback</li>
              <li>Generate performance insights</li>
              <li>Support assessment workflows</li>
              <li>Assist recruiters with candidate evaluation where applicable</li>
            </ul>
            <p>AI-generated feedback and analysis are intended to support preparation and evaluation workflows and should not be treated as guaranteed professional, employment or career advice. Automated outputs may not always be accurate.</p>
          </section>

          <section id="sharing" className="guide-section-block">
            <h2>How We Share Information</h2>
            <p>PreepX does not sell personal information simply as a business model.</p>
            <h3 className="guide-subheading">A. With Recruiters / Employers</h3>
            <p>When a candidate applies for a job, participates in a recruiter-created assessment, accepts an invitation, or otherwise interacts with a recruiter workflow, relevant candidate information may be shared with the applicable recruiter/employer.</p>

            <h3 className="guide-subheading">B. Service Providers</h3>
            <p>PreepX may use third-party providers for cloud hosting, database infrastructure, AI processing, payment processing, email delivery, authentication, analytics, error monitoring, communication, security, and file/document processing. These providers process information on behalf of PreepX as applicable.</p>

            <h3 className="guide-subheading">C. Legal Requirements</h3>
            <p>Information may be disclosed where reasonably necessary to comply with law, respond to lawful requests, protect users, protect PreepX, investigate fraud, enforce legal agreements, or address security threats.</p>

            <h3 className="guide-subheading">D. Business Transfers</h3>
            <p>In connection with a merger, acquisition, financing, restructuring, sale of assets, or similar corporate transactions, information may be transferred subject to applicable law.</p>
          </section>

          <section id="third-party" className="guide-section-block">
            <h2>Third-Party Services</h2>
            <p>PreepX may integrate with third-party services such as AI providers, Cloud providers, Payment providers, Authentication providers, Analytics providers, Communication providers, and Recruitment/job services.</p>
            <p>Third-party services may process information according to their own privacy policies.</p>
          </section>

          <section id="retention" className="guide-section-block">
            <h2>Data Retention</h2>
            <p>We retain personal information for as long as reasonably necessary to provide the Services, fulfill the purposes described in this Privacy Policy, comply with legal and regulatory obligations, resolve disputes, enforce agreements, maintain security, and protect our legitimate business interests.</p>
            <p>Retention may depend on the type of information, purpose of collection, whether the account remains active, legal obligations, security requirements, dispute resolution, and fraud prevention.</p>
            <p>When information is no longer required, PreepX may delete, anonymize or securely dispose of it subject to applicable legal requirements.</p>
          </section>

          <section id="security" className="guide-section-block">
            <h2>Data Security</h2>
            <p>PreepX uses reasonable technical and organizational measures designed to protect personal information, which may include access controls, authentication, secure infrastructure, monitoring, logging, and limited access to personal information.</p>
            <p>No method of transmission or storage is completely secure, and PreepX cannot guarantee absolute security.</p>
          </section>

          <section id="rights" className="guide-section-block">
            <h2>User Rights and Choices</h2>
            <p>Depending on applicable law, users may have rights to:</p>
            <ul className="guide-bullet-list">
              <li>Access personal information</li>
              <li>Correct inaccurate information</li>
              <li>Update profile information</li>
              <li>Request deletion</li>
              <li>Request restriction of certain processing</li>
              <li>Object to certain processing where applicable</li>
              <li>Withdraw consent where processing is based on consent</li>
              <li>Request information about processing</li>
              <li>Raise a privacy complaint</li>
            </ul>
            <p>Some requests may be subject to legal limitations.</p>
          </section>

          <section id="deletion" className="guide-section-block">
            <h2>Account and Data Deletion</h2>
            <p>Users may request deletion of their account/personal information through available account controls or by contacting PreepX. Before deleting information, PreepX may need to verify the user's identity.</p>
            <p>Some information may need to be retained where required by law or necessary for legal claims, fraud prevention, security, accounting, dispute resolution, or enforcement of agreements.</p>
          </section>

          <section id="children" className="guide-section-block">
            <h2>Children's Privacy</h2>
            <p>PreepX is not intended for users who are not legally permitted to use the Services under applicable law.</p>
            <p>If we learn that we have collected personal information from a person who is not permitted to use the Services, we will take reasonable steps to address the situation in accordance with applicable law.</p>
          </section>

          <section id="international" className="guide-section-block">
            <h2>International Data Transfers</h2>
            <p>Your information may be processed or stored in locations outside the country in which you reside, depending on the infrastructure and service providers used by PreepX.</p>
            <p>PreepX will take appropriate measures required by applicable law for such processing/transfers.</p>
          </section>

          <section id="third-party-data" className="guide-section-block">
            <h2>Data from Recruiters / Third Parties</h2>
            <p>PreepX may receive candidate information from recruiters, employers, assessment organizers, other authorized users, third-party authentication providers, and job application workflows. Where applicable, the information may be used to provide the requested service.</p>
          </section>

          <section id="job-applications" className="guide-section-block">
            <h2>Job Application Privacy</h2>
            <p>When users apply to jobs through PreepX:</p>
            <ul className="guide-bullet-list">
              <li>Relevant profile information may be shared with the applicable recruiter/employer.</li>
              <li>Recruiters may process candidate information according to their own privacy policies.</li>
              <li>PreepX does not control how an employer processes information after receiving it, except to the extent required by applicable agreements/law.</li>
            </ul>
            <p>Candidates should review the relevant employer's privacy information where provided.</p>
          </section>

          <section id="recruiter-responsibilities" className="guide-section-block">
            <h2>Recruiter and Company Responsibilities</h2>
            <p>Recruiters using PreepX must:</p>
            <ul className="guide-bullet-list">
              <li>Use candidate information only for legitimate purposes.</li>
              <li>Comply with applicable privacy and employment laws.</li>
              <li>Respect candidate rights.</li>
              <li>Maintain appropriate security.</li>
              <li>Avoid unauthorized disclosure.</li>
              <li>Avoid collecting unnecessary information through assessments.</li>
              <li>Handle candidate data responsibly.</li>
            </ul>
            <p>Recruiters may act as independent data controllers for information they collect/process for their own recruitment purposes where applicable.</p>
          </section>

          <section id="marketing" className="guide-section-block">
            <h2>Marketing Communications</h2>
            <p>PreepX may send service communications, account notifications, security alerts, transactional communications, and product updates.</p>
            <p>Marketing communications should be sent according to applicable law and user choices. Where applicable, users can unsubscribe from promotional communications.</p>
          </section>

          <section id="analytics" className="guide-section-block">
            <h2>Data Used for Analytics and Improvement</h2>
            <p>PreepX may use aggregated or de-identified information to understand product usage, improve features, monitor performance, identify bugs, improve AI/product quality, and understand platform trends.</p>
            <p>Aggregated/de-identified information should not reasonably identify an individual where it is represented as de-identified.</p>
          </section>

          <section id="user-content" className="guide-section-block">
            <h2>User-Generated Content</h2>
            <p>PreepX may process information/content submitted by users, including resumes, interview answers, coding submissions, assessment answers, profile information, feedback, and uploaded files.</p>
            <p>This information is processed to provide the requested Services and according to the Terms of Service. Please review the Terms of Service for intellectual property ownership and licensing provisions.</p>
          </section>

          <section id="security-incidents" className="guide-section-block">
            <h2>Data Breach / Security Incidents</h2>
            <p>If PreepX becomes aware of a security incident affecting personal information, it will take appropriate steps as required by applicable law, which may include investigation, containment, remediation, and notification where legally required.</p>
          </section>

          <section id="complaints" className="guide-section-block">
            <h2>Privacy Complaints</h2>
            <p>Users should be able to contact PreepX regarding privacy questions, data access, data correction, data deletion, unauthorized data use, and privacy complaints.</p>
            <ul className="guide-bullet-list" style={{ listStyle: 'none', paddingLeft: 0 }}>
              <li><strong>Privacy Email:</strong> <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@preepx.in" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none' }}>contact@preepx.in</a></li>
              <li><strong>Support Email:</strong> <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@preepx.in" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none' }}>contact@preepx.in</a></li>
              <li><strong>Contact Address:</strong> Bengaluru, Karnataka, India</li>
            </ul>
          </section>

          <section id="changes" className="guide-section-block">
            <h2>Changes to this Privacy Policy</h2>
            <p>PreepX may update this Privacy Policy from time to time. For material changes, PreepX may provide additional notice where appropriate. Users should periodically review the latest version.</p>
          </section>

          <section id="governing-law" className="guide-section-block">
            <h2>Governing Law / Legal Framework</h2>
            <p>This Privacy Policy is intended to be interpreted in accordance with applicable laws and regulations governing PreepX and its Services. Specific governing-law and jurisdiction details will be included once confirmed by PreepX.</p>
          </section>

          <section id="contact" className="guide-section-block">
            <h2>Contact PreepX</h2>
            <p>If you have questions about this Privacy Policy or how PreepX handles personal information, please contact us.</p>
            <ul className="guide-bullet-list" style={{ listStyle: 'none', paddingLeft: 0 }}>
              <li><strong>Privacy Email:</strong> <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@preepx.in" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none' }}>contact@preepx.in</a></li>
              <li><strong>Support:</strong> <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@preepx.in" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none' }}>contact@preepx.in</a></li>
              <li><strong>Legal Entity:</strong> PreepX</li>
              <li><strong>Registered Address:</strong> Bengaluru, Karnataka, India</li>
            </ul>
          </section>

          <div style={{ marginTop: '60px', paddingTop: '20px', borderTop: '1px solid var(--hpw-border-light)', fontSize: '13px', color: 'var(--hpw-text-muted)', textAlign: 'center' }}>
            <p>This Privacy Policy is provided for platform use and should be reviewed by qualified legal counsel before being treated as PreepX's final legal agreement.</p>
            {/* Legal review required before publication. */}
          </div>

        </main>
      </div>
    </div>
  );
}
