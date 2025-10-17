import { useEffect, useState, useCallback } from 'react';

export const useKeyboardHandler = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  const updateKeyboardState = useCallback((height: number) => {
    setKeyboardHeight(height);
    setIsKeyboardOpen(height > 100);
  }, []);

  // Handle iOS with Visual Viewport API
  useEffect(() => {
    if (!isIOS || !window.visualViewport) return;

    const visualViewport = window.visualViewport;
    
    const handleResize = () => {
      const heightDiff = window.innerHeight - visualViewport.height;
      updateKeyboardState(heightDiff);
    };

    visualViewport.addEventListener('resize', handleResize);
    visualViewport.addEventListener('scroll', handleResize);

    return () => {
      visualViewport.removeEventListener('resize', handleResize);
      visualViewport.removeEventListener('scroll', handleResize);
    };
  }, [isIOS, updateKeyboardState]);

  // Handle Android with resize events
  useEffect(() => {
    if (!isAndroid) return;

    let lastWindowHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDiff = lastWindowHeight - currentHeight;

      // Keyboard opens (height decreases significantly)
      if (heightDiff > 200) {
        updateKeyboardState(heightDiff);
      } 
      // Keyboard closes (height increases significantly)
      else if (heightDiff < -100 && keyboardHeight > 0) {
        updateKeyboardState(0);
      }

      lastWindowHeight = currentHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAndroid, keyboardHeight, updateKeyboardState]);

  // Handle focus/blur for fallback detection
  const handleFocus = useCallback(() => {
    if (keyboardHeight === 0) {
      // Estimate keyboard height if not detected
      updateKeyboardState(isIOS ? 300 : 280);
    }
  }, [keyboardHeight, isIOS, updateKeyboardState]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      updateKeyboardState(0);
    }, 100);
  }, [updateKeyboardState]);

  return {
    keyboardHeight,
    isKeyboardOpen,
    onInputFocus: handleFocus,
    onInputBlur: handleBlur
  };
};