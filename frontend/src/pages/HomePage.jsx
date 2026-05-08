import { useCallback, useEffect, useState } from 'react';
import { Activity, Bot, Flame, MapPinned, Plus, Radar, Sparkles, UsersRound, WalletCards } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ActionButton } from '../components/ActionButton';
import { MatchCard } from '../components/MatchCard';
import { availabilityApi, matchApi } from '../services/api';
import { useLiveHkick } from '../hooks/useLiveHkick';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

export function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const notifications = useNotificationStore((state) => state.notifications);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [matchmakingLoading, setMatchmakingLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [quickCreate, setQuickCreate] = useState(false);
  const city = user?.profile?.city || 'Casablanca';

  const mergeMatch = useCallback((match) => {
    setMatches((current) => [match, ...current.filter((item) => item.id !== match.id)].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)));
  }, []);

  useLiveHkick({
    onMatch: mergeMatch,
    onAvailability: (profile) => setPlayers((current) => [profile, ...current.filter((item) => item.id !== profile.id)].filter((item) => item.isAvailable))
  });

  useEffect(() => {
    matchApi.list().then((data) => setMatches(data.matches.length ? data.matches : demoMatches(city))).catch(() => setMatches(demoMatches(city)));
    availabilityApi.nearby().then((data) => setPlayers(data.players.length ? data.players : demoPlayers)).catch(() => setPlayers(demoPlayers));
    loadMatchmaking();
  }, [city]);

  async function join(id) {
    setActionMessage('');
    if (id.startsWith('demo-')) {
      navigate(`/matches/${id}`);
      return;
    }

    try {
      const data = await matchApi.join(id);
      mergeMatch(data.match);
      navigate(`/matches/${data.match.id}`);
    } catch (error) {
      setActionMessage(error.message || 'Could not reserve this spot.');
    }
  }

  async function loadMatchmaking() {
    setMatchmakingLoading(true);
    try {
      const data = await matchApi.matchmaking();
      setRecommendations(data.recommendations.length ? data.recommendations : demoRecommendations(city));
    } catch {
      setRecommendations(demoRecommendations(city));
    } finally {
      setMatchmakingLoading(false);
    }
  }

  async function instantMatch() {
    setMatchmakingLoading(true);
    try {
      const data = await matchApi.instant();
      mergeMatch(data.match);
      navigate(`/matches/${data.match.id}`);
    } catch {
      const [best] = demoRecommendations(city);
      navigate(`/matches/${best.match.id}`);
    } finally {
      setMatchmakingLoading(false);
    }
  }

  async function createMatch(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const startsAt = new Date();
    startsAt.setHours(startsAt.getHours() + Number(form.get('hoursFromNow')));
    const data = await matchApi.create({
      title: form.get('title'),
      city,
      startsAt: startsAt.toISOString(),
      maxPlayers: Number(form.get('maxPlayers')),
      visibility: form.get('visibility')
    });
    mergeMatch(data.match);
    setQuickCreate(false);
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="relative overflow-hidden rounded-lg bg-ink p-5 text-white sm:p-8">
          <img src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1400&q=85" alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
          <div className="relative grid gap-8 xl:grid-cols-[1fr_260px]">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-lg bg-limeball px-3 py-2 text-sm font-black uppercase text-ink">
                <Activity size={16} /> Live in {city}
              </p>
              <h1 className="mt-5 text-4xl font-black leading-none sm:text-6xl">Play in minutes, not after 47 messages.</h1>
              <p className="mt-4 max-w-xl text-base font-semibold text-white/72 sm:text-lg">
                HKick combines instant matchmaking, pitch booking, smart waitlists, and AI-balanced teams in one match command center.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ActionButton onClick={() => setQuickCreate(true)}><Plus size={18} /> Start match</ActionButton>
                <ActionButton variant="ghost" onClick={() => availabilityApi.set(true)}><Radar size={18} /> Go available</ActionButton>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 xl:grid-cols-1">
              <Kpi value={`${players.length}`} label="online" />
              <Kpi value={`${matches.length}`} label="open games" />
              <Kpi value="92%" label="fill score" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-black/10 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-turf dark:text-limeball">Player radar</p>
              <h2 className="text-xl font-black">Ready nearby</h2>
            </div>
            <span className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-limeball text-ink">
              <span className="absolute h-full w-full animate-ping rounded-lg bg-limeball/35" />
              <UsersRound size={20} />
            </span>
          </div>
          <div className="mt-4 space-y-2.5">
            {players.slice(0, 6).map((player) => (
              <div key={player.id} className="flex items-center justify-between rounded-lg bg-black/[0.04] px-3 py-2.5 dark:bg-white/[0.06]">
                <div className="min-w-0">
                  <p className="truncate font-black">{player.name}</p>
                  <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">{player.preferredPosition} / level {player.skillLevel}</p>
                </div>
                <span className="rounded-lg bg-turf px-2 py-1 text-xs font-black text-white">Live</span>
              </div>
            ))}
            {!players.length && <p className="text-sm text-black/50 dark:text-white/50">No nearby players online yet.</p>}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Feature icon={Flame} title="Instant play" text="One-tap availability and live match fill." />
        <Feature icon={Bot} title="AI teams" text="Skill-balanced squads after every join." />
        <Feature icon={MapPinned} title="Pitch lock" text="Book the terrain around match intent." />
        <Feature icon={WalletCards} title="Payment-ready" text="Designed for deposits and no-show control." />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg bg-ink p-5 text-white">
          <p className="text-sm font-black uppercase text-limeball">HKick matchmaking</p>
          <h2 className="mt-2 text-3xl font-black leading-none">Your best match is already waiting.</h2>
          <p className="mt-3 text-sm font-semibold text-white/65">
            We score open games by city, kickoff time, skill fit, team needs, spots left, and booking readiness.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ActionButton onClick={instantMatch} disabled={matchmakingLoading}>
              <Sparkles size={17} /> {matchmakingLoading ? 'Matching...' : 'Instant match me'}
            </ActionButton>
            <ActionButton variant="ghost" onClick={loadMatchmaking} disabled={matchmakingLoading}>
              <Radar size={17} /> Refresh fit
            </ActionButton>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {recommendations.slice(0, 3).map((recommendation) => (
            <button
              key={recommendation.match.id}
              onClick={() => recommendation.match.id.startsWith('demo-') ? navigate(`/matches/${recommendation.match.id}`) : join(recommendation.match.id)}
              className="rounded-lg border border-black/10 bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-limeball dark:border-white/10 dark:bg-white/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase text-turf dark:text-limeball">Fit score</p>
                  <p className="text-3xl font-black">{recommendation.score}</p>
                </div>
                <span className="rounded-lg bg-limeball px-2.5 py-1 text-xs font-black text-ink">{recommendation.fit?.fillRate || 80}% full</span>
              </div>
              <h3 className="mt-3 font-black">{recommendation.match.title}</h3>
              <p className="mt-1 text-sm font-semibold text-black/55 dark:text-white/55">{recommendation.match.city} / {recommendation.fit?.spotsLeft || 2} spots left</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {recommendation.reasons.slice(0, 3).map((reason) => (
                  <span key={reason} className="rounded-lg bg-black/[0.06] px-2 py-1 text-xs font-bold dark:bg-white/10">{reason}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-lg border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase text-turf dark:text-limeball">Live activity</p>
              <h2 className="text-2xl font-black">The city is moving</h2>
            </div>
            <span className="rounded-lg bg-limeball px-3 py-2 text-sm font-black text-ink">{notifications.length}</span>
          </div>
          <div className="mt-4 grid gap-2">
            {notifications.slice(0, 4).map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 rounded-lg bg-black/[0.04] px-3 py-2.5 dark:bg-white/[0.06]"
              >
                <div className="min-w-0">
                  <p className="truncate font-black">{notification.title}</p>
                  <p className="truncate text-sm font-semibold text-black/50 dark:text-white/50">{notification.body}</p>
                </div>
                {!notification.read && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-limeball" />}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-ink p-5 text-white">
          <p className="text-sm font-black uppercase text-limeball">Daily loop</p>
          <h2 className="mt-2 text-3xl font-black leading-none">Come back for XP, reputation, and better games.</h2>
          <div className="mt-5 space-y-3">
            <LoopStep title="1. Go available" text="Broadcast intent to captains and matches." />
            <LoopStep title="2. Join fast" text="Use fit score to skip endless coordination." />
            <LoopStep title="3. Check in" text="Build trust and unlock better squads." />
          </div>
        </div>
      </section>

      {quickCreate && (
        <motion.form initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} onSubmit={createMatch} className="grid gap-3 rounded-lg border border-limeball/40 bg-white/90 p-4 shadow-glow dark:bg-pitch/90 sm:grid-cols-5">
          <input name="title" className="field sm:col-span-2" placeholder="Match title" defaultValue="Tonight quick 5v5" />
          <select name="hoursFromNow" className="field"><option value="1">In 1h</option><option value="2">In 2h</option><option value="4">In 4h</option><option value="24">Tomorrow</option></select>
          <select name="maxPlayers" className="field"><option value="10">5v5</option><option value="14">7v7</option><option value="22">11v11</option></select>
          <select name="visibility" className="field"><option value="PUBLIC">Public</option><option value="PRIVATE">Private</option></select>
          <ActionButton className="sm:col-span-5"><Sparkles size={17} /> Launch live match</ActionButton>
        </motion.form>
      )}

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase text-turf dark:text-limeball">Find / book / play</p>
            <h2 className="text-2xl font-black">Best matches tonight</h2>
          </div>
          <div className="flex gap-2 text-xs font-black uppercase text-black/45 dark:text-white/45">
            <span className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10">Skill fit</span>
            <span className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10">Near you</span>
            <span className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10">Fast fill</span>
          </div>
        </div>
        {actionMessage && (
          <p className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-700 dark:text-red-200">
            {actionMessage}
          </p>
        )}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((match) => <MatchCard key={match.id} match={match} onJoin={join} />)}
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <StrategyPillar title="Keep" text="Matches, terrains, chat, profiles, multilingual growth, and local football community." />
        <StrategyPillar title="Modify" text="Make everything faster: live availability, auto waitlist, team balance, booking from the match flow." />
        <StrategyPillar title="Remove" text="Reduce noisy social feeds, unclear CTAs, slow discovery, and empty screens that kill trust." />
      </section>
    </div>
  );
}

function LoopStep({ title, text }) {
  return (
    <div className="rounded-lg bg-white/10 p-3">
      <p className="font-black">{title}</p>
      <p className="mt-1 text-sm font-semibold text-white/60">{text}</p>
    </div>
  );
}

function Kpi({ value, label }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-3 backdrop-blur">
      <p className="text-2xl font-black text-limeball">{value}</p>
      <p className="text-xs font-black uppercase text-white/55">{label}</p>
    </div>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white/75 p-4 dark:border-white/10 dark:bg-white/10">
      <Icon size={20} className="text-turf dark:text-limeball" />
      <h3 className="mt-3 font-black">{title}</h3>
      <p className="mt-1 text-sm font-medium text-black/55 dark:text-white/55">{text}</p>
    </div>
  );
}

function StrategyPillar({ title, text }) {
  return (
    <div className="rounded-lg bg-ink p-4 text-white dark:bg-white/10">
      <p className="text-xs font-black uppercase text-limeball">{title}</p>
      <p className="mt-2 text-sm font-semibold text-white/75">{text}</p>
    </div>
  );
}

function demoMatches(city) {
  const now = new Date();
  return [
    {
      id: 'demo-fast-fill',
      title: 'Maarif 5v5 fast fill',
      city,
      startsAt: new Date(now.getTime() + 90 * 60 * 1000).toISOString(),
      maxPlayers: 10,
      playersCount: 8,
      averageSkill: 3.8,
      status: 'OPEN',
      terrain: { name: 'Casa Arena' }
    },
    {
      id: 'demo-balanced',
      title: 'Anfa balanced 7v7',
      city,
      startsAt: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      maxPlayers: 14,
      playersCount: 11,
      averageSkill: 4.1,
      status: 'OPEN',
      terrain: { name: 'Anfa Street Pitch' }
    },
    {
      id: 'demo-rookie',
      title: 'Beginner friendly night',
      city,
      startsAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      maxPlayers: 10,
      playersCount: 6,
      averageSkill: 2.6,
      status: 'OPEN',
      terrain: { name: 'Maarif Club' }
    }
  ];
}

function demoRecommendations(city) {
  return demoMatches(city).map((match, index) => ({
    match,
    score: [94, 88, 76][index] || 72,
    reasons: index === 0
      ? ['starts soon', 'strong skill fit', 'fast fill']
      : index === 1
        ? ['tonight', 'MID needed', 'pitch linked']
        : ['beginner friendly', 'open spots', 'skill fit'],
    fit: {
      spotsLeft: match.maxPlayers - match.playersCount,
      fillRate: Math.round((match.playersCount / match.maxPlayers) * 100),
      averageSkill: match.averageSkill,
      skillDiff: 0.4,
      hoursUntilKickoff: index + 1
    }
  }));
}

const demoPlayers = [
  { id: 'p1', name: 'Amine', preferredPosition: 'MID', skillLevel: 4, isAvailable: true },
  { id: 'p2', name: 'Omar', preferredPosition: 'FWD', skillLevel: 5, isAvailable: true },
  { id: 'p3', name: 'Yassine', preferredPosition: 'DEF', skillLevel: 3, isAvailable: true },
  { id: 'p4', name: 'Hamza', preferredPosition: 'GK', skillLevel: 4, isAvailable: true }
];
