import { Link, NavLink, Outlet } from "react-router-dom";
import { useEffect } from "react";
import {
  Shield,
  Bell,
  MessageCircle,
  Home,
  MapPinned,
  UserRound,
  Wallet,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLiveNotifications } from "../hooks/useLiveNotifications";
import { useNotificationStore } from "../store/notificationStore";

const tabs = [
  { to: "/", label: "Feed", icon: Home },
  { to: "/terrains", label: "Explore", icon: MapPinned },
  { to: "/teams", label: "Teams", icon: Shield },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export function AppLayout() {
  useLiveNotifications();
  const unread = useNotificationStore(
    (state) =>
      (Array.isArray(state.notifications) ? state.notifications : []).filter(
        (notification) => !notification.read,
      ).length,
  );
  const hydrateNotifications = useNotificationStore((state) => state.hydrate);

  useEffect(() => {
    hydrateNotifications();
  }, [hydrateNotifications]);

  return (
    <div className="min-h-screen bg-obsidian text-white flex flex-col md:flex-row overflow-x-hidden relative w-full">
      {/* Decorative background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[500px] bg-emerald/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Top Header - Mobile Only */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-obsidian/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 md:hidden">
        <div className="flex items-center justify-between w-full max-w-xl mx-auto">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald to-[#00A643] text-obsidian shadow-glow">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="font-display text-xl font-black tracking-tight text-white">
              HKick
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/notifications"
              className="relative p-2.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white transition-all"
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald px-1.5 text-[10px] font-black text-obsidian shadow-glow">
                  {unread}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-[280px] flex-col fixed h-screen left-0 top-0 border-r border-white/5 bg-obsidian/40 backdrop-blur-2xl z-20">
        <div className="w-full pt-10 px-6">
          <Link to="/" className="flex items-center gap-3 mb-12 px-2 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald to-[#00A643] text-obsidian shadow-glow group-hover:scale-105 transition-transform duration-300">
              <Zap size={22} fill="currentColor" />
            </div>
            <span className="font-display text-2xl font-black tracking-tight">
              HKick
            </span>
          </Link>

          <nav className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <Tab key={tab.to} {...tab} />
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content - Centered */}
      <main className="flex-1 w-full max-w-xl pb-32 md:pb-12 pt-24 md:pt-12 px-4 mx-auto md:ml-[280px] lg:mx-auto relative z-10 overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Right Sidebar Placeholder (e.g. for widgets) - Desktop Only */}
      <div className="hidden lg:block w-[320px] border-l border-white/5 fixed h-screen right-0 top-0 bg-obsidian/20 backdrop-blur-sm z-20"></div>

      {/* Floating Bottom Navigation Dock - Mobile Only */}
      <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-3 md:hidden pointer-events-none">
        <nav className="flex items-center gap-0.5 sm:gap-1 glass-panel rounded-full px-1.5 py-1.5 shadow-2xl border border-white/10 bg-surface/80 backdrop-blur-2xl w-full max-w-md justify-between pointer-events-auto">
          {tabs.map((tab) => (
            <Tab key={tab.to} {...tab} compact />
          ))}
        </nav>
      </div>
    </div>
  );
}

function Tab({ to, label, icon: Icon, compact }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex transition-all duration-300 ${
          compact
            ? "flex-col items-center gap-1 p-2 w-[3.2rem] rounded-full"
            : "items-center gap-4 px-4 py-3.5 rounded-2xl w-full"
        } ${
          isActive
            ? compact
              ? "text-emerald"
              : "text-white font-bold bg-white/10 border border-white/5 shadow-inner"
            : "text-white/50 hover:text-white/90 hover:bg-white/5"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && !compact && (
            <motion.div
              layoutId="desktop-active-tab"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald rounded-r-full shadow-glow"
            />
          )}
          {isActive && compact && (
            <motion.div
              layoutId="mobile-active-tab"
              className="absolute inset-0 bg-emerald/10 rounded-full"
            />
          )}
          <Icon
            size={compact ? 22 : 24}
            className={`relative z-10 ${isActive ? "text-emerald drop-shadow-[0_0_8px_rgba(0,242,96,0.5)]" : ""} transition-all duration-300`}
          />
          <span
            className={`relative z-10 ${compact ? "text-[9px] font-semibold tracking-wide" : "text-base"} font-medium`}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}
