import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Bot, CalendarClock, MapPin, ShieldCheck, TimerReset, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { ActionButton } from './ActionButton';

export function MatchCard({ match, onJoin }) {
  const spotsLeft = match.maxPlayers - match.playersCount;
  const fillRate = Math.min(100, Math.round((match.playersCount / match.maxPlayers) * 100));
  const [reserving, setReserving] = useState(false);

  async function reserve() {
    setReserving(true);
    try {
      await onJoin(match.id);
    } finally {
      setReserving(false);
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-lg border border-black/10 bg-white/85 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10"
    >
      <div className="h-2 bg-[linear-gradient(90deg,#C7F000,#1FA463,#111)]" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-lg bg-turf/10 px-2 py-1 text-xs font-black uppercase text-turf dark:bg-limeball/10 dark:text-limeball">
              <TimerReset size={13} /> {match.status}
            </p>
            <h3 className="mt-1 text-xl font-black">{match.title}</h3>
            {match.terrain?.name && <p className="mt-1 text-sm font-semibold text-black/50 dark:text-white/50">{match.terrain.name}</p>}
          </div>
          <span className="rounded-lg bg-black px-2.5 py-1 text-xs font-black text-limeball dark:bg-limeball dark:text-ink">
            {spotsLeft} left
          </span>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs font-black uppercase text-black/45 dark:text-white/45">
            <span>Fill speed</span>
            <span>{fillRate}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div className="h-full rounded-full bg-limeball" style={{ width: `${fillRate}%` }} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-black/62 dark:text-white/65">
          <Meta icon={MapPin}>{match.city}</Meta>
          <Meta icon={CalendarClock}>{new Date(match.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Meta>
          <Meta icon={Users}>{match.playersCount}/{match.maxPlayers} players</Meta>
          <Meta icon={Bot}>AI skill {match.averageSkill || 'new'}</Meta>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg bg-black/[0.04] px-3 py-2 text-xs font-bold text-black/55 dark:bg-white/[0.06] dark:text-white/55">
          <ShieldCheck size={15} className="text-turf dark:text-limeball" />
          Smart waitlist and balanced squads enabled
        </div>

        <div className="mt-4 flex gap-2">
          <ActionButton onClick={reserve} disabled={reserving} className="flex-1">
            {reserving ? 'Reserving...' : 'Reserve spot'}
          </ActionButton>
          <Link to={`/matches/${match.id}`} className="flex-1">
            <ActionButton variant="ghost" className="w-full">Lobby</ActionButton>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function Meta({ icon: Icon, children }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Icon size={15} className="shrink-0" />
      <span className="truncate">{children}</span>
    </span>
  );
}
