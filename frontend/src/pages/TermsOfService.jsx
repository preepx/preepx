import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "@/styles/UserGuide.css"; // Reusing the layout styles

const tocItems = [
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "eligibility", label: "Eligibility" },
  { id: "about", label: "About PreepX" },
  { id: "accounts", label: "User Accounts" },
  { id: "candidate", label: "Candidate Services" },
  { id: "ai", label: "AI Features" },
  { id: "assessments", label: "Assessments & Coding" },
  { id: "recruiter", label: "Recruiter Services" },
  { id: "jobs", label: "Job Opportunities" },
  { id: "paid", label: "Coins & Paid Services" },
  { id: "certificates", label: "Certificates & XP" },
  { id: "content", label: "User Content" },
  { id: "ip", label: "Intellectual Property" },
  { id: "prohibited", label: "Prohibited Activities" },
  { id: "thirdparty", label: "Third-Party Services" },
  { id: "privacy", label: "Privacy" },
  { id: "availability", label: "Availability" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "suspension", label: "Suspension & Termination" },
  { id: "changes-platform", label: "Platform Changes" },
  { id: "changes-terms", label: "Changes to Terms" },
  { id: "severability", label: "Severability" },
  { id: "entire", label: "Entire Agreement" },
  { id: "contact", label: "Contact Us" }
];

