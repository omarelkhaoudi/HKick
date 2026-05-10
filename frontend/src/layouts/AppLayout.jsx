import { Link, NavLink, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Bell, MessageCircle, Home, MapPinned, UserRound, Zap } from 'lucide-react';
import { useLiveNotifications } from '../hooks/useLiveNotifications';
import { useNotificationStore } from '../store/notificationStore';

const tabs = [
  { to: '/', label: 'Feed', icon: Home },
  { to: '/terrains', label: 'Explore', icon: MapPinned },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/profile', label: 'Profile', icon: UserRound }
];

export function AppLayout() {
  useLiveNotifications();
  const unread = useNotificationStore((state) => (Array.isArray(state.notifications) ? state.notifications : []).filter((notification) => !notification.read).length);
  const hydrateNotifications = useNotificationStore((state) => state.hydrate);

  useEffect(() => {
    hydrateNotifications();
  }, [hydrateNotifications]);

  return (
    <div className="min-h-screen bg-obsidian text-white flex justify-center md:justify-start">
      {/* Top Header - Mobile Only */}
      <header className="sticky top-0 z-30 glass-panel px-4 py-3 md:hidden fixed w-full">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald text-obsidian shadow-glow">
              <Zap size={16} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight">HKick</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/notifications" className="relative p-2 text-white/80 hover:text-white">
              <Bell size={22} />
              {unread > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald px-1 text-[9px] font-bold text-obsidian">
                  {unread}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-[280px] flex-col fixed h-screen left-0 top-0 border-r border-[#333333]/50 items-end pr-8">
        <div className="w-64 pt-8">
          <Link to="/" className="flex items-center gap-3 mb-10 px-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald text-obsidian shadow-glow">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-2xl font-bold tracking-tight">HKick</span>
          </Link>

          <nav className="flex flex-col gap-2">
            {tabs.map((tab) => <Tab key={tab.to} {...tab} />)}
          </nav>
        </div>
      </aside>

      {/* Main Content - Centered */}
      <main className="flex-1 w-full max-w-xl pb-24 md:pb-10 pt-20 md:pt-8 px-4 mx-auto md:ml-[280px] lg:mx-auto">
        <Outlet />
      </main>

      {/* Right Sidebar Placeholder (e.g. for widgets) - Desktop Only */}
      <div className="hidden lg:block w-[280px] border-l border-[#333333]/50 fixed h-screen right-0 top-0"></div>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 w-full z-40 flex items-center justify-around glass-panel pb-safe pt-2 px-2 md:hidden">
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
        `flex transition-all ${compact ? 'flex-col items-center gap-1 p-2 w-16' : 'items-center gap-4 px-4 py-3 rounded-2xl w-full'} ${
          isActive 
            ? compact ? 'text-emerald' : 'bg-[#1E1E1E] text-white font-bold border border-[#333333]' 
            : 'text-white/60 hover:text-white hover:bg-white/5'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={compact ? 24 : 22} className={isActive ? 'text-emerald drop-shadow-md' : ''} />
          <span className={`${compact ? 'text-[10px]' : 'text-lg'} font-medium`}>{label}</span>
        </>
      )}
    </NavLink>
  );
}
