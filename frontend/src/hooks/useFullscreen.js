import { useEffect } from 'react';

/**
 * Hook to handle orientation changes
 * Scrolls to top on orientation change to fix viewport issues
 */
export function useFullscreen() {
  useEffect(() => {
    // Handle orientation changes
    const handleOrientationChange = () => {
      // Small delay to ensure proper reflow after orientation change
      setTimeout(() => {
        // Scroll to top to fix any viewport glitches
        window.scrollTo(0, 0);
      }, 100);
    };

    // Listen to orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);
}

export default useFullscreen;
