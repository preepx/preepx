export const TOP_COMPANIES = [
  { id: 1, slug: "google", name: "Google", logo: "/company/google-2015-logo-svgrepo-com.svg", badge: "Hot", badgeColor: "#ec4899", rating: "4.9", pColor1: "#a855f7", pColor2: "#ec4899" },
  { id: 2, slug: "amazon", name: "Amazon", logo: "/company/amazon-2-logo-svgrepo-com.svg", badge: "Popular", badgeColor: "#f59e0b", rating: "4.8", pColor1: "#f59e0b", pColor2: "#ea580c" },
  { id: 3, slug: "facebook", name: "Facebook", logo: "/company/facebook-1-logo-svgrepo-com.svg", badge: "Focus", badgeColor: "#a855f7", rating: "4.7", pColor1: "#8b5cf6", pColor2: "#6366f1" },
  { id: 4, slug: "netflix", name: "Netflix", logo: "/company/netflix-2-logo-svgrepo-com.svg", badge: "Trending", badgeColor: "#3b82f6", rating: "4.9", pColor1: "#ef4444", pColor2: "#b91c1c" },
  { id: 5, slug: "linkedin", name: "LinkedIn", logo: "/company/linkedin-logo-svgrepo-com.svg", badge: "New", badgeColor: "#10b981", rating: "4.6", pColor1: "#3b82f6", pColor2: "#2563eb" },
  { id: 6, slug: "flipkart", name: "Flipkart", logo: "/company/flipkart-logo-svgrepo-com.svg", badge: "Popular", badgeColor: "#f59e0b", rating: "4.5", pColor1: "#f59e0b", pColor2: "#ea580c" },
  { id: 7, slug: "walmart", name: "Walmart", logo: "/company/walmart-logo-svgrepo-com.svg", badge: "Hot", badgeColor: "#ec4899", rating: "4.8", pColor1: "#0ea5e9", pColor2: "#0284c7" },
  { id: 8, slug: "oracle", name: "Oracle", logo: "/company/oracle-6-logo-svgrepo-com.svg", badge: "Focus", badgeColor: "#a855f7", rating: "4.7", pColor1: "#ef4444", pColor2: "#dc2626" },
  { id: 9, slug: "ibm", name: "IBM", logo: "/company/ibm-logo-svgrepo-com.svg", badge: "Classic", badgeColor: "#6366f1", rating: "4.6", pColor1: "#6366f1", pColor2: "#4f46e5" },
  { id: 10, slug: "cisco", name: "Cisco", logo: "/company/cisco-2-logo-svgrepo-com.svg", badge: "New", badgeColor: "#10b981", rating: "4.5", pColor1: "#10b981", pColor2: "#059669" },
  { id: 11, slug: "paypal", name: "PayPal", logo: "/company/paypal-logo-svgrepo-com.svg", badge: "Trending", badgeColor: "#3b82f6", rating: "4.8", pColor1: "#3b82f6", pColor2: "#1d4ed8" },
  { id: 12, slug: "salesforce", name: "Salesforce", logo: "/company/salesforce-2-logo-svgrepo-com.svg", badge: "Popular", badgeColor: "#f59e0b", rating: "4.7", pColor1: "#0ea5e9", pColor2: "#0369a1" },
  { id: 13, slug: "mastercard", name: "Mastercard", logo: "/company/mastercard-2-logo-svgrepo-com.svg", badge: "Hot", badgeColor: "#ec4899", rating: "4.6", pColor1: "#f59e0b", pColor2: "#ea580c" },
  { id: 14, slug: "visa", name: "Visa", logo: "/company/visa-logo-svgrepo-com.svg", badge: "Focus", badgeColor: "#a855f7", rating: "4.7", pColor1: "#1d4ed8", pColor2: "#1e3a8a" },
  { id: 15, slug: "booking", name: "Booking.com", logo: "/company/bookingcom-logo-svgrepo-com.svg", badge: "New", badgeColor: "#10b981", rating: "4.5", pColor1: "#0284c7", pColor2: "#0369a1" },
  { id: 16, slug: "dhl", name: "DHL", logo: "/company/dhl-express-logo-svgrepo-com.svg", badge: "Classic", badgeColor: "#6366f1", rating: "4.4", pColor1: "#dc2626", pColor2: "#991b1b" },
  { id: 17, slug: "hyundai", name: "Hyundai", logo: "/company/hyundai-automobiles-1-logo-svgrepo-com.svg", badge: "New", badgeColor: "#10b981", rating: "4.3", pColor1: "#64748b", pColor2: "#475569" },
];

export function getCompanyBySlug(slug) {
  return TOP_COMPANIES.find((c) => c.slug === slug) || null;
}
