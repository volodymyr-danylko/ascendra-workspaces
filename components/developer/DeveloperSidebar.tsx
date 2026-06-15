'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Monitor, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth';

const NAV = [{ href: '/developer/machines', label: 'My Machines', icon: Monitor }];

export function DeveloperSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border-subtle bg-[#0a0d14]">
      <div className="px-4 py-5">
        <p className="text-sm font-bold tracking-tight text-foreground">Ascendra</p>
        <p className="text-[10px] tracking-widest text-dev-accent">WORKSPACES</p>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
              pathname.startsWith(href)
                ? 'border-l-2 border-dev-accent bg-surface text-dev-accent pl-[10px]'
                : 'text-muted-foreground hover:bg-surface hover:text-foreground'
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border-subtle p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dev-accent text-xs font-bold text-white">
            {user?.name?.[0] ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium text-foreground">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground">engineer</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Log out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
