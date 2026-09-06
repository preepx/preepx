export function getAssetUrl(path) {
  if (!path) return null;
  const base = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

  if (typeof path === "string" && (path.startsWith("http://") || path.startsWith("https://"))) {
    try {
      const url = new URL(path);
      // If the URL is pointing to local /uploads or preepx.in/uploads, normalize to current active backend host
      if (url.pathname.startsWith("/uploads")) {
        return `${base}${url.pathname}`;
      }
      return path;
    } catch {
      return path;
    }
  }

  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
