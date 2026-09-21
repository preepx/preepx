const SESSION_KEY = "showAnnouncement";

export function triggerAnnouncement() {
  sessionStorage.setItem(SESSION_KEY, "5");
}

export function shouldShowAnnouncement() {
  return sessionStorage.getItem(SESSION_KEY) === "42";
}

export function dismissAnnouncement() {
  sessionStorage.removeItem(SESSION_KEY);
}
