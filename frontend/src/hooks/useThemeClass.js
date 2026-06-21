import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export const useThemeClass = () => {
  const mode = useSelector((state) => state.theme.mode);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);
};
