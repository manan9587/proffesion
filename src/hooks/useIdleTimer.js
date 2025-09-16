import { useState, useEffect, useRef } from 'react';

export const useIdleTimer = ({ onIdle, idleTime = 15 }) => {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutId = useRef();

  const startTimer = () => {
    timeoutId.current = setTimeout(() => {
      setIsIdle(true);
      onIdle();
    }, idleTime * 60 * 1000); // Convert minutes to milliseconds
  };

  const resetTimer = () => {
    clearTimeout(timeoutId.current);
    setIsIdle(false);
    startTimer();
  };

  const handleEvent = () => {
    resetTimer();
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    
    startTimer();

    events.forEach(event => {
      window.addEventListener(event, handleEvent);
    });

    return () => {
      clearTimeout(timeoutId.current);
      events.forEach(event => {
        window.removeEventListener(event, handleEvent);
      });
    };
  }, [onIdle, idleTime]);

  return isIdle;
};