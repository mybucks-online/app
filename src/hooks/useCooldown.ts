import { useEffect, useRef, useState } from "react";

const useCooldown = (action: () => Promise<void>, duration: number) => {
  const locked = useRef(false);
  const [pending, setPending] = useState(false);
  const [coolingDown, setCoolingDown] = useState(false);

  useEffect(() => {
    if (!coolingDown) {
      return;
    }

    const timerId = setTimeout(() => {
      locked.current = false;
      setCoolingDown(false);
    }, duration);

    return () => clearTimeout(timerId);
  }, [coolingDown, duration]);

  const run = async () => {
    if (locked.current) {
      return;
    }

    locked.current = true;
    setPending(true);

    try {
      await action();
    } finally {
      setPending(false);
      setCoolingDown(true);
    }
  };

  return { run, pending, coolingDown };
};

export default useCooldown;
