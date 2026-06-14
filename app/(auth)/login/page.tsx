'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';

const PRESET_ACCOUNTS = [
  { email: 'alice@ascendra.dev', name: 'Alice Chen', role: 'Engineer', hint: 'Developer view' },
  { email: 'charlie@ascendra.dev', name: 'Charlie Park', role: 'Engineer', hint: 'Developer view' },
  { email: 'bob@ascendra.dev', name: 'Bob Martinez', role: 'Admin', hint: 'Admin view' },
];

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  async function login(email: string) {
    setLoading(email);
    setError(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Login failed');
      const { user } = await res.json();
      setUser(user);
      router.push(user.role === 'admin' ? '/admin/overview' : '/developer/machines');
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ascendra</h1>
          <p className="text-xs tracking-widest text-dev-accent mt-1 uppercase">Workspaces</p>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface p-6">
          <h2 className="text-sm font-semibold text-foreground mb-1">Choose an account</h2>
          <p className="text-xs text-muted-foreground mb-5">Preset demo accounts — no password required</p>

          <div className="space-y-2">
            {PRESET_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => login(account.email)}
                disabled={loading !== null}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-background border border-border-subtle hover:border-dev-accent transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-9 h-9 rounded-full bg-dev-accent flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {account.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{account.name}</p>
                  <p className="text-xs text-muted-foreground">{account.hint}</p>
                </div>
                <span className="text-xs text-muted-foreground border border-border-subtle rounded px-2 py-0.5 flex-shrink-0">
                  {account.role}
                </span>
                {loading === account.email && (
                  <div className="w-4 h-4 border-2 border-dev-accent border-t-transparent rounded-full animate-spin flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {error && (
            <p className="text-sm text-status-error text-center mt-4">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
