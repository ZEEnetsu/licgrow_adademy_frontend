import { useEffect, useState } from "react";

/**
 * `value`, held back until it has stopped changing for `delay` ms.
 * For search boxes: one request when the typing pauses, not one per key.
 */
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default useDebouncedValue;
