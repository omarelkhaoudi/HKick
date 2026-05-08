import { Link, NavLink, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Activity, Bell, ChevronRight, Home, MapPinned, ShieldCheck, Trophy, UserRound, Wallet, Zap } from 'lucide-react';
import { useLiveNotifications } from '../hooks/useLiveNotifications';
import { useNotificationStore } from '../store/notificationStore';

const tabs = [
  { to: '/', label: 'Play', icon: Home, helper: 'Live matches' },
  { to: '/terrains', label: 'Book', icon: MapPinned, helper: 'Pitch slots' },
  { to: '/wallet', label: 'Pay', icon: Wallet, helper: 'Deposits' },
  { to: '/profile', label: 'You', icon: UserRound, helper: 'Profile' }
];

const footerLinks = [
  { label: 'Instant matches', to: '/' },
  { label: 'Terrain booking', to: '/terrains' },
  { label: 'HKick Wallet', to: '/wallet' },
  { label: 'Player profile', to: '/profile' }
];

export function AppLayout() {
  useLiveNotifications();
  const unread = useNotificationStore((state) => (Array.isArray(state.notifications) ? state.notifications : []).filter((notification) => !notification.read).length);
  const hydrateNotifications = useNotificationStore((state) => state.hydrate);

  useEffect(() => {
    hydrateNotifications();
  }, [hydrateNotifications]);

  return (
    <div className="min-h-screen text-ink dark:text-white">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-cloud/88 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-pitch/88">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link to="/" className="group flex min-w-0 items-center gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-limeball text-ink shadow-glow">
              <Zap size={24} fill="currentColor" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-cloud bg-turf dark:border-pitch" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-black tracking-normal leading-none">HKick</p>
              <p className="mt-1 hidden text-xs font-black uppercase text-black/45 dark:text-white/45 sm:block">
                Instant football OS
              </p>
            </div>
          </Link>

          <nav className="hidden items-center rounded-xl border border-black/10 bg-white/70 p-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 md:flex">
            {tabs.map((tab) => <Tab key={tab.to} {...tab} />)}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-black/10 bg-white/70 px-3 py-2 text-sm font-black dark:border-white/10 dark:bg-white/10 lg:flex">
              <Activity size={16} className="text-turf dark:text-limeball" />
              <span>Casablanca live</span>
            </div>
            <Link to="/notifications" className="icon-button relative" aria-label="Notifications">
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-limeball px-1 text-[10px] font-black text-ink">
                  {unread}
                </span>
              )}
            </Link>
            <Link
              to="/"
              className="hidden items-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-black text-limeball transition hover:-translate-y-0.5 hover:shadow-glow dark:bg-limeball dark:text-ink sm:inline-flex"
            >
              Match me <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 sm:pb-10">
        <Outlet />
      </main>

      <Footer />

      <nav className="fixed bottom-3 left-3 right-3 z-40 grid grid-cols-4 gap-2 rounded-xl border border-black/10 bg-white/92 p-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-pitch/92 md:hidden">
        {tabs.map((tab) => <Tab key={tab.to} {...tab} compact />)}
      </nav>
    </div>
  );
}

function Tab({ to, label, icon: Icon, compact }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-black transition ${
          isActive ? 'bg-limeball text-ink shadow-sm' : 'text-black/55 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10'
        } ${compact ? 'flex-col gap-1 text-xs' : 'min-w-24'}`
      }
    >
      <Icon size={compact ? 18 : 17} />
      {label}
    </NavLink>
  );
}

function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white/55 px-4 pb-28 pt-8 backdrop-blur dark:border-white/10 dark:bg-black/10 md:pb-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.7fr_0.9fr]">
        <section>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-limeball text-ink shadow-glow">
              <Zap size={22} fill="currentColor" />
            </div>
            <div>
              <p className="text-xl font-black leading-none">HKick</p>
              <p className="mt-1 text-xs font-black uppercase text-black/45 dark:text-white/45">Play / book / pay</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm font-semibold leading-6 text-black/58 dark:text-white/58">
            The operating system for amateur football: instant matchmaking, pitch booking, wallet deposits, smart waitlists, and balanced teams.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <FooterBadge icon={Activity} label="Live availability" />
            <FooterBadge icon={ShieldCheck} label="Secure deposits" />
            <FooterBadge icon={Trophy} label="Player XP" />
          </div>
        </section>

        <section>
          <p className="text-sm font-black uppercase text-turf dark:text-limeball">Product</p>
          <div className="mt-3 grid gap-2">
            {footerLinks.map((link) => (
              <Link key={link.to} to={link.to} className="text-sm font-bold text-black/58 transition hover:text-ink dark:text-white/58 dark:hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-lg bg-ink p-4 text-white">
          <p className="text-sm font-black uppercase text-limeball">Launch signal</p>
          <h2 className="mt-2 text-2xl font-black leading-tight">Casablanca first. Morocco next.</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/65">
            Built for local football communities, terrain owners, captains, and players who want to play without friction.
          </p>
          <Link to="/" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-limeball px-4 py-3 text-sm font-black text-ink transition hover:-translate-y-0.5">
            Find a match <ChevronRight size={16} />
          </Link>
        </section>
      </div>

      <div className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4 text-xs font-bold uppercase text-black/40 dark:border-white/10 dark:text-white/35">
        <span>HKick MVP</span>
        <span>Instant football matchmaking platform</span>
      </div>
    </footer>
  );
}

function FooterBadge({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white/70 px-3 py-2 text-xs font-black text-black/60 dark:border-white/10 dark:bg-white/10 dark:text-white/60">
      <Icon size={14} className="text-turf dark:text-limeball" />
      {label}
    </span>
  );
}
