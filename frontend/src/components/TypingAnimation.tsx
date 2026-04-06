/**
 * Typing Animation Component
 * Simulates character-by-character display effect
 */
import React, { useState, useEffect } from 'react';
import './TypingAnimation.css';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  showCursor?: boolean;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  speed = 50,
  onComplete,
  className = '',
  showCursor = true,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let index = 0;
    setDisplayText('');
    setIsComplete(false);

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        if (onComplete) {
          onComplete();
        }
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return (
    <p className={`typing-text ${className}`}>
      {displayText}
      {showCursor && !isComplete && <span className="typing-cursor">|</span>}
    </p>
  );
};

export default TypingAnimation;
