/** Frontend wallet constants — mirrors Backend/config/wallet.js */
export const WALLET_PRICING = {
  INTERVIEW: 5,     // ₹5 per interview
  OBJECTIVE_EXAM: 1, // ₹1 per exam
};

export const RUPEE_TO_COIN_RATE = 1; // 1 rupee = 1 balance unit

export const DEFAULT_PACKAGES = [
  { id: "pack_20", rupees: 19, coins: 19, label: "Starter" },
  { id: "pack_60", rupees: 49, coins: 49, label: "Popular", popular: true },
  { id: "pack_130", rupees: 99, coins: 99, label: "Pro" },
  { id: "pack_500", rupees: 499, coins: 499, label: "Ultimate" },
];
