import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";

export function useDismissablePopover<T extends HTMLElement = HTMLDivElement>(
  isOpen: boolean,
  setIsOpen: Dispatch<SetStateAction<boolean>>,
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!isOpen) return;

    const dismissOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [isOpen, setIsOpen]);

  return containerRef;
}
