import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Coins, Video, Target, Users, Zap, Shield, HelpCircle } from "lucide-react";
import "./UserGuide.css";

function UserGuide() {
  return (
    <div className="user-guide-page">
      <div className="guide-hero">
        <div className="guide-hero-content">
          <h1>User Guide</h1>
          <p>Everything you need to know about our platform, features, and how to get the most out of your mock interviews.</p>
        </div>
      </div>

      <div className="guide-container">
        <div className="guide-sidebar">
          <nav>
            <a href="#getting-started">Getting Started</a>
            <a href="#mock-interviews">Mock Interviews</a>
            <a href="#objective-exams">Objective Exams</a>
            <a href="#coin-system">Coin System & XP</a>
            <a href="#referrals">Referrals</a>
          </nav>
        </div>

        <div className="guide-content">
          <section id="getting-started" className="guide-section">
            <h2><Zap className="section-icon" /> Getting Started</h2>
            <p>Welcome to PreepX! To start practicing, simply create an account. Make sure to complete your profile to earn bonus coins right away!</p>
            <ul>
              <li><strong>Sign Up:</strong> Register using your email address and verify the OTP.</li>
              <li><strong>Complete Profile:</strong> Fill in your degree, college, and social links to earn a 5 Coins profile completion bonus.</li>
              <li><strong>Dashboard:</strong> Your central hub for tracking your level, streak, and recent exam results.</li>
            </ul>
          </section>

          <div className="guide-divider" />

          <section id="mock-interviews" className="guide-section">
            <h2><Video className="section-icon" /> Mock Interviews</h2>
            <p>Our core feature. PreepX provides AI-powered voice and video mock interviews that mimic real-world hiring scenarios.</p>
            <div className="guide-feature-grid">
              <div className="guide-feature-card">
                <h3>Voice & Video Setup</h3>
                <p>Ensure your microphone and camera permissions are granted. We use real-time AI to analyze your responses.</p>
              </div>
              <div className="guide-feature-card">
                <h3>Instant Feedback</h3>
                <p>Get detailed scores on communication, technical accuracy, and confidence immediately after finishing.</p>
              </div>
            </div>
            <p className="guide-note">
              <strong>Note:</strong> Mock Interviews will require Wallet Coins to attempt.
            </p>
          </section>

          <div className="guide-divider" />

          <section id="objective-exams" className="guide-section">
            <h2><Target className="section-icon" /> Objective Exams</h2>
            <p>Test your fundamental knowledge with our MCQ-based Objective Exams. These are designed to prepare you for the preliminary screening rounds of top tech companies.</p>
            <ul>
              <li><strong>Completely Free:</strong> Objective exams do not consume your Wallet Coins. You can take them as many times as you like.</li>
              <li><strong>Topics:</strong> Cover a wide range of topics from Data Structures, Algorithms, to specific language syntax.</li>
              <li><strong>Analytics:</strong> Your scores are tracked in your Analytics dashboard.</li>
            </ul>
          </section>

          <div className="guide-divider" />

          <section id="coin-system" className="guide-section">
            <h2><Coins className="section-icon" /> Coin System & XP</h2>
            <p>PreepX operates on a unique virtual economy using <strong>Coins</strong> and <strong>XP</strong> to reward consistent practice.</p>

            <div className="guide-callout">
              <h4>What is the difference?</h4>
              <p><strong>XP (Experience Points)</strong> are earned by performing activities (like completing interviews or exams). <strong>Coins</strong> are the primary currency used to unlock premium features.</p>
            </div>

            <h3>How to earn XP:</h3>
            <ul>
              <li>Taking Mock Interviews and Objective Exams.</li>
              <li>Maintaining a daily login streak.</li>
            </ul>

            <h3>Converting XP to Coins:</h3>
            <p>Go to the <strong>Achievements</strong> page (or click your Wallet) to convert your XP into Coins. The higher the tier, the better the conversion rate!</p>
            <ul className="guide-tiers">
              <li><strong>Starter:</strong> 200 XP → 20 Coins</li>
              <li><strong>Popular:</strong> 500 XP → 60 Coins</li>
              <li><strong>Ultimate:</strong> 2000 XP → 250 Coins</li>
            </ul>
          </section>

          <div className="guide-divider" />

          <section id="referrals" className="guide-section">
            <h2><Users className="section-icon" /> Referrals</h2>
            <p>Invite your friends to PreepX and earn rewards!</p>
            <ul>
              <li><strong>Your Unique Code:</strong> Found in your Profile. Share it with friends.</li>
              <li><strong>Signup Bonus:</strong> When someone signs up using your referral code, they instantly receive <strong>20 bonus Coins</strong> to kickstart their journey.</li>
            </ul>
          </section>

          <div className="guide-cta">
            <h3>Ready to crack your dream job?</h3>
            <Link to="/auth" className="guide-btn">Get Started Now</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserGuide;
