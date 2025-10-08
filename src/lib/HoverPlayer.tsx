import { useState } from "react";
import { useHoveredParagraphCoordinate } from "./hook";
import { speechify } from "./play";

// This is a simple play button SVG that you can use in your hover player
const PlayButton = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    id="play-icon"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      cursor: "pointer",
      background: "#6B78FC",
      borderRadius: "50%",
    }}
    {...props}
  >
    <path
      d="M16.3711 11.3506C16.8711 11.6393 16.8711 12.361 16.3711 12.6497L10.3711 16.1138C9.87109 16.4024 9.24609 16.0416 9.24609 15.4642L9.24609 8.53603C9.24609 7.95868 9.87109 7.59784 10.3711 7.88651L16.3711 11.3506Z"
      fill="white"
    />
  </svg>
);

/**
 * **TBD:**
 * Implement a hover player that appears next to the paragraph when the user hovers over it
 * The hover player should contain a play button that when clicked, should play the text of the paragraph
 * This component should make use of the useHoveredParagraphCoordinate hook to get information about the hovered paragraph
 */

interface HoverPlayerProps {
  parsedElements: HTMLElement[];
}
export default function HoverPlayer({ parsedElements }: HoverPlayerProps) {
  const coordinate = useHoveredParagraphCoordinate(parsedElements);
  const [isPlaying, setIsPlaying] = useState(false);

  // check for no elements
  if (!coordinate) return null;

  const handlePlay = async () => {
    if (!coordinate?.element) return;

    try {
      setIsPlaying(true);
      speechify(coordinate.element);

      // Listen for speech end to reset state
      window.speechSynthesis.addEventListener("end", () => {
        setIsPlaying(false);
      });
    } catch (error) {
      console.error("Failed to play speech:", error);
      setIsPlaying(false);
    }
  };

  return (
    <div
      data-hover-player="true"
      style={{
        position: "absolute",
        top: coordinate.top,
        left: coordinate.left - 60, // offset more to avoid overlap
        height: coordinate.heightOfFirstLine,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "12px",
        padding: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        border: "1px solid rgba(107, 120, 252, 0.3)",
      }}
      onMouseEnter={() => {
        // Prevent any clearing while hovering the button
      }}
      onMouseLeave={(event) => {
        // Only allow clearing if not moving back to the paragraph
        const relatedTarget = event.relatedTarget as HTMLElement;
        if (!relatedTarget || !coordinate.element.contains(relatedTarget)) {
          // Let the hook handle the cleanup with a delay
        }
      }}
    >
      <div
        style={{
          backgroundColor: "#6B78FC",
          borderRadius: "50%",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: isPlaying ? "not-allowed" : "pointer",
          opacity: isPlaying ? 0.7 : 1,
          transition: "all 0.2s ease",
        }}
        onClick={handlePlay}
        onMouseEnter={(e) => {
          if (!isPlaying) {
            e.currentTarget.style.backgroundColor = "#5a67e8";
            e.currentTarget.style.transform = "scale(1.1)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#6B78FC";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <PlayButton
          style={{
            background: "none",
          }}
        />
      </div>
    </div>
  );
}
