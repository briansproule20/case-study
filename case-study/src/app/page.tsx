import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BookOpen,
  Brain,
  FileText,
  GraduationCap,
  Lightbulb,
  Search
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
      <section className="relative flex flex-1 items-center justify-center px-6 py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-background/95 to-background" />

        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center rounded-full border bg-background/60 px-4 py-1.5 text-sm backdrop-blur-sm">
            <GraduationCap className="mr-2 size-4 text-primary" />
            <span className="text-muted-foreground">Legal Study Aide</span>
          </div>

          <h1 className="mb-6 font-bold text-5xl tracking-tight sm:text-6xl md:text-7xl">
            Your AI-Powered
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {' '}Law School{' '}
            </span>
            Companion
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
            Transform how you study law. Upload your materials, generate practice questions,
            and master case law with AI-powered flashcards and issue spotting exercises.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/chat">
              <Button size="lg" className="group gap-2">
                Get Started
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/chat">
              <Button size="lg" variant="secondary" className="gap-2">
                <BookOpen className="size-4" />
                Start Studying
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
