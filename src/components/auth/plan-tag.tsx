import { Tag } from "@phosphor-icons/react/dist/ssr";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Reads `?plan=` from the page's searchParams promise. Render it inside <Suspense> so the
 * rest of the sign-up page stays in the static shell (Cache Components).
 */
export async function PlanTag({ searchParams }: { searchParams: SearchParams }) {
  const { plan } = await searchParams;
  const value = Array.isArray(plan) ? plan[0] : plan;
  if (value !== "free") return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-duck-soft px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink-2">
      <Tag size={12} weight="bold" aria-hidden />
      <span className="mr-[-0.08em]">Free plan</span>
    </span>
  );
}
