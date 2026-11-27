"use client";

export default function PrintButton({ children }: { children: React.ReactNode }) {
  return (
    <button onClick={() => window.print()} className="text-[12px] text-ink-3 underline underline-offset-4">
      {children}
    </button>
  );
}
