import { useCallback, useEffect, useState } from "react";

export function useAsync(fn, deps = []) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const data = await fn();
      setState({ loading: false, error: null, data });
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error }));
    }
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}

export function useMediaQuery(query) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}
