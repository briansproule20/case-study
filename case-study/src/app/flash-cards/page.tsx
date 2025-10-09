export default function FlashCardsPage() {
  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col p-6">
      <div className="flex h-full min-h-0 flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Flash Cards</h1>
          <p className="text-muted-foreground mt-2">
            Study legal concepts with interactive flashcards and spaced repetition.
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1h4zM6 7v13a1 1 0 001 1h10a1 1 0 001-1V7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Coming Soon</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Interactive flashcards with spaced repetition algorithms are in development. Perfect for memorizing legal terms and concepts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
