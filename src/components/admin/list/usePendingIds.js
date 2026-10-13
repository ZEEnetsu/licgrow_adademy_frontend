import { useCallback, useState } from "react";

/**
 * Which rows have an action in flight.
 *
 * Replaces the single `busy` flag the lists used to share — suspending one
 * learner disabled every row. Here only that row is pending, and because the
 * table's rows are memoised, only that row re-renders.
 *
 *   const { pendingIds, run } = usePendingIds();
 *   await run(learner.id, () => suspend({ learnerId: learner.id }).unwrap());
 */
export function usePendingIds() {
  const [pendingIds, setPendingIds] = useState(() => new Set());

  const run = useCallback(async (id, action) => {
    setPendingIds((current) => new Set(current).add(id));
    try {
      return await action();
    } finally {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }, []);

  return { pendingIds, run, isPending: (id) => pendingIds.has(id) };
}

export default usePendingIds;
