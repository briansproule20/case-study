'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, Home, MessageSquare, BookOpen, HelpCircle, Layers, Target } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function MobileNav() {
  const [open, setOpen] = useState(false);

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
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0">
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-2">
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
        </nav>
      </SheetContent>
    </Sheet>
  );
}
