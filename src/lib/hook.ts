/**
 * Gets bounding boxes for an element. This is implemented for you
 */
import { useEffect, useState } from "react";

export function getElementBounds(elem: HTMLElement) {
  const bounds = elem.getBoundingClientRect();
  const top = bounds.top + window.scrollY;
  const left = bounds.left + window.scrollX;

  return {
    x: left,
    y: top,
    top,
    left,
    width: bounds.width,
    height: bounds.height,
  };
}

/**
 * **TBD:** Implement a function that checks if a point is inside an element
 */
export function isPointInsideElement(
  coordinate: { x: number; y: number },
  element: HTMLElement,
): boolean {
  const bounds = getElementBounds(element);

  return (
    coordinate.x >= bounds.left &&
    coordinate.x <= bounds.left + bounds.width &&
    coordinate.y >= bounds.top &&
    coordinate.y <= bounds.top + bounds.height
  );
}

/**
 * **TBD:** Implement a function that returns the height of the first line of text in an element
 * We will later use this to size the HTML element that contains the hover player
 */
export function getLineHeightOfFirstLine(element: HTMLElement): number {
  const computedStyle = window.getComputedStyle(element);
  const lineHeight = computedStyle.lineHeight;

  // If line-height is 'normal', calculate it based on font-size
  if (lineHeight === "normal") {
    const fontSize = parseFloat(computedStyle.fontSize);
    // Normal line-height is typically 1.2 to 1.3 times the font size
    return Math.floor(fontSize * 1.3);
  }

  // If line-height is a number with 'px', parse it directly
  if (lineHeight.endsWith("px")) {
    return parseFloat(lineHeight);
  }

  // If line-height is a unitless number, multiply by font size
  if (!isNaN(parseFloat(lineHeight))) {
    const fontSize = parseFloat(computedStyle.fontSize);
    return Math.floor(fontSize * parseFloat(lineHeight));
  }

  // Fallback: use font-size as line height
  return parseFloat(computedStyle.fontSize);
}

export type HoveredElementInfo = {
  element: HTMLElement;
  top: number;
  left: number;
  heightOfFirstLine: number;
};

/**
 * **TBD:** Implement a React hook to be used to help to render hover player
 * Return the absoluterdinates on where to render the hover player
 * Returns null when there is no active hovered paragraph
 * Note: If using global event listeners, attach them window instead of document to ensure tests pass
 */
export function useHoveredParagraphCoordinate(
  parsedElements: HTMLElement[],
): HoveredElementInfo | null {
  const [coordinate, setCoordinate] = useState<HoveredElementInfo | null>(null);
  const [currentHighlightedElement, setCurrentHighlightedElement] =
    useState<HTMLElement | null>(null);

  // Helper function to highlight an element
  const highlightElement = (element: HTMLElement) => {
    // Clear previous highlight
    if (currentHighlightedElement) {
      currentHighlightedElement.classList.remove("speechify-hover-highlight");
    }

    // Add highlight to new element
    element.classList.add("speechify-hover-highlight");
    setCurrentHighlightedElement(element);
  };

  // Helper function to clear highlighting
  const clearHighlight = () => {
    if (currentHighlightedElement) {
      currentHighlightedElement.classList.remove("speechify-hover-highlight");
      setCurrentHighlightedElement(null);
    }
  };

  useEffect(() => {
    // Set up individual listeners for each parsed element
    const elementListeners: Array<{
      element: HTMLElement;
      enter: () => void;
      leave: (event: MouseEvent) => void;
    }> = [];

    parsedElements.forEach((element) => {
      const handleMouseEnter = () => {
        highlightElement(element);

        const bounds = getElementBounds(element);
        const heightOfFirstLine = getLineHeightOfFirstLine(element);

        setCoordinate({
          element,
          top: bounds.top,
          left: bounds.left,
          heightOfFirstLine,
        });
      };

      const handleMouseLeave = (event: MouseEvent) => {
        const relatedTarget = event.relatedTarget as HTMLElement;

        // Don't clear if moving to the hover player
        if (relatedTarget && relatedTarget.closest("[data-hover-player]")) {
          return;
        }

        // Don't clear if moving to another parsed element
        if (
          relatedTarget &&
          parsedElements.some((el) => el.contains(relatedTarget))
        ) {
          return;
        }

        // Use a small timeout to prevent flickering
        setTimeout(() => {
          // Double-check if we're not hovering over the play button
          const currentElement = document.querySelector(
            "[data-hover-player]:hover",
          );
          if (!currentElement) {
            clearHighlight();
            setCoordinate(null);
          }
        }, 10);
      };

      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);

      elementListeners.push({
        element,
        enter: handleMouseEnter,
        leave: handleMouseLeave,
      });
    });

    // Cleanup function
    return () => {
      elementListeners.forEach(({ element, enter, leave }) => {
        element.removeEventListener("mouseenter", enter);
        element.removeEventListener("mouseleave", leave);
      });
      clearHighlight();
    };
  }, [parsedElements, currentHighlightedElement]);

  // Add a window-level mouseout listener as a safety net
  useEffect(() => {
    const handleWindowMouseOut = (event: MouseEvent) => {
      // Only clear if mouse is leaving the window entirely
      if (!event.relatedTarget || event.relatedTarget === null) {
        clearHighlight();
        setCoordinate(null);
      }
    };

    window.addEventListener("mouseout", handleWindowMouseOut);

    return () => {
      window.removeEventListener("mouseout", handleWindowMouseOut);
    };
  }, []);

  return coordinate;
}
