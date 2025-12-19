import { useEffect } from 'react';

/**
 * Hook to handle fullscreen behavior and orientation changes
 * Prevents black bars and status bar issues on mobile devices
 */
export function useFullscreen() {
  useEffect(() => {
    // Handle orientation changes
    const handleOrientationChange = () => {
      // Force a repaint to fix black bar issues
      document.body.style.height = '100vh';
      document.body.style.height = '100dvh';

      // Small delay to ensure proper reflow
      setTimeout(() => {
        window.scrollTo(0, 0);

        // Try to enter fullscreen if not already
        if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {
            // Fullscreen request failed, that's okay
          });
        }
      }, 100);
    };

    // Listen to both orientation and resize events
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    // Also handle when the app becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        handleOrientationChange();
      }
    });

    // Initial setup
    handleOrientationChange();

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);
}

export default useFullscreen;
