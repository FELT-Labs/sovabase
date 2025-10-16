export function Logo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Owl body */}
      <circle cx="50" cy="55" r="30" fill="currentColor" opacity="0.9" />

      {/* Owl head */}
      <circle cx="50" cy="35" r="25" fill="currentColor" />

      {/* Left ear/tuft */}
      <path d="M 30 20 Q 28 10 32 15 Q 30 18 30 20" fill="currentColor" />

      {/* Right ear/tuft */}
      <path d="M 70 20 Q 72 10 68 15 Q 70 18 70 20" fill="currentColor" />

      {/* Left eye background */}
      <circle cx="42" cy="35" r="8" fill="white" />

      {/* Right eye background */}
      <circle cx="58" cy="35" r="8" fill="white" />

      {/* Left pupil */}
      <circle cx="42" cy="35" r="4" fill="#1a1a1a" />

      {/* Right pupil */}
      <circle cx="58" cy="35" r="4" fill="#1a1a1a" />

      {/* Beak */}
      <path d="M 50 40 L 45 45 L 50 47 L 55 45 Z" fill="#f59e0b" />

      {/* Left wing */}
      <ellipse cx="30" cy="60" rx="8" ry="15" fill="currentColor" opacity="0.7" />

      {/* Right wing */}
      <ellipse cx="70" cy="60" rx="8" ry="15" fill="currentColor" opacity="0.7" />
    </svg>
  );
}
