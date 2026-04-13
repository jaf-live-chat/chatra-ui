import { useEffect, useState } from "react";

const DEFAULT_INTERVAL_MS = 1000;

const useNowTick = (intervalMs = DEFAULT_INTERVAL_MS) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [intervalMs]);

  return now;
};

export default useNowTick;
