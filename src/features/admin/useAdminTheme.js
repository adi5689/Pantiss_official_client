import { useEffect, useState } from 'react';
export function useAdminTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('pantiss-admin-theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('pantiss-admin-theme', theme);
    } catch {/* A blocked preference store must not block the workspace. */}
  }, [theme]);
  return [theme, setTheme];
}
