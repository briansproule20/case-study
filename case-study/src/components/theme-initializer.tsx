'use client';

import { useEffect } from 'react';
import { getUserPreferences, getUserDarkModePreference } from '@/lib/db';

export function ThemeInitializer() {
  useEffect(() => {
    const initializeTheme = async () => {
      // Apply dark mode preference
      const darkMode = await getUserDarkModePreference();
      if (darkMode) {
        document.documentElement.classList.add('dark');
      }

      // Apply color preferences
      const prefs = await getUserPreferences();
      if (prefs) {
        const isLightDefaults = prefs.primaryColor === '#6B7280' && prefs.secondaryColor === '#475569';
        const isDarkDefaults = prefs.primaryColor === '#F5F5DC' && prefs.secondaryColor === '#E8E8E8';

        // Only apply saved colors if they're NOT defaults
        if (!isLightDefaults && !isDarkDefaults) {
          const hexToOklch = (hex: string): string => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);

            const toLinear = (c: number) => {
              const val = c / 255;
              return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
            };

            const rLinear = toLinear(r);
            const gLinear = toLinear(g);
            const bLinear = toLinear(b);

            const x = rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375;
            const y = rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.0721750;
            const z = rLinear * 0.0193339 + gLinear * 0.1191920 + bLinear * 0.9503041;

            const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
            const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
            const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);

            const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
            const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
            const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

            const C = Math.sqrt(a * a + b_ * b_);
            let H = Math.atan2(b_, a) * (180 / Math.PI);
            if (H < 0) H += 360;

            return `${L.toFixed(4)} ${C.toFixed(4)} ${H.toFixed(2)}`;
          };

          const primaryOklch = hexToOklch(prefs.primaryColor);
          const secondaryOklch = hexToOklch(prefs.secondaryColor);

          document.documentElement.style.setProperty('--primary', `oklch(${primaryOklch})`);
          document.documentElement.style.setProperty('--ring', `oklch(${primaryOklch})`);
          document.documentElement.style.setProperty('--chart-1', `oklch(${primaryOklch})`);
          document.documentElement.style.setProperty('--sidebar-primary', `oklch(${primaryOklch})`);
          document.documentElement.style.setProperty('--sidebar-ring', `oklch(${primaryOklch})`);
          document.documentElement.style.setProperty('--secondary', `oklch(${secondaryOklch})`);
          document.documentElement.style.setProperty('--chart-2', `oklch(${secondaryOklch})`);
        }
      }
    };

    initializeTheme();
  }, []);

  return null;
}