export default function TermsOfService() {
  const [activeTab, setActiveTab] = useState("acceptance");

  useEffect(() => {
    document.title = "Terms of Service | PreepX";
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {

    const handleScroll = () => {
      const sections = tocItems.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 120; // offset

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          if (activeTab !== section.id) {
            setActiveTab(section.id);
          }
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab]);

  const handleScrollTo = (id) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="user-guide-page">
      <header className="guide-hero" style={{ paddingBottom: '60px' }}>
        <h1>Terms of Service</h1>
        <p className="guide-hero-sub">
          Please read these Terms of Service carefully before using PreepX.
        </p>
        <div style={{ marginTop: '20px', color: '#bae6fd', fontSize: '15px' }}>
          <strong>Last Updated:</strong> October 2026
        </div>
        <p style={{ maxWidth: '700px', margin: '20px auto 0', color: '#e0f2fe', lineHeight: '1.6', fontSize: '15px' }}>
          These Terms of Service govern your access to and use of the PreepX platform, website, applications, features and related services.
        </p>
      </header>

      <div className="guide-container">
        <main className="guide-content" style={{ paddingBottom: '60px' }}>
          <section id="acceptance" className="guide-section-block">
            <h2>Acceptance of Terms</h2>
            <p>By creating a PreepX account, accessing the platform, using any PreepX feature, purchasing coins/subscriptions, participating in assessments, using recruiter functionality, or applying for jobs through PreepX, you agree to these Terms of Service, our Privacy Policy, and any other policies referenced herein.</p>
            <p>If you do not agree with these Terms, you should not use the platform. Continued use of the platform after an update to these Terms may constitute your acceptance of the revised Terms where legally applicable.</p>
          </section>

          <section id="eligibility" className="guide-section-block">
            <h2>Eligibility</h2>
            <p>To use PreepX, you must provide accurate registration information and have the legal capacity required to enter into a binding agreement under applicable law in your jurisdiction.</p>
            <p>Certain features may have additional age or eligibility requirements as required by applicable law or as specified for particular assessments or job applications.</p>
          </section>

          <section id="about" className="guide-section-block">
            <h2>About PreepX</h2>
            <p>PreepX is a technology platform that provides interview preparation, AI-powered mock interviews, assessments, coding practice, performance analytics, career opportunities, and recruiter-oriented hiring tools.</p>
            <p>The platform may provide different functionality to Candidates, Job seekers, Students, Working professionals, Recruiters, Companies, and Institutions.</p>
          </section>

          <section id="accounts" className="guide-section-block">
            <h2>User Accounts</h2>
            <ul className="guide-bullet-list">
              <li><strong>Accurate Information:</strong> You agree to provide accurate and complete information during registration and keep it updated.</li>
              <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your password and credentials. You must not share your account with others where prohibited.</li>
              <li><strong>Responsibility:</strong> You are responsible for all activity performed through your account. You must notify PreepX immediately of any unauthorized access.</li>
              <li><strong>Termination:</strong> PreepX reserves the right to suspend or terminate accounts for violations of these Terms.</li>
            </ul>
            <p>PreepX aims to maintain secure systems but is not liable for every account-security incident that may occur.</p>
          </section>

          <section id="candidate" className="guide-section-block">
            <h2>Candidate Services</h2>
            <p>PreepX may provide services including but not limited to: AI mock interviews, technical interview preparation, HR and behavioral interview practice, role-based preparation, objective assessments, coding practice, interview notes, learning resources, performance analytics, achievements, certificates, job discovery, and job applications.</p>
            <p><strong>Important:</strong> PreepX is a preparation and technology platform and does <strong>NOT</strong> guarantee employment, interview selection, job offers, salary, promotion, placement, recruiter response, or a successful interview outcome. Users are solely responsible for their own preparation, applications, and career decisions.</p>
          </section>

          <section id="ai" className="guide-section-block">
            <h2>AI-Powered Features</h2>
            <p>PreepX utilizes Artificial Intelligence to generate questions, feedback, evaluations, suggestions, and summaries. AI-generated outputs may not always be accurate, complete, or appropriate.</p>
            <p>AI output should be treated as preparation/support information and not as guaranteed professional, employment, or technical advice. PreepX does not guarantee that AI-generated feedback will be error-free. You should use your own judgment when relying on AI-generated results. AI features may change, improve, be limited, or become unavailable over time.</p>
          </section>

          <section id="assessments" className="guide-section-block">
            <h2>Assessments and Coding</h2>
            <p>The platform offers objective exams, coding assessments, and recruiter-created assessments which may involve automated scoring, test cases, evaluation results, limited attempts, time limits, and proctoring where applicable.</p>
            <p>When participating in any assessment, you must not:</p>
            <ul className="guide-bullet-list">
              <li>Cheat or use unauthorized assistance.</li>
              <li>Manipulate results or interfere with assessment systems.</li>
              <li>Impersonate another person.</li>
              <li>Attempt to bypass technical restrictions.</li>
              <li>Share confidential assessment content where prohibited.</li>
            </ul>
            <p>Assessment results may depend on the assessment configuration and the technical systems used at the time of evaluation.</p>
          </section>

          <section id="recruiter" className="guide-section-block">
            <h2>Recruiter Services</h2>
            <p>Recruiter functionality may include account creation, company profiles, assessment creation, coding challenges, objective exams, candidate invitations, candidate evaluation, automated scoring, candidate shortlisting, interview scheduling, and hiring workflow management.</p>
            <p>Recruiters are solely responsible for:</p>
            <ul className="guide-bullet-list">
              <li>The accuracy of job descriptions and assessment content.</li>
              <li>The legality of their recruitment activities and employment decisions.</li>
              <li>Candidate communications.</li>
              <li>Compliance with all applicable employment laws and respecting candidate rights.</li>
            </ul>
            <p>PreepX should not be represented as the employer unless explicitly stated for a particular service. PreepX does not guarantee that a recruiter will hire any candidate.</p>
          </section>

          <section id="jobs" className="guide-section-block">
            <h2>Job Opportunities and Applications</h2>
            <p>PreepX may display job opportunities posted by recruiters, companies, or other sources. PreepX does not guarantee the availability of a job, the accuracy of every third-party job listing, recruiter response, interview selection, employment, salary, or job conditions.</p>
            <p>Users are responsible for reviewing job information before applying. Applying may involve sharing relevant candidate information with the respective recruiter or employer, as outlined in our Privacy Policy.</p>
          </section>

          <section id="paid" className="guide-section-block">
            <h2>Coins, Subscriptions and Paid Services</h2>
            <p>PreepX may offer coins/credits, subscription plans, paid interview sessions, and premium features. Prices, available plans, and promotional pricing are subject to change prospectively, in accordance with applicable law.</p>
            <p>Purchases may be subject to taxes and payment processing terms. Credits or features may be subject to expiry rules where applicable.</p>
            <p>Refunds and cancellations are governed by the applicable PreepX Refund & Cancellation Policy and the terms presented to you at the time of purchase.</p>
          </section>

          <section id="certificates" className="guide-section-block">
            <h2>Certificates, Badges, XP and Achievements</h2>
            <p>PreepX may provide Certificates, Badges, XP (Experience Points), Achievements, and Leaderboard recognition. These represent activity or performance exclusively within the PreepX platform.</p>
            <p>They should not automatically be interpreted as academic accreditation, professional certification, employment guarantees, industry licensing, or government recognition, unless explicitly stated otherwise by an authorized body.</p>
          </section>

          <section id="content" className="guide-section-block">
            <h2>User Content</h2>
            <p>User Content includes profile information, resumes, answers, interview responses, coding submissions, assessment submissions, feedback, uploaded documents, and other content submitted by the user.</p>
            <p>You retain ownership of your content to the extent you own the applicable rights. You must have the necessary rights and permissions to submit any content to the platform.</p>
            <p>You must not upload content that infringes copyright, violates privacy, contains malware, is unlawful, fraudulent, impersonates another person, or violates third-party rights.</p>
            <p>By submitting content, you grant PreepX a limited license to host, process, display, and provide the requested services associated with that content.</p>
          </section>

          <section id="ip" className="guide-section-block">
            <h2>Intellectual Property</h2>
            <p>PreepX and/or its licensors own all applicable rights in the PreepX branding, logos, website design, software, platform architecture, original content, graphics, trademarks, documentation, and platform interfaces.</p>
            <p>Users receive a limited, non-exclusive right to access and use the platform for its intended purpose. You may not copy, reproduce, sell, redistribute, reverse engineer, scrape, modify, create derivative products, or commercially exploit PreepX intellectual property without appropriate authorization.</p>
          </section>

          <section id="prohibited" className="guide-section-block">
            <h2>Prohibited Activities</h2>
            <p>Users must not engage in any of the following activities:</p>
            <ul className="guide-bullet-list">
              <li>Violate any applicable law or commit fraud.</li>
              <li>Impersonate another person or create fake accounts for abuse.</li>
              <li>Manipulate assessments, cheat, or manipulate leaderboards.</li>
              <li>Scrape the platform, use bots, or unauthorized automation.</li>
              <li>Attempt unauthorized access, attack or disrupt systems, exploit vulnerabilities, or upload malware.</li>
              <li>Abuse APIs, bypass payment mechanisms, or circumvent access restrictions.</li>
              <li>Collect other users' personal information without authorization, or harass or abuse other users.</li>
              <li>Infringe intellectual property or misuse referral/reward systems.</li>
            </ul>
            <p>PreepX reserves the right to investigate and take appropriate action against violators.</p>
          </section>

          <section id="thirdparty" className="guide-section-block">
            <h2>Third-Party Services and Links</h2>
            <p>PreepX may integrate with or link to third-party services, such as payment providers, authentication providers, cloud services, AI providers, job/recruitment services, analytics services, and communication services.</p>
            <p>These third-party services may have their own terms and privacy policies. PreepX is not responsible for third-party services beyond what is required by applicable law.</p>
          </section>

          <section id="privacy" className="guide-section-block">
            <h2>Privacy</h2>
            <p>Your use of PreepX is also subject to our <Link to="/privacy-policy" style={{ color: '#0284c7', fontWeight: '600', textDecoration: 'none' }}>Privacy Policy</Link>, which explains how we collect, use, and protect your personal information.</p>
          </section>

          <section id="availability" className="guide-section-block">
            <h2>Platform Availability</h2>
            <p>PreepX aims to provide reliable services but does not guarantee uninterrupted availability, error-free operation, continuous availability of every feature, compatibility with every device, or uninterrupted AI functionality.</p>
            <p>Services may be temporarily unavailable due to maintenance, updates, technical issues, security incidents, third-party dependencies, or circumstances beyond our reasonable control.</p>
          </section>

          <section id="disclaimers" className="guide-section-block">
            <h2>Disclaimers</h2>
            <p>PreepX is provided subject to applicable law and does not guarantee specific career, hiring, or interview outcomes. AI-generated content may contain inaccuracies. Job listings and recruiter-provided information may come from third parties. Assessment results may depend on the assessment design and technical environment.</p>
          </section>

          <section id="liability" className="guide-section-block">
            <h2>Limitation of Liability</h2>
            <p>To the maximum extent permitted by applicable Indian law, PreepX shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the services.</p>
          </section>

          <section id="indemnification" className="guide-section-block">
            <h2>Indemnification</h2>
            <p>Subject to applicable law, you agree to indemnify and hold harmless PreepX from any losses, damages, or claims arising from your violation of these Terms, your unlawful use of the platform, your infringement of third-party rights, your User Content, or your misuse of the Services.</p>
          </section>

          <section id="suspension" className="guide-section-block">
            <h2>Suspension and Termination</h2>
            <p>PreepX may suspend or terminate your access to the platform where appropriate, including for Terms violations, fraud, abuse, security threats, unlawful activity, payment-related issues, or misuse of the platform.</p>
            <p>You may stop using the platform at any time. Upon termination, your right to access the platform will cease immediately, and any applicable subscriptions, credits, or user content may be handled according to our standard operating procedures.</p>
          </section>

          <section id="changes-platform" className="guide-section-block">
            <h2>Changes to the Platform</h2>
            <p>PreepX may add, remove, modify, or discontinue features, introduce new services, or change pricing for product, security, legal, technical, or business reasons.</p>
          </section>

          <section id="changes-terms" className="guide-section-block">
            <h2>Changes to These Terms</h2>
            <p>PreepX may update these Terms of Service. Important changes will be communicated through appropriate channels where required. Your continued use of the platform after the effective date of updated Terms may constitute acceptance where legally applicable.</p>
          </section>

          <section id="severability" className="guide-section-block">
            <h2>Severability</h2>
            <p>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect to the extent permitted by law.</p>
          </section>

          <section id="entire" className="guide-section-block">
            <h2>Entire Agreement</h2>
            <p>These Terms, together with any referenced policies (including the Privacy Policy), constitute the entire agreement governing your use of the Services, subject to any applicable additional terms for specific services.</p>
          </section>

          <section id="contact" className="guide-section-block">
            <h2>Contact Us</h2>
            <p>If you have questions about these Terms of Service, please contact PreepX through the official channels:</p>
            <ul className="guide-bullet-list" style={{ listStyle: 'none', paddingLeft: 0 }}>
              <li><strong>Legal Email:</strong> <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@preepx.in" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none' }}>contact@preepx.in</a></li>
              <li><strong>Support Email:</strong> <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@preepx.in" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none' }}>contact@preepx.in</a></li>
              <li><strong>Company / Legal Entity:</strong> PreepX</li>
              <li><strong>Registered Address:</strong> Bengaluru, Karnataka, India</li>
            </ul>
          </section>

          <div style={{ marginTop: '60px', paddingTop: '20px', borderTop: '1px solid var(--hpw-border-light)', fontSize: '13px', color: 'var(--hpw-text-muted)', textAlign: 'center' }}>
            <p>These Terms of Service are provided for platform use and should be reviewed by qualified legal counsel before being treated as PreepX's final legal agreement.</p>
          </div>

        </main>
      </div>
    </div>
  );
}
