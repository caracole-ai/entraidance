'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MobileNav } from './MobileNav';
import { NotificationBell } from './NotificationBell';
import { t } from '@/i18n';
import { Heart } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: t('nav.home') },
  { href: '/missions', label: t('nav.besoins') },
  { href: '/offers', label: t('nav.propositions') },
  { href: '/faq', label: t('nav.faq') },
];

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
  return (
    <Link href={href} className="relative flex flex-col items-center gap-0.5 pb-0.5">
      <span
        className={`text-sm font-semibold uppercase tracking-wider transition-colors ${
          isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {label}
      </span>
      {isActive && (
        <motion.span
          layoutId="nav-underline"
          className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-[#9333ea] via-indigo-500 to-purple-400"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
}

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full glass-header-liquid">
      <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-[#9333ea]">
            <Heart size={32} fill="currentColor" className="text-[#9333ea]" />
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              {t('common.appName')}
            </h1>
          </Link>
          <nav className="hidden items-center gap-10 md:flex pt-2">
            {NAV_LINKS.map(({ href, label }) => (
              <NavLink key={href} href={href} label={label} pathname={pathname} />
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-indigo-500 text-white font-bold">
                        {user?.displayName?.charAt(0).toUpperCase() ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-sidebar-liquid border-white/60">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="font-semibold cursor-pointer">
                      {t('nav.profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="font-semibold cursor-pointer">
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="outline" asChild className="px-6 py-2.5 rounded-xl font-bold text-sm glass-sidebar-liquid border-white/60 hover:bg-white/80">
                <Link href="/login">{t('nav.login')}</Link>
              </Button>
              <Button asChild className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#9333ea] text-white hover:opacity-90 transition-all shadow-lg shadow-[#9333ea]/20 border-0">
                <Link href="/register">{t('nav.register')}</Link>
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
