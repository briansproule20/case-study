'use client';

import { EchoAccountButton } from '@/components/echo-account';
import { useEcho } from '@merit-systems/echo-react-sdk';
import { MobileNav } from './mobile-nav';
import { DarkModeToggle } from '@/components/dark-mode-toggle';
import Link from 'next/link';
import Image from 'next/image';
import type { FC } from 'react';

interface HeaderClientProps {
  title?: string;
  className?: string;
}

export const HeaderClient: FC<HeaderClientProps> = ({
  title = 'My App',
  className = '',
}) => {
  const echo = useEcho();

  return (
    <header className={`border-b bg-background shadow-sm ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/icon.png"
              alt="Case Study Logo"
              width={32}
              height={32}
              className="rounded-sm"
            />
            <h1 className="font-semibold text-foreground text-sm sm:text-xl whitespace-nowrap">{title}</h1>
          </Link>

          <nav className="flex items-center gap-2">
            <DarkModeToggle />
            <EchoAccountButton echo={echo} />
            <MobileNav />
          </nav>
        </div>
      </div>
    </header>
  );
};
