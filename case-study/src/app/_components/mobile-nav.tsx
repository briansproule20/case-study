'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, Home, MessageSquare, BookOpen, HelpCircle, Layers, Target, FileText, Info, Archive, Paintbrush } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { EchoAccountButton } from '@/components/echo-account';
import { useEcho } from '@merit-systems/echo-react-sdk';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const echo = useEcho();

  const menuItems = [
    {
      title: 'Home',
      href: '/',
      icon: Home,
    },
    {
      title: 'Chat',
      href: '/chat',
      icon: MessageSquare,
    },
    {
      title: 'Case Library',
      href: '/case-library',
      icon: BookOpen,
    },
    {
      title: 'Quizzes',
      href: '/quizzes',
      icon: HelpCircle,
    },
    {
      title: 'Flash Cards',
      href: '/flash-cards',
      icon: Layers,
    },
    {
      title: 'Issue Spotting',
      href: '/issue-spotting',
      icon: Target,
    },
    {
      title: 'Document Analysis',
      href: '/document-analysis',
      icon: FileText,
    },
    {
      title: 'Saved Artifacts',
      href: '/saved-artifacts',
      icon: Archive,
    },
    {
      title: 'FAQ',
      href: '/faq',
      icon: Info,
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0">
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="mt-4 flex flex-col gap-2 overflow-y-auto flex-1 pr-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent"
              >
                <Icon className="size-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
          <div className="mt-4 space-y-3 border-t pt-4">
            <div className="px-3">
              <EchoAccountButton echo={echo} />
            </div>
            <Link
              href="/theme"
              onClick={() => setOpen(false)}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent"
            >
              <Paintbrush className="size-5 text-muted-foreground transition-colors group-hover:text-foreground" />
              <span className="font-medium">Theme Colors</span>
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
