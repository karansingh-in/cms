import { unlock } from "@/app/actions";

export default async function Unlock({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-dvh flex-col justify-center pb-24">
      <h1 className="font-display text-[36px] leading-[1.05] tracking-[-0.02em]">Triage</h1>
      <p className="mt-2 text-[14px] text-ink-2">Private. One passcode, one person.</p>

      <form action={unlock} className="mt-8">
        <label htmlFor="passcode" className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
          Passcode
        </label>
        <input
          id="passcode"
          name="passcode"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          className="mt-2 w-full rounded-[10px] border border-rule bg-paper px-3 py-3 text-[16px]"
        />
        {error && <p className="mt-2 text-[13px] text-oxblood">That is not it.</p>}
        <button className="press mt-4 w-full rounded-[10px] bg-ink py-3.5 text-[14px] font-medium text-paper">
          Unlock
        </button>
      </form>
    </main>
  );
}
