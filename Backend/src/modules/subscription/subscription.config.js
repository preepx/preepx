/**
 * Subscription Plan Configuration
 * Time-based access plans — user pays once, gets full access for N days.
 */
module.exports = {
  PLANS: [
    {
      id: "plan_7d",
      name: "7 Days",
      days: 7,
      realPrice: 99,
      offerPrice: 79,
      saving: 20,
      popular: false,
      label: "Weekly",
      badge: null,
    },
    {
      id: "plan_1m",
      name: "1 Month",
      days: 30,
      realPrice: 349,
      offerPrice: 299,
      saving: 50,
      popular: false,
      label: "Monthly",
      badge: null,
    },
    {
      id: "plan_3m",
      name: "3 Months",
      days: 90,
      realPrice: 899,
      offerPrice: 799,
      saving: 100,
      popular: true,
      label: "Quarterly",
      badge: "Most Popular",
    },
    {
      id: "plan_6m",
      name: "6 Months",
      days: 180,
      realPrice: 1599,
      offerPrice: 1299,
      saving: 300,
      popular: false,
      label: "Half Yearly",
      badge: "Best Value",
    },
    {
      id: "plan_12m",
      name: "12 Months",
      days: 365,
      realPrice: 2999,
      offerPrice: 2199,
      saving: 800,
      popular: false,
      label: "Yearly",
      badge: "🎉 Max Savings",
    },
  ],

  /** Find a plan by its ID */
  findPlan(planId) {
    return this.PLANS.find((p) => p.id === planId) || null;
  },

  /** Compute expiry date from now for a given plan */
  computeExpiry(plan, fromDate = new Date()) {
    const expiry = new Date(fromDate);
    expiry.setDate(expiry.getDate() + plan.days);
    return expiry;
  },
};
