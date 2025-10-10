'use client';

import { useState, useEffect } from 'react';
import { Paintbrush } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getUserPreferences, saveUserPreferences } from '@/lib/db';

interface ColorPickerProps {
  onClose?: () => void;
}

interface ColorOption {
  name: string;
  hex: string;
}

// School Primary colors
const PRIMARY_COLORS: ColorOption[] = [
  { name: 'Gray', hex: '#6B7280' }, // Default Light Mode
  { name: 'Cream', hex: '#F5F5DC' }, // Default Dark Mode
  { name: 'Miami Orange', hex: '#F47321' },
  { name: 'Miami Green', hex: '#005030' },
  { name: 'ND Gold', hex: '#C99700' },
  { name: 'ND Blue', hex: '#0C2340' },
  { name: 'Michigan Blue', hex: '#00274C' },
  { name: 'Michigan Maize', hex: '#FFCB05' },
  { name: 'USC Cardinal', hex: '#990000' },
  { name: 'USC Gold', hex: '#FFCC00' },
  { name: 'UCLA Blue', hex: '#2D68C4' },
  { name: 'UCLA Gold', hex: '#FFD100' },
  { name: 'Texas Orange', hex: '#BF5700' },
  { name: 'Alabama Crimson', hex: '#9E1B32' },
  { name: 'Ohio State Scarlet', hex: '#BB0000' },
  { name: 'Ohio State Gray', hex: '#666666' },
  { name: 'Florida Orange', hex: '#FA4616' },
  { name: 'Florida Blue', hex: '#003087' },
  { name: 'Georgia Red', hex: '#BA0C2F' },
  { name: 'LSU Purple', hex: '#461D7C' },
  { name: 'LSU Gold', hex: '#FDD023' },
  { name: 'Penn State Blue', hex: '#041E42' },
  { name: 'Oregon Green', hex: '#154733' },
  { name: 'Oregon Yellow', hex: '#FEE123' },
  { name: 'Clemson Orange', hex: '#F66733' },
  { name: 'Clemson Purple', hex: '#522D80' },
  { name: 'Auburn Orange', hex: '#E87722' },
  { name: 'Auburn Blue', hex: '#03244D' },
  { name: 'Oklahoma Crimson', hex: '#841617' },
  { name: 'Nebraska Red', hex: '#E41C38' },
  { name: 'Wisconsin Red', hex: '#C5050C' },
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

export function ColorPicker({ onClose }: ColorPickerProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#6B7280');
  const [secondaryColor, setSecondaryColor] = useState('#475569');
  const [isOpen, setIsOpen] = useState(false);
  const [primaryOpen, setPrimaryOpen] = useState(false);
  const [secondaryOpen, setSecondaryOpen] = useState(false);
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
    // Convert hex to RGB (0-255)
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Convert RGB to linear RGB (0-1)
    const toLinear = (c: number) => {
      const val = c / 255;
      return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    };

    const rLinear = toLinear(r);
    const gLinear = toLinear(g);
    const bLinear = toLinear(b);

    // Convert linear RGB to XYZ (D65 illuminant)
    const x = rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375;
    const y = rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.0721750;
    const z = rLinear * 0.0193339 + gLinear * 0.1191920 + bLinear * 0.9503041;

    // Convert XYZ to OKLab
    const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
    const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
    const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);

    const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
    const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
    const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

    // Convert OKLab to OKLCH
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

  const selectPrimaryColor = async (color: ColorOption) => {
    const newPrimary = color.hex;
    setPrimaryColor(newPrimary);
    applyPrimaryColor(newPrimary);

    // Check if the new combination is defaults
    const isLightDefaults = newPrimary === '#6B7280' && secondaryColor === '#475569';
    const isDarkDefaults = newPrimary === '#F5F5DC' && secondaryColor === '#E8E8E8';

    if (!isLightDefaults && !isDarkDefaults) {
      setHasSavedScheme(true);
      await saveUserPreferences(newPrimary, secondaryColor);
    } else {
      setHasSavedScheme(false);
      // Don't save defaults
    }
    setPrimaryOpen(false);
  };

  const selectSecondaryColor = async (color: ColorOption) => {
    const newSecondary = color.hex;
    setSecondaryColor(newSecondary);
    applySecondaryColor(newSecondary);

    // Check if the new combination is defaults
    const isLightDefaults = primaryColor === '#6B7280' && newSecondary === '#475569';
    const isDarkDefaults = primaryColor === '#F5F5DC' && newSecondary === '#E8E8E8';

    if (!isLightDefaults && !isDarkDefaults) {
      setHasSavedScheme(true);
      await saveUserPreferences(primaryColor, newSecondary);
    } else {
      setHasSavedScheme(false);
      // Don't save defaults
    }
    setSecondaryOpen(false);
  };

  const resetColors = async () => {
    // Reset to defaults based on dark mode
    const defaultPrimary = isDarkMode ? '#F5F5DC' : '#6B7280';
    const defaultSecondary = isDarkMode ? '#E8E8E8' : '#475569';

    setPrimaryColor(defaultPrimary);
    setSecondaryColor(defaultSecondary);
    applyPrimaryColor(defaultPrimary);
    applySecondaryColor(defaultSecondary);
    setHasSavedScheme(false);

    await saveUserPreferences(defaultPrimary, defaultSecondary);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent">
        <Paintbrush className="size-5 text-muted-foreground transition-colors group-hover:text-foreground" />
        <span className="font-medium">Theme Colors</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 py-2">
        <div className="space-y-4 rounded-lg border bg-card p-4">
          {/* Primary Color Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Primary Color</label>
            <Popover open={primaryOpen} onOpenChange={setPrimaryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                >
                  <div
                    className="h-6 w-6 rounded border border-border"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span className="flex-1 text-left font-mono text-xs">
                    {PRIMARY_COLORS.find(c => c.hex === primaryColor)?.name || primaryColor}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start" side="left" sideOffset={8}>
                <div className="p-4 pb-2">
                  <p className="text-sm font-semibold">Select Primary Color</p>
                </div>
                <ScrollArea className="h-[500px]">
                  <div className="grid grid-cols-4 gap-2 p-4 pt-2">
                    {PRIMARY_COLORS.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => selectPrimaryColor(color)}
                        className="group flex flex-col items-center gap-1.5 rounded-md p-2 transition-colors hover:bg-accent"
                        title={color.name}
                      >
                        <div
                          className={`h-12 w-12 rounded border-2 transition-all ${
                            primaryColor === color.hex ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-[9px] font-medium text-muted-foreground group-hover:text-foreground text-center leading-tight line-clamp-2">
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          {/* Secondary Color Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Secondary Color</label>
            <Popover open={secondaryOpen} onOpenChange={setSecondaryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                >
                  <div
                    className="h-6 w-6 rounded border border-border"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <span className="flex-1 text-left font-mono text-xs">
                    {SECONDARY_COLORS.find(c => c.hex === secondaryColor)?.name || secondaryColor}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start" side="left" sideOffset={8}>
                <div className="p-4 pb-2">
                  <p className="text-sm font-semibold">Select Secondary Color</p>
                </div>
                <ScrollArea className="h-[500px]">
                  <div className="grid grid-cols-4 gap-2 p-4 pt-2">
                    {SECONDARY_COLORS.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => selectSecondaryColor(color)}
                        className="group flex flex-col items-center gap-1.5 rounded-md p-2 transition-colors hover:bg-accent"
                        title={color.name}
                      >
                        <div
                          className={`h-12 w-12 rounded border-2 transition-all ${
                            secondaryColor === color.hex ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-[9px] font-medium text-muted-foreground group-hover:text-foreground text-center leading-tight line-clamp-2">
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          {/* Reset Button */}
          <Button
            onClick={resetColors}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Reset to Default
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
