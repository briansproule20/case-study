'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Check } from 'lucide-react';
import { getUserPreferences, saveUserPreferences } from '@/lib/db';

interface ColorOption {
  name: string;
  hex: string;
}

// School Primary colors
const PRIMARY_COLORS: ColorOption[] = [
  { name: 'Gray', hex: '#6B7280' }, // Default Light Mode
  { name: 'Cream', hex: '#F5F5DC' }, // Default Dark Mode
  { name: 'Miami Orange', hex: '#F47321' },
  { name: 'Notre Dame Gold', hex: '#C99700' },
  { name: 'Michigan Blue', hex: '#00274C' },
  { name: 'USC Cardinal', hex: '#990000' },
  { name: 'UCLA Blue', hex: '#2D68C4' },
  { name: 'Texas Orange', hex: '#BF5700' },
  { name: 'Alabama Crimson', hex: '#9E1B32' },
  { name: 'Ohio State Scarlet', hex: '#BB0000' },
  { name: 'Florida Orange', hex: '#FA4616' },
  { name: 'Georgia Red', hex: '#BA0C2F' },
  { name: 'LSU Purple', hex: '#461D7C' },
  { name: 'Penn State Blue', hex: '#041E42' },
  { name: 'Oregon Green', hex: '#154733' },
  { name: 'Clemson Orange', hex: '#F66733' },
  { name: 'Auburn Orange', hex: '#E87722' },
  { name: 'Oklahoma Crimson', hex: '#841617' },
  { name: 'Nebraska Red', hex: '#E41C38' },
  { name: 'Wisconsin Red', hex: '#C41E3A' },
  { name: 'Harvard Crimson', hex: '#A51C30' },
  { name: 'Yale Blue', hex: '#00356B' },
  { name: 'Stanford Cardinal', hex: '#8C1515' },
  { name: 'Princeton Orange', hex: '#E77500' },
  { name: 'Penn Red', hex: '#95001A' },
  { name: 'Columbia Blue', hex: '#9BCBEB' },
  { name: 'Cornell Red', hex: '#B31B1B' },
  { name: 'Dartmouth Green', hex: '#00693E' },
  { name: 'Brown Brown', hex: '#4E3629' },
  { name: 'Duke Blue', hex: '#001A57' },
  { name: 'UNC Blue', hex: '#7BAFD4' },
  { name: 'Kentucky Blue', hex: '#0033A0' },
  { name: 'Tennessee Orange', hex: '#FF8200' },
  { name: 'Arizona Red', hex: '#CC0033' },
  { name: 'Washington Purple', hex: '#4B2E83' },
  { name: 'Colorado Gold', hex: '#CFB87C' },
  { name: 'Maryland Red', hex: '#E03A3E' },
  { name: 'Virginia Orange', hex: '#E57200' },
  { name: 'Syracuse Orange', hex: '#D44500' },
  { name: 'Boston College Maroon', hex: '#8A1538' },
];

