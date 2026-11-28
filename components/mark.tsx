export default function Mark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} className={className} aria-hidden>
      <rect width="512" height="512" rx="112" fill="#101B2B" />
      <g fill="none" strokeWidth="26" strokeLinecap="round">
        <path d="M132 178 C 196 178 212 216 240 244" stroke="#C04B3F" />
        <path d="M120 256 H 240" stroke="#C98A5A" />
        <path d="M132 334 C 196 334 212 296 240 268" stroke="#E8E2D6" />
        <path d="M282 256 H 392" stroke="#E8E2D6" />
      </g>
      <circle cx="261" cy="256" r="21" fill="#E8E2D6" />
    </svg>
  );
}
