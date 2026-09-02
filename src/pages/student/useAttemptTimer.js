import { useEffect, useRef, useState } from "react";

/**
 * Countdown for a timed attempt — `api-contracts/10-submission.md` §4/§5.
 *
 * The server is authoritative: it returns `timeRemainingSeconds` on resume and
 * on every autosave, and it enforces expiry independently. This hook only
 * renders a smooth local countdown BETWEEN those points, and re-syncs whenever
 * the server speaks again.
 *
 * Counting purely locally would drift, and a drifted clock either steals time
 * from the learner or lets them keep answering into an attempt the server has
 * already closed.
 *
 * `null` seconds means an untimed attempt (quizzes) — no countdown at all.
 */
export function useAttemptTimer(serverSeconds, { onExpire } = {}) {
  const normalized = serverSeconds ?? null;

  const [seconds, setSeconds] = useState(normalized);
  const [syncedTo, setSyncedTo] = useState(normalized);

  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  // hold the latest callback without making it an effect dependency, so a new
  // inline arrow from the caller doesn't restart the interval every render
  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  /*
   * Re-sync DURING RENDER rather than in an effect.
   *
   * This is React's documented "adjusting state when a prop changes" pattern:
   * React re-runs the component immediately without committing the stale
   * value, so there is no cascading render and no frame where the clock shows
   * the previous attempt's time.
   */
  if (normalized !== syncedTo) {
    setSyncedTo(normalized);
    setSeconds(normalized);
  }

  // tick
  useEffect(() => {
    if (seconds === null || seconds <= 0) return undefined;

    const id = setInterval(() => {
      setSeconds((current) =>
        current === null ? null : Math.max(0, current - 1),
      );
    }, 1000);

    return () => clearInterval(id);
  }, [seconds]);

  // fire onExpire exactly once per expiry; refs are written here, never in render
  useEffect(() => {
    if (seconds === null) return;

    if (seconds > 0) {
      expiredRef.current = false;
      return;
    }
    if (expiredRef.current) return;

    expiredRef.current = true;
    onExpireRef.current?.();
  }, [seconds]);

  return {
    seconds,
    isTimed: seconds !== null,
    isExpired: seconds === 0,
    label: formatDuration(seconds),
  };
}

export function formatDuration(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined) return null;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}
