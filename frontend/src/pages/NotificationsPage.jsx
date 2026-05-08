import { Bell, CheckCheck, Radio, Trash2, Users, Wallet } from 'lucide-react';
import { ActionButton } from '../components/ActionButton';
import { useNotificationStore } from '../store/notificationStore';

const icons = {
  match: Users,
  booking: Radio,
  wallet: Wallet
};

export function NotificationsPage() {
  const notifications = useNotificationStore((state) => state.notifications);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const clear = useNotificationStore((state) => state.clear);
  const unread = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-lg bg-ink p-6 text-white">
        <img src="https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1400&q=85" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/30" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-black uppercase text-limeball"><Bell size={17} /> Live notifications</p>
            <h1 className="mt-3 text-5xl font-black leading-none">{unread} unread</h1>
            <p className="mt-3 max-w-xl font-semibold text-white/70">
              Real-time match updates, pitch confirmations, waitlist movement, and wallet signals.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ActionButton onClick={markAllRead}><CheckCheck size={17} /> Mark read</ActionButton>
            <ActionButton variant="ghost" onClick={clear}><Trash2 size={17} /> Clear</ActionButton>
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        {notifications.map((notification) => {
          const Icon = icons[notification.type] || Bell;

          return (
            <article key={notification.id} className="flex items-start gap-3 rounded-lg border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/10">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${notification.read ? 'bg-black/[0.06] text-black/45 dark:bg-white/10 dark:text-white/45' : 'bg-limeball text-ink'}`}>
                <Icon size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-black">{notification.title}</h2>
                  <time className="text-xs font-black uppercase text-black/40 dark:text-white/40">
                    {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>
                <p className="mt-1 text-sm font-semibold text-black/58 dark:text-white/58">{notification.body}</p>
              </div>
            </article>
          );
        })}
        {!notifications.length && (
          <p className="rounded-lg border border-black/10 bg-white/80 p-5 text-sm font-bold text-black/55 dark:border-white/10 dark:bg-white/10 dark:text-white/55">
            No notifications yet. Live match and booking activity will appear here.
          </p>
        )}
      </section>
    </div>
  );
}
