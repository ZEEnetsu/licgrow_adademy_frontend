import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * A tab kept in the URL (`?tab=members`), so a reload or a shared link lands
 * on the same tab. Unknown values fall back to the default; the default is
 * left out of the URL.
 */
export function useTabParam(name, { values, defaultValue }) {
  const [params, setParams] = useSearchParams();
  const raw = params.get(name);
  const value = raw && (!values || values.includes(raw)) ? raw : defaultValue;

  const setValue = useCallback(
    (next) => {
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          if (!next || next === defaultValue) out.delete(name);
          else out.set(name, next);
          return out;
        },
        { replace: true },
      );
    },
    [setParams, name, defaultValue],
  );

  return [value, setValue];
}

/**
 * A modal whose open state lives in the URL (`?new=1`), so the command
 * palette and the dashboard can link straight to "New batch", and Back closes
 * it. Opening pushes a history entry; closing replaces.
 */
export function useModalParam(name = "new") {
  const [params, setParams] = useSearchParams();
  const isOpen = params.has(name);

  const open = useCallback(() => {
    setParams((prev) => {
      const out = new URLSearchParams(prev);
      out.set(name, "1");
      return out;
    });
  }, [setParams, name]);

  const close = useCallback(() => {
    setParams(
      (prev) => {
        const out = new URLSearchParams(prev);
        out.delete(name);
        return out;
      },
      { replace: true },
    );
  }, [setParams, name]);

  return [isOpen, open, close];
}
