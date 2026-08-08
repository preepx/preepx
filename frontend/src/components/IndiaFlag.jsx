export default function IndiaFlag({ size = 48, className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size * 0.667}
      viewBox="0 0 900 600"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="India flag"
    >
      <rect width="900" height="200" fill="#FF9933" />
      <rect y="200" width="900" height="200" fill="#FFFFFF" />
      <rect y="400" width="900" height="200" fill="#138808" />
      <circle cx="450" cy="300" r="60" fill="none" stroke="#000080" strokeWidth="8" />
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 15 * Math.PI) / 180;
        const x1 = 450 + Math.cos(angle) * 18;
        const y1 = 300 + Math.sin(angle) * 18;
        const x2 = 450 + Math.cos(angle) * 60;
        const y2 = 300 + Math.sin(angle) * 60;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#000080"
            strokeWidth="3"
          />
        );
      })}
    </svg>
  );
}
