const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const LungsIcon = ({ className = "" }) => (
  <svg viewBox="0 0 48 48" className={className} {...base}>
    <path d="M24 6v18M24 18c-2 2-5 3-7 3M24 18c2 2 5 3 7 3" />
    <path d="M17 12c-6 2-11 12-11 22 0 4 3 6 7 5 4-1 6-4 6-9V14c0-1-1-2-2-2zM31 12c6 2 11 12 11 22 0 4-3 6-7 5-4-1-6-4-6-9V14c0-1 1-2 2-2z" />
  </svg>
);
export const CalendarIcon = ({ className = "" }) => (
  <svg viewBox="0 0 48 48" className={className} {...base}>
    <rect x="7" y="10" width="34" height="32" rx="6" />
    <path d="M7 18h34M16 6v8M32 6v8M24 24v12M18 30h12" />
  </svg>
);
export const BrainIcon = ({ className = "" }) => (
  <svg viewBox="0 0 48 48" className={className} {...base}>
    <path d="M24 10c-2-4-9-4-10 1-5 0-8 5-5 9-4 3-3 9 2 10 0 5 6 7 9 4 2 3 4 4 4 4s2-1 4-4c3 3 9 1 9-4 5-1 6-7 2-10 3-4 0-9-5-9-1-5-8-5-10-1z" />
    <path d="M24 10v28M18 22c2 0 4 2 6 4M30 22c-2 0-4 2-6 4" />
  </svg>
);
