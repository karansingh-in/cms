import { addCard, gradeCard } from "@/app/actions";
import { studyDay } from "@/lib/day";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

const GRADES = [
  { grade: "again", label: "Again" },
  { grade: "good", label: "Good" },
  { grade: "easy", label: "Easy" },
] as const;

export default async function Review() {
  const today = studyDay();
  const due = (await store.listCards()).filter((c) => c.dueDay <= today);
  const card = due[0];

  return (
    <main className="pt-6">
      <h1 className="font-display text-[34px] leading-[1.05] tracking-[-0.02em]">Review</h1>
      <p className="tabular mt-2 text-[13px] text-ink-2">
        {due.length === 0 ? "Nothing due." : `${due.length} due.`}
      </p>

      {card ? (
        <article className="mt-8">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink-3">Front</p>
          <p className="mt-2 font-display text-[26px] leading-[1.25] tracking-[-0.01em]">{card.front}</p>

          <details className="mt-6">
            <summary className="press cursor-pointer list-none rounded-[10px] border border-rule py-3 text-center text-[14px]">
              Show answer
            </summary>
            <div className="mt-4">
              <p className="text-[15px] leading-relaxed text-ink-2">{card.back}</p>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {GRADES.map(({ grade, label }) => (
                  <form key={grade} action={gradeCard}>
                    <input type="hidden" name="id" value={card.id} />
                    <input type="hidden" name="grade" value={grade} />
                    <button
                      className={`press w-full rounded-[10px] py-3 text-[14px] font-medium ${
                        grade === "good" ? "bg-ink text-paper" : "border border-rule"
                      }`}
                    >
                      {label}
                    </button>
                  </form>
                ))}
              </div>
            </div>
          </details>
        </article>
      ) : (
        <p className="mt-8 text-[14px] text-ink-2">
          Add a card below. Cards you get wrong come back the same day.
        </p>
      )}

      <section className="mt-10" aria-labelledby="new-card">
        <h2 id="new-card" className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
          New card
        </h2>
        <form action={addCard} className="mt-2 space-y-2 rounded-[12px] bg-ash p-4">
          <input
            name="front"
            required
            placeholder="Question"
            aria-label="Question"
            className="w-full rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
          />
          <textarea
            name="back"
            required
            rows={2}
            placeholder="Answer"
            aria-label="Answer"
            className="w-full resize-none rounded-[10px] border border-rule bg-paper px-3 py-2.5 text-[14px]"
          />
          <button className="press w-full rounded-[10px] bg-ink py-3 text-[14px] font-medium text-paper">Add card</button>
        </form>
      </section>
    </main>
  );
}
