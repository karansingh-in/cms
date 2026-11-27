"use client";

export default function ConfirmSubmit({
  message,
  label,
  className,
  children,
}: {
  message: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      aria-label={label}
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
