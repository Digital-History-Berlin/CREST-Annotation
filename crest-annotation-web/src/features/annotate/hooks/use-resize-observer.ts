import { RefObject, useEffect, useState } from "react";

export const useResizeObserver = (ref: RefObject<HTMLDivElement>) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  // observe element resize
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width: width, height });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
};
