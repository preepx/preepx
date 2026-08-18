/**
 * components/Navbar.jsx — Top navigation bar
 */
export default function Navbar({ onMenuToggle, title }) {
  return (
    <header className="h-14 bg-surface-1 border-b border-zinc-800 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-10">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden btn-icon text-zinc-400 hover:text-zinc-200"
        aria-label="Toggle menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Page title */}
      <h1 className="text-sm font-semibold text-zinc-300">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        {/* Status dot */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
          API Online
        </div>
      </div>
    </header>
  );
}
