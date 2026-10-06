import { useEffect } from "react";

/**
 * Theme is permanently locked to light mode.
 * Dark mode has been removed.
 */
export function useTheme() {
  useEffect(() => {
    // Always enforce light theme
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = "light";
    }
    try {
      localStorage.setItem("theme", "light");
    } catch {
      // storage unavailable
    }
  }, []);

  return {
    theme: "light",
    isDark: false,
    toggleTheme: () => {}, // no-op
    setTheme: () => {},    // no-op
  };
}
