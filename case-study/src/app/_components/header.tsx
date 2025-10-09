import { EchoAccount } from '@/components/echo-account-next';
import { isSignedIn } from '@/echo';
import type { FC } from 'react';
import { MobileNav } from './mobile-nav';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  title?: string;
  className?: string;
}

const Header: FC<HeaderProps> = async ({
  title = 'My App',
  className = '',
}) => {
  const signedIn = await isSignedIn();

  return (
    <header
      className={`border-b bg-background shadow-sm ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/icon.png"
              alt="Case Study Logo"
              width={32}
              height={32}
              className="rounded-sm"
            />
            <h1 className="font-semibold text-foreground text-xl">{title}</h1>
          </Link>

          <nav className="flex items-center gap-2">
            <EchoAccount />
            <MobileNav />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
