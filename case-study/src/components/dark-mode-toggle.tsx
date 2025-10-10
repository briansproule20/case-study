'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getUserDarkModePreference, saveDarkModePreference } from '@/lib/db';

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadPreference = async () => {
      const preference = await getUserDarkModePreference();
      if (preference !== null) {
        setIsDark(preference);
        applyDarkMode(preference);
      }
    };
    loadPreference();
  }, []);

  const applyDarkMode = (isDarkMode: boolean) => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = async () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    applyDarkMode(newIsDark);
    await saveDarkModePreference(newIsDark);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="shrink-0">
        <div className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      className="shrink-0"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