// School Secondary colors
const SECONDARY_COLORS: ColorOption[] = [
  { name: 'Slate', hex: '#475569' }, // Default Light Mode
  { name: 'Very Light Gray', hex: '#E8E8E8' }, // Default Dark Mode
  { name: 'Miami Green', hex: '#005030' },
  { name: 'Notre Dame Blue', hex: '#0C2340' },
  { name: 'Michigan Maize', hex: '#FFCB05' },
  { name: 'USC Gold', hex: '#FFCC00' },
  { name: 'UCLA Gold', hex: '#FFD100' },
  { name: 'Ohio State Gray', hex: '#666666' },
  { name: 'Florida Blue', hex: '#0021A5' },
  { name: 'Georgia Black', hex: '#000000' },
  { name: 'LSU Gold', hex: '#FDD023' },
  { name: 'Oregon Yellow', hex: '#FEE123' },
  { name: 'Clemson Purple', hex: '#522D80' },
  { name: 'Auburn Blue', hex: '#03244D' },
  { name: 'Wisconsin Badger', hex: '#C5050C' },
  { name: 'Harvard Black', hex: '#1A1A1A' },
  { name: 'Princeton Black', hex: '#1C1C1C' },
  { name: 'Penn Blue', hex: '#01256E' },
  { name: 'Columbia Blue', hex: '#B9D9EB' },
  { name: 'Brown Red', hex: '#ED1C24' },
  { name: 'Duke Navy', hex: '#012169' },
  { name: 'Arizona Blue', hex: '#003366' },
  { name: 'Washington Gold', hex: '#B7A57A' },
  { name: 'Colorado Black', hex: '#2C2C2C' },
  { name: 'Maryland Gold', hex: '#FFD520' },
  { name: 'Virginia Navy', hex: '#232D4B' },
  { name: 'Syracuse Blue', hex: '#2E3192' },
  { name: 'Boston College Gold', hex: '#FFC72C' },
  { name: 'Texas A&M Maroon', hex: '#500000' },
  { name: 'Arkansas Red', hex: '#9D2235' },
  { name: 'South Carolina Garnet', hex: '#73000A' },
  { name: 'Mississippi State Maroon', hex: '#5D1725' },
  { name: 'Vanderbilt Gold', hex: '#866D4B' },
  { name: 'Missouri Gold', hex: '#F1B82D' },
  { name: 'Iowa Gold', hex: '#FFCD00' },
  { name: 'Minnesota Maroon', hex: '#7A0019' },
  { name: 'Northwestern Purple', hex: '#4E2A84' },
  { name: 'Rutgers Scarlet', hex: '#CE1141' },
  { name: 'Indiana Crimson', hex: '#7D110C' },
  { name: 'Purdue Gold', hex: '#CEB888' },
  { name: 'Illinois Orange', hex: '#E84A27' },
  { name: 'Michigan State Green', hex: '#18453B' },
  { name: 'Oregon State Orange', hex: '#DC4405' },
  { name: 'Washington State Crimson', hex: '#981E32' },
  { name: 'California Gold', hex: '#FDB515' },
  { name: 'Utah Red', hex: '#D62828' },
  { name: 'Kansas Blue', hex: '#0051BA' },
  { name: 'Kansas State Purple', hex: '#512888' },
  { name: 'Oklahoma State Orange', hex: '#FF7300' },
  { name: 'Texas Tech Red', hex: '#C8102E' },
  { name: 'Baylor Green', hex: '#003015' },
  { name: 'TCU Purple', hex: '#4D1979' },
  { name: 'West Virginia Gold', hex: '#EAAA00' },
  { name: 'Pittsburgh Gold', hex: '#FFB81C' },
  { name: 'NC State Red', hex: '#D31145' },
  { name: 'Louisville Red', hex: '#AD0000' },
  { name: 'Florida State Garnet', hex: '#782F40' },
  { name: 'Miami Orange Secondary', hex: '#F58220' },
];

