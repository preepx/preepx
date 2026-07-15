/** Frontend wallet constants — mirrors Backend/config/wallet.js */
export const WALLET_PRICING = {
  INTERVIEW: 2,
  OBJECTIVE_EXAM: 1,
};

export const RUPEE_TO_COIN_RATE = 1;

export const DEFAULT_PACKAGES = [
  { id: "pack_10", rupees: 10, coins: 10, label: "Starter" },
  { id: "pack_50", rupees: 50, coins: 50, label: "Popular", popular: true },
  { id: "pack_100", rupees: 100, coins: 100, label: "Pro" },
  { id: "pack_500", rupees: 500, coins: 500, label: "Ultimate" },
];
