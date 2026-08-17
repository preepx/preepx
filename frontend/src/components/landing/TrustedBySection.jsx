import React from "react";
import "@/styles/landing/TrustedStatsLanding.css";

function TrustedBySection() {
  const companies = [
    { name: "Google", icon: "/company/google-2015-logo-svgrepo-com.svg" },
    { name: "Amazon", icon: "/company/amazon-2-logo-svgrepo-com.svg" },
    { name: "Meta", icon: "/company/facebook-logo-svgrepo-com.svg" },
    { name: "Netflix", icon: "/company/netflix-2-logo-svgrepo-com.svg" },
    { name: "IBM", icon: "/company/ibm-logo-svgrepo-com.svg" },
    { name: "Oracle", icon: "/company/oracle-6-logo-svgrepo-com.svg" },
    { name: "Salesforce", icon: "/company/salesforce-2-logo-svgrepo-com.svg" },
    { name: "LinkedIn", icon: "/company/linkedin-logo-svgrepo-com.svg" },
    { name: "Walmart", icon: "/company/walmart-logo-svgrepo-com.svg" },
    { name: "Cisco", icon: "/company/cisco-2-logo-svgrepo-com.svg" },
    { name: "DHL", icon: "/company/dhl-express-logo-svgrepo-com.svg" },
    { name: "Flipkart", icon: "/company/flipkart-logo-svgrepo-com.svg" },
    { name: "Booking.com", icon: "/company/bookingcom-logo-svgrepo-com.svg" },
    { name: "Hyundai", icon: "/company/hyundai-automobiles-1-logo-svgrepo-com.svg" },
    { name: "Mastercard", icon: "/company/mastercard-2-logo-svgrepo-com.svg" },
    { name: "Paypal", icon: "/company/paypal-logo-svgrepo-com.svg" },
    { name: "Visa", icon: "/company/visa-logo-svgrepo-com.svg" },
  ];

  return (
    <section className="prepx-trusted section">
      <div className="trusted-card-container">
        <p className="trusted-header-text">Trusted by candidates and recruiters from</p>
        <div className="company-logos-wrapper">
          <div className="company-logos">
            {companies.map((c, i) => (
              <img key={`c1-${i}`} src={c.icon} alt={c.name} className="company-item-img" />
            ))}
            {companies.map((c, i) => (
              <img key={`c2-${i}`} src={c.icon} alt={c.name} className="company-item-img" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrustedBySection;
