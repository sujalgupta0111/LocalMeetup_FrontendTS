import { useEffect, useState } from "react";

type TextStreamerProps = {
  text?: string;
  transitionTime?: number;
  isRepeat?: boolean;
  repeatDelay?: number;
};

const TextStreamer = ({
  text = "",
  transitionTime = 1000,
  isRepeat = false,
  repeatDelay = 4000,
}: TextStreamerProps) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (!text) {
      const resetFrameId = requestAnimationFrame(() => setDisplayText(""));
      return () => cancelAnimationFrame(resetFrameId);
    }

    let animationFrameId: number;
    let repeatTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let startTime: number | null = null;

    const stream = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const elapsedTime = timestamp - startTime;

      // 0 → 1 progress
      const progress = Math.min(
        elapsedTime / transitionTime,
        1
      );

      // Calculate how many characters should be visible
      const visibleCharacters = Math.floor(
        progress * text.length
      );

      setDisplayText(
        text.slice(0, visibleCharacters)
      );

      // Animation complete
      if (progress < 1) {
        animationFrameId =
          requestAnimationFrame(stream);
      } else if (isRepeat) {
        // Wait before starting again
        repeatTimeoutId = setTimeout(() => {
          startTime = null;
          animationFrameId =
            requestAnimationFrame(stream);
        }, repeatDelay);
      }
    };

    // Start animation
    animationFrameId =
      requestAnimationFrame(stream);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(repeatTimeoutId);
    };
  }, [text, transitionTime, isRepeat, repeatDelay]);

 return (
    <span className="relative inline-block">
      
      {/* Invisible text reserves space */}
      <span className="invisible">
        {text}
      </span>

      {/* Animated text */}
      <span className="absolute left-0 top-0">
        {displayText}
      </span>

    </span>
  );
};

export default TextStreamer;