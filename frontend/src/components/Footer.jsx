import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import './Footer.css';

const socialLinks = [
  { name: 'Facebook', icon: '/icons/facebook.svg', url: '#' },
  { name: 'Instagram', icon: '/icons/instagram.svg', url: 'https://www.instagram.com/preepx.in?igsh=MTdleHB0d2ExMXF2MQ==' },
  { name: 'LinkedIn', icon: '/icons/linkedin.svg', url: 'https://www.linkedin.com/company/preepx' },
  { name: 'Gmail', icon: '/icons/gmail.svg', url: 'https://mail.google.com/mail/?view=cm&fs=1&to=contact@preepx.in' }
];

const Footer = ({ landingRole = 'candidate' }) => {
  const isRecruiter = landingRole === 'recruiter';

  return (
    <footer className="global-footer">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <Link to="/" className="footer-logo">
            <img src="/preepx_logo.png" alt="PreepX Logo" style={{ height: '80px', objectFit: 'contain' }} />
          </Link>
          <p className="footer-desc">
            {isRecruiter 
              ? "PreepX is an AI-powered hiring platform helping companies discover, evaluate, and hire better technical talent faster."
              : "Your ultimate AI-powered interview preparation platform. Master your skills, build confidence, and crack your dream job."
            }
          </p>
          <div className="footer-socials">
            {socialLinks.map((social) => (
              <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="social-icon">
                <img src={social.icon} alt={social.name} />
              </a>
            ))}
          </div>
        </div>

        <div className="footer-links-group">
          {isRecruiter ? (
            <>
              <div className="footer-link-col">
                <h4>Product</h4>
                <a href="#ai-screening">AI Screening</a>
                <a href="#job-management">Job Management</a>
                <a href="#assessments">Assessments</a>
                <a href="#interviews">Interviews</a>
                <a href="#analytics">Analytics</a>
              </div>
              <div className="footer-link-col">
                <h4>Resources</h4>
                <Link to="/hiring-guide">Hiring Guide</Link>
                <Link to="/recruiter-resources">Recruiter Resources</Link>
                <Link to="/help-center">Help Center</Link>
                <Link to="/documentation">Documentation</Link>
              </div>
            </>
          ) : (
            <>
              <div className="footer-link-col">
                <h4>Product</h4>
                <a href="/#features">Features</a>
                <a href="/#how-it-works">How It Works</a>
                <a href="/#product">Mock Interviews</a>
                <Link to="/user-guide">User Guide</Link>
              </div>
              <div className="footer-link-col">
                <h4>Resources</h4>
                <Link to="/interview-tips">Interview Tips</Link>
                <Link to="/blog">Blog</Link>
                <Link to="/help-center">Help Center</Link>
                <Link to="/community">Community</Link>
              </div>
            </>
          )}

          <div className="footer-link-col">
            <h4>Company</h4>
            <Link to="/about-us">About Us</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} PreepX. Built with AI for aspiring professionals.</p>
      </div>
    </footer>
  );
};

export default Footer;