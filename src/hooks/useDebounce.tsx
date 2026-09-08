import { useEffect, useRef } from "react";

const useDebounce = () => {
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  const debounce =
    <Args extends unknown[]>(func: (...args: Args) => void, wait: number) =>
    (...args: Args) => {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => func(...args), wait);
    };

  useEffect(
    () => () => {
      if (!timeout.current) return;
      clearTimeout(timeout.current);
    },
    [],
  );

  return { debounce };
};

export default useDebounce;
