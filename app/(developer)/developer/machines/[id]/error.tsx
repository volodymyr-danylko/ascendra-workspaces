'use client';

export default function VMDetailError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-3xl">
      <div className="rounded-xl border border-status-error/30 bg-red-950/20 p-6 text-center">
        <p className="text-sm text-status-error">Something went wrong loading this machine</p>
        <button
          onClick={reset}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground underline"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
