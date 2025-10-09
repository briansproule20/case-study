import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BookOpen,
  Brain,
  FileText,
  GraduationCap,
  Library,
  Lightbulb,
  Search,
  ClipboardList,
  Layers
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      icon: FileText,
      title: 'Document Analysis',
      description: 'Upload readings, case briefs, scans, and images—let AI process and organize your legal materials.',
    },
    {
      icon: Brain,
      title: 'Practice Quizzes',
      description: 'Test your knowledge with AI-generated quizzes tailored to your study materials.',
    },
    {
      icon: BookOpen,
      title: 'Digital Flashcards',
      description: 'Master case law with intelligent flashcards that adapt to your learning pace.',
    },
    {
      icon: GraduationCap,
      title: 'Case Study Repository',
      description: 'Build a comprehensive library of legal cases and class materials in one place.',
    },
    {
      icon: Search,
      title: 'Issue Spotting',
      description: 'Practice with hypothetical test questions designed to sharpen your analytical skills.',
    },
    {
      icon: Lightbulb,
      title: 'Smart Study Tools',
      description: 'Memorization aids and study techniques powered by AI to maximize retention.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-1 items-center justify-center px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-background/95 to-background" />

        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 font-bold text-4xl tracking-tight sm:mb-6 sm:text-5xl md:text-6xl lg:text-7xl">
            Your
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {' '}Law School{' '}
            </span>
            and 
            <span className="bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent">
              {' '}Legal Study{' '}
            </span>
            Companion
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-balance text-base text-muted-foreground sm:mb-10 sm:text-lg md:text-xl">
            Transform how you study law. Upload your materials, generate practice questions,
            and master case law with AI-powered flashcards and issue spotting exercises.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link href="/chat">
              <Button size="lg" className="group gap-2">
                Chat Now
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/case-library">
              <Button size="lg" variant="secondary" className="gap-2">
                <Library className="size-4" />
                Case Library
              </Button>
            </Link>
            <Link href="/quizzes">
              <Button size="lg" variant="outline" className="gap-2">
                <ClipboardList className="size-4" />
                Practice Quizzes
              </Button>
            </Link>
            <Link href="/flash-cards" className="w-full sm:w-auto sm:basis-full sm:flex sm:justify-center">
              <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                <Layers className="size-4" />
                Flashcards
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-3xl tracking-tight">
              Everything You Need to Excel
            </h2>
            <p className="text-muted-foreground">
              Comprehensive tools designed for law school success
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-muted-foreground text-sm">
          <p>Built with Next.js, shadcn/ui, Merit System's Echo, Cursor, and Claude Code</p>
        </div>
      </footer>
    </div>
  );
}
