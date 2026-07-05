import { useEffect, useState } from 'react';

const DESKTOP_QUERY = '(min-width: 1024px)';

export const useIsDesktop = () => {
  const getMatches = () => (
    typeof window !== 'undefined' ? window.matchMedia(DESKTOP_QUERY).matches : false
  );

  const [isDesktop, setIsDesktop] = useState(getMatches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY);
    const handleChange = () => setIsDesktop(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isDesktop;
};
