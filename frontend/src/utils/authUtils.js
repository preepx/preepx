/**
 * Safe local storage authentication utilities
 * Protects against corrupted JSON and provides single-source helpers
 */

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined" || raw === "null") return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse stored user from localStorage:", e);
    return null;
  }
}

export function getStoredToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") return null;
    return token;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  try {
    if (!user) {
      localStorage.removeItem("user");
    } else {
      localStorage.setItem("user", JSON.stringify(user));
    }
    window.dispatchEvent(new Event("user-updated"));
  } catch (e) {
    console.error("Failed to save user to localStorage:", e);
  }
}

export function setStoredToken(token) {
  try {
    if (!token) {
      localStorage.removeItem("token");
    } else {
      localStorage.setItem("token", token);
    }
  } catch (e) {
    console.error("Failed to save token to localStorage:", e);
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_notifications");
  } catch {
    // Ignore storage errors during cleanup
  }
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
