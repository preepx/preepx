import { useState, useEffect, useCallback } from "react";

const THEME_EVENT = "preepx-theme-change";

/**
 * Returns current theme from documentElement or localStorage, defaulting to dark
 */
function getActiveTheme() {
  if (typeof document !== "undefined" && document.documentElement.dataset.theme) {
    return document.documentElement.dataset.theme;
  }
  try {
    return localStorage.getItem("theme") || "dark";
  } catch {
    return "dark";
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState(getActiveTheme);

  const applyTheme = useCallback((newTheme) => {
    const next = newTheme === "light" ? "light" : "dark";
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = next;
    }
    try {
      localStorage.setItem("theme", next);
    } catch {
      // storage unavailable
    }
    setThemeState(next);
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(theme === "light" ? "dark" : "light");
  }, [theme, applyTheme]);

  useEffect(() => {
    // Keep in sync with other components/tabs
    const handleCustomChange = (e) => {
      if (e.detail && e.detail !== theme) {
        setThemeState(e.detail);
      }
    };

    const handleStorage = (e) => {
      if (e.key === "theme" && e.newValue && e.newValue !== theme) {
        setThemeState(e.newValue);
        if (typeof document !== "undefined") {
          document.documentElement.dataset.theme = e.newValue;
        }
      }
    };

    window.addEventListener(THEME_EVENT, handleCustomChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(THEME_EVENT, handleCustomChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [theme]);

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme,
    setTheme: applyTheme,
  };
}