export default function ThemePage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#6B7280');
  const [secondaryColor, setSecondaryColor] = useState('#475569');
  const [isSaving, setIsSaving] = useState(false);
  const [hasSavedScheme, setHasSavedScheme] = useState(false);

  // Check if dark mode is active
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Load preferences once on mount
  useEffect(() => {
    const loadPreferences = async () => {
      const prefs = await getUserPreferences();
      if (prefs) {
        const isLightDefaults = prefs.primaryColor === '#6B7280' && prefs.secondaryColor === '#475569';
        const isDarkDefaults = prefs.primaryColor === '#F5F5DC' && prefs.secondaryColor === '#E8E8E8';

        // Only load if it's NOT a default combination
        if (!isLightDefaults && !isDarkDefaults) {
          setHasSavedScheme(true);
          setPrimaryColor(prefs.primaryColor);
          setSecondaryColor(prefs.secondaryColor);
          applyPrimaryColor(prefs.primaryColor);
          applySecondaryColor(prefs.secondaryColor);
        }
      }
    };
    loadPreferences();
  }, []);

  // Update preview colors when dark mode changes (only if no saved scheme)
  useEffect(() => {
    if (!hasSavedScheme) {
      const defaultPrimary = isDarkMode ? '#F5F5DC' : '#6B7280';
      const defaultSecondary = isDarkMode ? '#E8E8E8' : '#475569';
      setPrimaryColor(defaultPrimary);
      setSecondaryColor(defaultSecondary);
      applyPrimaryColor(defaultPrimary);
      applySecondaryColor(defaultSecondary);
    }
  }, [isDarkMode, hasSavedScheme]);

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

  const applyPrimaryColor = (color: string) => {
    const oklch = hexToOklch(color);
    document.documentElement.style.setProperty('--primary', `oklch(${oklch})`);
    document.documentElement.style.setProperty('--ring', `oklch(${oklch})`);
    document.documentElement.style.setProperty('--chart-1', `oklch(${oklch})`);
    document.documentElement.style.setProperty('--sidebar-primary', `oklch(${oklch})`);
    document.documentElement.style.setProperty('--sidebar-ring', `oklch(${oklch})`);
  };

  const applySecondaryColor = (color: string) => {
    const oklch = hexToOklch(color);
    document.documentElement.style.setProperty('--secondary', `oklch(${oklch})`);
    document.documentElement.style.setProperty('--chart-2', `oklch(${oklch})`);
  };

  const selectPrimaryColor = (color: ColorOption) => {
    setPrimaryColor(color.hex);
    applyPrimaryColor(color.hex);
    // Don't mark as saved scheme yet - wait for explicit save
  };

  const selectSecondaryColor = (color: ColorOption) => {
    setSecondaryColor(color.hex);
    applySecondaryColor(color.hex);
    // Don't mark as saved scheme yet - wait for explicit save
  };

  const handleSave = async () => {
    // Check if colors are defaults - don't save if they are
    const isLightDefaults = primaryColor === '#6B7280' && secondaryColor === '#475569';
    const isDarkDefaults = primaryColor === '#F5F5DC' && secondaryColor === '#E8E8E8';

    if (isLightDefaults || isDarkDefaults) {
      // Just navigate back without saving defaults
      router.push('/');
      return;
    }

    setIsSaving(true);
    setHasSavedScheme(true);
    await saveUserPreferences(primaryColor, secondaryColor);
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  const handleReset = async () => {
    // Reset to defaults based on dark mode
    const defaultPrimary = isDarkMode ? '#F5F5DC' : '#6B7280';
    const defaultSecondary = isDarkMode ? '#E8E8E8' : '#475569';

    setPrimaryColor(defaultPrimary);
    setSecondaryColor(defaultSecondary);
    applyPrimaryColor(defaultPrimary);
    applySecondaryColor(defaultSecondary);
    setHasSavedScheme(false); // Clear saved scheme flag

    // Clear saved preferences from DB
    await saveUserPreferences(defaultPrimary, defaultSecondary);
  };

  const isDefaultScheme = () => {
    const isLightDefaults = primaryColor === '#6B7280' && secondaryColor === '#475569';
    const isDarkDefaults = primaryColor === '#F5F5DC' && secondaryColor === '#E8E8E8';
    return isLightDefaults || isDarkDefaults;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 space-y-4 sm:mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold sm:text-3xl">Theme Colors</h1>
              <p className="text-sm text-muted-foreground">
                Customize your app with school colors
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="flex-1 sm:flex-initial">
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              variant={isDefaultScheme() ? 'outline' : 'default'}
              className="flex-1 sm:flex-initial"
            >
              {isSaving ? 'Saving...' : isDefaultScheme() ? 'Return' : 'Save & Return'}
            </Button>
          </div>
        </div>

        {/* Color Preview */}
        <Card className="mb-6 p-4 sm:mb-8 sm:p-6">
          <h2 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">Preview</h2>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium">Primary</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {PRIMARY_COLORS.find((c) => c.hex === primaryColor)?.name}
                </span>
              </div>
              <div
                className="h-16 rounded-lg border-2 border-border sm:h-20"
                style={{ backgroundColor: primaryColor }}
              />
            </div>
            <div className="flex-1">
              <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium">Secondary</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {SECONDARY_COLORS.find((c) => c.hex === secondaryColor)?.name}
                </span>
              </div>
              <div
                className="h-16 rounded-lg border-2 border-border sm:h-20"
                style={{ backgroundColor: secondaryColor }}
              />
            </div>
          </div>
        </Card>

        {/* Primary Colors */}
        <Card className="mb-4 p-4 sm:mb-6 sm:p-6">
          <h2 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">Primary Colors</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6">
            {PRIMARY_COLORS.map((color) => (
              <button
                key={`primary-${color.hex}`}
                onClick={() => selectPrimaryColor(color)}
                className="group relative flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all hover:bg-accent sm:gap-2 sm:p-3"
              >
                <div
                  className={`h-14 w-14 rounded-lg border-2 transition-all sm:h-16 sm:w-16 ${
                    primaryColor === color.hex
                      ? 'border-primary ring-4 ring-primary/20'
                      : 'border-border'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
                {primaryColor === color.hex && (
                  <div className="absolute right-1 top-1 rounded-full bg-primary p-0.5 sm:right-2 sm:top-2 sm:p-1">
                    <Check className="h-2.5 w-2.5 text-primary-foreground sm:h-3 sm:w-3" />
                  </div>
                )}
                <span className="text-center text-[10px] font-medium leading-tight sm:text-xs">
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Secondary Colors */}
        <Card className="p-4 sm:p-6">
          <h2 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">Secondary Colors</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6">
            {SECONDARY_COLORS.map((color) => (
              <button
                key={`secondary-${color.hex}`}
                onClick={() => selectSecondaryColor(color)}
                className="group relative flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all hover:bg-accent sm:gap-2 sm:p-3"
              >
                <div
                  className={`h-14 w-14 rounded-lg border-2 transition-all sm:h-16 sm:w-16 ${
                    secondaryColor === color.hex
                      ? 'border-primary ring-4 ring-primary/20'
                      : 'border-border'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
                {secondaryColor === color.hex && (
                  <div className="absolute right-1 top-1 rounded-full bg-primary p-0.5 sm:right-2 sm:top-2 sm:p-1">
                    <Check className="h-2.5 w-2.5 text-primary-foreground sm:h-3 sm:w-3" />
                  </div>
                )}
                <span className="text-center text-[10px] font-medium leading-tight sm:text-xs">
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
