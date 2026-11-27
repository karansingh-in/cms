export default function Mark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} className={className} aria-hidden>
      <rect width="512" height="512" rx="112" fill="#101B2B" />
      <g fill="none" strokeWidth="26" strokeLinecap="round">
        <path d="M132 178 C 196 178 212 216 240 244" stroke="#3FC6A0" />
        <path d="M120 256 H 240" stroke="#F0B33C" />
        <path d="M132 334 C 196 334 212 296 240 268" stroke="#9AA8F7" />
        <path d="M282 256 H 392" stroke="#FFFFFF" />
      </g>
      <circle cx="261" cy="256" r="21" fill="#FFFFFF" />
    </svg>
  );
}
