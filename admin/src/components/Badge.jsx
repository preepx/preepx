/**
 * components/Badge.jsx — Difficulty badge
 */
export default function Badge({ difficulty }) {
  const classes = {
    Easy: 'badge-easy',
    Medium: 'badge-medium',
    Hard: 'badge-hard',
  };

  return (
    <span className={classes[difficulty] || 'badge bg-zinc-700/40 text-zinc-400'}>
      {difficulty}
    </span>
  );
}
