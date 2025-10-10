'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, ExternalLink, Coins, Code, Zap, Server, Brain, RocketIcon } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col p-6 sm:p-8">
      <div className="flex h-full min-h-0 flex-col overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <HelpCircle className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-3xl tracking-tight">Frequently Asked Questions</h1>
              <p className="text-muted-foreground mt-1">
                Learn about Case Study, Echo, and Merit Systems
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 pb-8">
          {/* Getting Started - First! */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RocketIcon className="size-5" />
                Getting Started
              </CardTitle>
              <CardDescription>
                Start using Case Study in minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="how-to-start">
                  <AccordionTrigger className="text-left">
                    How do I get started?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Getting started is simple:
                    <ol className="space-y-2 ml-4 list-decimal mt-3">
                      <li>Click the <strong>account button</strong> in the top right corner</li>
                      <li>Sign in with <strong>Echo</strong> using your Google account (or create a free Echo account)</li>
                      <li>Add credits to your Echo account for pay-per-use features</li>
                      <li>Start using Case Study immediately—no subscription required!</li>
                    </ol>
                    <p className="mt-3 text-sm bg-muted/50 p-3 rounded-lg border">
                      <strong>Note:</strong> Echo authentication uses your Google account for quick, secure sign-in.
                      No need to create yet another username and password!
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href="https://echo.merit.systems/dashboard"
                        target="_blank"
                        className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1"
                      >
                        Go to Echo Dashboard <ExternalLink className="size-3" />
                      </Link>
                      <Link
                        href="/"
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        Back to Home
                      </Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="pricing">
                  <AccordionTrigger className="text-left">
                    How much does it cost?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Case Study uses a <strong>pay-per-use</strong> model instead of a monthly subscription. You only pay
                    for what you use—charged per AI invocation (identical to how all LLM providers work with tokens, but more transparent).
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg border">
                      <p className="font-semibold text-sm mb-1">💰 Typical Costs:</p>
                      <p className="text-sm">
                        Each AI invocation typically costs just <strong>pennies</strong> (a few cents). For example:
                        analyzing a document, generating a 10-question quiz, or getting help with issue spotting
                        usually costs <strong>$0.02-$0.10</strong> depending on complexity and length.
                      </p>
                    </div>
                    <div className="mt-3">
                      <p className="font-semibold">This means:</p>
                      <ul className="space-y-2 ml-4 list-disc mt-2">
                        <li>Use it heavily during exam prep without breaking the bank</li>
                        <li>Pay nothing during breaks</li>
                        <li>No wasted subscription fees for months you don't use it</li>
                        <li>Complete control over spending—see costs in real-time</li>
                      </ul>
                    </div>
                    <p className="mt-3">
                      Simply add credits to your Echo account (like adding $5 or $10) and start using features immediately.
                      Your credits never expire, so you can use them whenever you need them.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* About Case Study */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="size-5" />
                About Case Study
              </CardTitle>
              <CardDescription>
                Your AI-powered legal study companion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="what-is-case-study">
                  <AccordionTrigger className="text-left">
                    What is Case Study?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Case Study is an AI-powered legal study platform designed specifically for law students and legal professionals.
                    It transforms how you study law by offering tools like document analysis, practice quizzes, flashcard generation,
                    issue spotting exercises, and a comprehensive case library. Upload your materials and let AI help you master
                    legal concepts, case law, and exam preparation.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="features">
                  <AccordionTrigger className="text-left">
                    What features does Case Study offer?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    <ul className="space-y-2 ml-4 list-disc">
                      <li><strong>Document Analysis:</strong> Upload and analyze legal documents with AI-powered summaries and insights</li>
                      <li><strong>Practice Quizzes:</strong> Generate custom multiple-choice quizzes (5, 10, 15, or 20 questions) with immediate feedback</li>
                      <li><strong>Flashcards:</strong> Automatically create flashcards from your study materials</li>
                      <li><strong>Issue Spotting:</strong> Practice identifying legal issues with an interactive AI coach</li>
                      <li><strong>Case Library:</strong> Search millions of legal cases from Court Listener</li>
                      <li><strong>Legal Chat:</strong> Get help with assignments and legal concepts through conversational AI</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-it-works">
                  <AccordionTrigger className="text-left">
                    How does Case Study work?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Case Study leverages Claude AI (Anthropic's advanced language model) to analyze your uploaded legal materials—PDFs,
                    Word documents, images, and more. The platform can summarize documents, identify legal issues, generate custom quizzes
                    with explanations, create flashcards for key terms and concepts, and provide guided issue spotting practice with
                    interactive feedback. Each feature is designed to help you learn more effectively and prepare for exams.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* AI Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="size-5" />
                AI Models & Capabilities
              </CardTitle>
              <CardDescription>
                Claude, OpenAI, and what our LLMs can (and can't) do
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="ai-models">
                  <AccordionTrigger className="text-left">
                    Which AI models does Case Study use?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Case Study primarily uses <strong>Claude Sonnet 4</strong> (by Anthropic) as the default model, with
                    <strong> OpenAI GPT-4</strong> available as an alternative for certain features. We prefer Claude because:
                    <ul className="space-y-2 ml-4 list-disc mt-3">
                      <li><strong>Superior reasoning:</strong> Excellent at complex legal analysis and nuanced understanding</li>
                      <li><strong>Longer context:</strong> Can process larger documents and maintain context better</li>
                      <li><strong>Better instruction-following:</strong> More reliable at generating structured outputs like quizzes</li>
                      <li><strong>Thoughtful responses:</strong> Provides well-reasoned explanations ideal for learning</li>
                    </ul>
                    <p className="mt-3">
                      OpenAI models are available where speed or specific capabilities are preferred.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ai-strengths">
                  <AccordionTrigger className="text-left">
                    What are the AI's strengths?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Our AI models excel at:
                    <ul className="space-y-2 ml-4 list-disc mt-3">
                      <li><strong>Document Analysis:</strong> Summarizing legal documents, extracting key points, and identifying issues</li>
                      <li><strong>Question Generation:</strong> Creating relevant, challenging multiple-choice questions from materials</li>
                      <li><strong>Explanation:</strong> Providing clear, detailed explanations of legal concepts and principles</li>
                      <li><strong>Issue Spotting Coaching:</strong> Guiding you through fact patterns with Socratic questioning</li>
                      <li><strong>Case Law Understanding:</strong> Analyzing case holdings, reasoning, and applications</li>
                      <li><strong>Study Material Creation:</strong> Generating flashcards, outlines, and practice problems</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ai-limitations">
                  <AccordionTrigger className="text-left">
                    What are the AI's limitations?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    While powerful, our AI has important limitations:
                    <ul className="space-y-2 ml-4 list-disc mt-3">
                      <li><strong>Not a lawyer:</strong> Cannot provide legal advice or replace professional legal counsel</li>
                      <li><strong>Knowledge cutoff:</strong> Training data ends in early 2025; may not know very recent cases or laws</li>
                      <li><strong>Hallucinations:</strong> Can occasionally generate incorrect information confidently—always verify important details</li>
                      <li><strong>No real-time data:</strong> Cannot access current databases or live legal information</li>
                      <li><strong>Jurisdiction specifics:</strong> May not perfectly capture nuances of all jurisdictions</li>
                      <li><strong>Not exam-specific:</strong> Doesn't know your professor's preferences or exam format</li>
                    </ul>
                    <p className="mt-3 font-semibold">
                      Always use Case Study as a study aid to supplement—not replace—your course materials, professor guidance, and critical thinking.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="model-selection">
                  <AccordionTrigger className="text-left">
                    Can I choose which AI model to use?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Currently, most features default to Claude Sonnet 4 for optimal performance. Some features may automatically
                    use OpenAI models when advantageous. We're constantly evaluating model performance and may add manual model
                    selection in future updates based on user feedback and use cases.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* About Echo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="size-5" />
                About Echo
              </CardTitle>
              <CardDescription>
                The platform powering Case Study's AI features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="what-is-echo">
                  <AccordionTrigger className="text-left">
                    What is Echo?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Echo is Merit Systems' platform that enables developers to monetize AI applications in minutes. It provides
                    the infrastructure for pay-per-use AI apps, handling authentication, payment processing, API management, and
                    usage tracking. Echo makes it simple for developers to build and deploy AI-powered applications without worrying
                    about complex billing systems or user management.
                    <div className="mt-3">
                      <Link
                        href="https://echo.merit.systems/dashboard"
                        target="_blank"
                        className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-medium"
                      >
                        Visit Echo Dashboard <ExternalLink className="size-3" />
                      </Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="echo-credits">
                  <AccordionTrigger className="text-left">
                    How do Echo credits work?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Echo uses a credit-based system where you purchase credits upfront and they're consumed as you use AI features.
                    Each AI interaction (like generating a quiz or analyzing a document) costs a small amount of credits based on
                    the computational resources used. This model is identical to how all LLM providers charge—you pay per token—but
                    Echo makes it transparent and gives you direct control. No surprise bills, no monthly subscriptions you're not using.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="echo-features">
                  <AccordionTrigger className="text-left">
                    What can I do with Echo?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    With Echo, you can:
                    <ul className="space-y-2 ml-4 list-disc mt-3">
                      <li>Create an account to access AI-powered apps like Case Study</li>
                      <li>Add credits to your account for pay-per-use services</li>
                      <li>Track your usage and activity across all Echo-powered apps</li>
                      <li>Manage API keys if you're building your own AI applications</li>
                      <li>Access your dashboard to monitor spending and app usage</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="echo-security">
                  <AccordionTrigger className="text-left">
                    Is Echo secure and safe to use?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Yes, Echo is built with security as a top priority:
                    <ul className="space-y-2 ml-4 list-disc mt-3">
                      <li><strong>Secure Authentication:</strong> Industry-standard OAuth and authentication protocols</li>
                      <li><strong>Encrypted Communications:</strong> All data transmitted between your browser and Echo is encrypted with HTTPS/TLS</li>
                      <li><strong>Payment Security:</strong> Credit purchases are processed through secure payment providers</li>
                      <li><strong>API Key Protection:</strong> API keys are stored securely and can be revoked at any time</li>
                      <li><strong>Privacy-Focused:</strong> Your usage data is kept private and never sold to third parties</li>
                      <li><strong>Transparent Billing:</strong> Clear, real-time tracking of credit usage with no hidden fees</li>
                    </ul>
                    <p className="mt-3">
                      Echo is operated by Merit Systems, a company focused on building trustworthy infrastructure for the developer community.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* About Merit Systems */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="size-5" />
                About Merit Systems
              </CardTitle>
              <CardDescription>
                The company behind Echo and the open-source revolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="what-is-merit">
                  <AccordionTrigger className="text-left">
                    What is Merit Systems?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Merit Systems is a financial platform revolutionizing open-source software development by creating tools to
                    enable a new economy for open-source projects. Their mission is to solve critical challenges in contributor
                    engagement, compensation, and project sustainability. Merit provides the simplest way for open-source projects
                    to pay contributors directly, helping attract top developers and build thriving open-source ecosystems.
                    <div className="mt-3">
                      <Link
                        href="https://www.merit.systems/"
                        target="_blank"
                        className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-medium"
                      >
                        Visit Merit Systems <ExternalLink className="size-3" />
                      </Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="merit-features">
                  <AccordionTrigger className="text-left">
                    What does Merit Systems offer?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Merit Systems provides:
                    <ul className="space-y-2 ml-4 list-disc mt-3">
                      <li><strong>The Terminal:</strong> A platform to distribute payments to contributors using stablecoins</li>
                      <li><strong>Instant Global Payments:</strong> Pay GitHub contributors directly and instantly</li>
                      <li><strong>Contributor Impact Tracking:</strong> Measure and reward meaningful contributions</li>
                      <li><strong>Compliance Handling:</strong> Takes care of legal paperwork and compliance</li>
                      <li><strong>Echo Platform:</strong> Infrastructure for monetizing AI applications</li>
                    </ul>
                    <p className="mt-3">
                      Merit charges a 2.5% fee when a payment is claimed, making it sustainable while keeping costs low for projects.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="merit-vision">
                  <AccordionTrigger className="text-left">
                    What's Merit Systems' vision?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Merit Systems envisions transforming how open-source software is developed, funded, and maintained by providing
                    comprehensive financial infrastructure. They aim to create an economy where:
                    <ul className="space-y-2 ml-4 list-disc mt-3">
                      <li><strong>Maintainers</strong> can attract top developers and grow their communities</li>
                      <li><strong>Contributors</strong> get paid fairly for their work on open-source projects</li>
                      <li><strong>Supporters</strong> can fund development on projects they love and depend on</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="merit-security">
                  <AccordionTrigger className="text-left">
                    Is Merit Systems safe and trustworthy?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Yes, Merit Systems is committed to security, compliance, and trustworthiness:
                    <ul className="space-y-2 ml-4 list-disc mt-3">
                      <li><strong>Financial Security:</strong> Uses blockchain technology (stablecoins) for transparent, verifiable payments</li>
                      <li><strong>Compliance-First:</strong> Handles all legal paperwork and compliance requirements for contributors</li>
                      <li><strong>Transparent Operations:</strong> Open-source friendly with clear fee structures (2.5% on claimed payments)</li>
                      <li><strong>Trusted Infrastructure:</strong> Built by developers, for developers, with a focus on the open-source community</li>
                      <li><strong>Secure Payments:</strong> Direct payments to GitHub contributors with proper verification</li>
                      <li><strong>Data Protection:</strong> Your financial and contributor data is protected with industry-standard encryption</li>
                    </ul>
                    <p className="mt-3">
                      Merit Systems' mission is to create a sustainable economy for open-source software by providing reliable,
                      transparent financial infrastructure that developers can trust.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Technical Infrastructure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="size-5" />
                Technical Infrastructure
              </CardTitle>
              <CardDescription>
                Deployment, file storage, and platform capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="deployment">
                  <AccordionTrigger className="text-left">
                    How is Case Study deployed?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Case Study is deployed on <strong>Vercel</strong>, a leading cloud platform for modern web applications.
                    Vercel provides edge network deployment, automatic scaling, and zero-downtime deployments. This ensures
                    the platform is always fast, reliable, and available globally. Every change is automatically deployed when
                    code is pushed to the repository, ensuring you always have access to the latest features and improvements.
                    <div className="mt-3">
                      <Link
                        href="https://vercel.com"
                        target="_blank"
                        className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-medium"
                      >
                        Learn more about Vercel <ExternalLink className="size-3" />
                      </Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="file-storage">
                  <AccordionTrigger className="text-left">
                    How does Case Study handle large file uploads?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Case Study uses <strong>Vercel Blob</strong> for file storage, which is Amazon S3-backed object storage
                    optimized for reliability and performance. Files larger than 4MB are automatically uploaded directly to
                    Vercel Blob storage, bypassing API route limitations. This enables you to upload large PDFs, Word documents,
                    and images (up to 512 MB per file) seamlessly.
                    <div className="mt-3">
                      <p className="font-semibold text-sm mb-2">Vercel Blob Specifications:</p>
                      <ul className="space-y-1.5 ml-4 list-disc text-sm">
                        <li><strong>File Size Limit:</strong> Up to 512 MB per blob</li>
                        <li><strong>Durability:</strong> 99.999999999% (11 nines)</li>
                        <li><strong>Availability:</strong> 99.99% annually</li>
                        <li><strong>Global Regions:</strong> 19 available regions</li>
                        <li><strong>Caching:</strong> Up to 1 month by default</li>
                        <li><strong>Supports:</strong> Multipart uploads for large files</li>
                      </ul>
                    </div>
                    <div className="mt-3">
                      <Link
                        href="https://vercel.com/docs/vercel-blob"
                        target="_blank"
                        className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-medium"
                      >
                        Vercel Blob Documentation <ExternalLink className="size-3" />
                      </Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
