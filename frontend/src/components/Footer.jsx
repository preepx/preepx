import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import './Footer.css';

const socialLinks = [
  { name: 'Facebook', icon: '/icons/facebook.svg', url: '#' },
  { name: 'Instagram', icon: '/icons/instagram.svg', url: '#' },
  { name: 'LinkedIn', icon: '/icons/linkedin.svg', url: '#' },
  { name: 'Gmail', icon: '/icons/gmail.svg', url: 'mailto:#' }
];

const Footer = () => {
  return (
    <footer className="global-footer">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <Link to="/" className="footer-logo">
            <img src="/headername1.png" alt="PrepX Logo" style={{ height: '50px', objectFit: 'contain' }} />
          </Link>
          <p className="footer-desc">
            Your ultimate AI-powered interview preparation platform. Master your skills, build confidence, and crack your dream job.
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
          <div className="footer-link-col">
            <h4>Product</h4>
            <a href="/#features">Features</a>
            <a href="/#how-it-works">How It Works</a>
            <a href="/#product">Mock Interviews</a>
            <a href="/#product">Resume Analyzer</a>
          </div>

          <div className="footer-link-col">
            <h4>Resources</h4>
            <Link to="/interview-tips">Interview Tips</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/help-center">Help Center</Link>
            <Link to="/community">Community</Link>
          </div>

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
        <p>&copy; {new Date().getFullYear()} PrepX. Built with AI for aspiring professionals.</p>
      </div>
    </footer>
  );
};

export default Footer;