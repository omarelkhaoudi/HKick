import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, CheckCircle2, ClipboardCheck, MapPin, MessageCircle, Send, Share2, Star, Trophy, Users, UserPlus } from 'lucide-react';
import { ActionButton } from '../components/ActionButton';
import { TeamBoard } from '../components/TeamBoard';
import { api, matchApi } from '../services/api';
import { getSocket } from '../services/socket';

export function MatchPage() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [waitlist, setWaitlist] = useState([
    { id: 'w1', name: 'Karim', position: 'MID', skill: 4 },
    { id: 'w2', name: 'Ilyas', position: 'DEF', skill: 3 }
  ]);

  useEffect(() => {
    api(`/matches/${id}`)
      .then((data) => {
        setMatch(data.match);
        setMessages(data.match.messages || []);
      })
      .catch(() => {
        const demo = demoMatch(id);
        setMatch(demo);
        setMessages(demo.messages);
        setError('Demo lobby shown because this match is not in the database yet.');
      });

    const socket = getSocket();
    socket?.emit('match:join-room', id);
    socket?.on('match:updated', setMatch);
    socket?.on('chat:message', (message) => setMessages((current) => [...current, message]));

    return () => {
      socket?.emit('match:leave-room', id);
      socket?.off('match:updated', setMatch);
    };
  }, [id]);

  const fillRate = useMemo(() => {
    if (!match) return 0;
    return Math.min(100, Math.round((match.playersCount / match.maxPlayers) * 100));
  }, [match]);

  async function join() {
    if (id.startsWith('demo-')) return;
    const data = await matchApi.join(id);
    setMatch(data.match);
  }

  async function leave() {
    if (id.startsWith('demo-')) return;
    const data = await matchApi.leave(id);
    setMatch(data.match);
  }

  async function send(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = form.get('message');
    if (!body) return;
    if (id.startsWith('demo-')) {
      setMessages((current) => [...current, { id: crypto.randomUUID(), body, user: { profile: { name: 'You' } } }]);
      event.currentTarget.reset();
      return;
    }
    await matchApi.message(id, body);
    event.currentTarget.reset();
  }

  function joinWaitlist() {
    setWaitlist((current) => [
      { id: `w-${Date.now()}`, name: 'You', position: 'FLEX', skill: 3 },
      ...current.filter((player) => player.name !== 'You')
    ]);
  }

  function submitScore(event) {
    event.preventDefault();
    setScoreSubmitted(true);
  }

  if (!match) {
    return (
      <div className="rounded-lg border border-black/10 bg-white/80 p-6 font-black dark:border-white/10 dark:bg-white/10">
        Loading lobby...
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <section className="space-y-4">
        <div className="relative overflow-hidden rounded-lg bg-ink p-5 text-white sm:p-7">
          <img src="https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1400&q=85" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/35" />
          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-black text-white/65 hover:text-limeball">
              <ArrowLeft size={16} /> Back to live feed
            </Link>
            <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase text-limeball">{match.status} / {match.city}</p>
                <h1 className="mt-2 max-w-3xl text-4xl font-black leading-none sm:text-5xl">{match.title}</h1>
                {error && <p className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-sm font-bold text-white/70">{error}</p>}
              </div>
              <div className="rounded-lg border border-white/10 bg-white/10 p-3 text-right">
                <p className="text-3xl font-black text-limeball">{fillRate}%</p>
                <p className="text-xs font-black uppercase text-white/55">filled</p>
              </div>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <Meta icon={CalendarClock}>{new Date(match.startsAt).toLocaleString()}</Meta>
              <Meta icon={Users}>{match.playersCount}/{match.maxPlayers} players</Meta>
              <Meta icon={MapPin}>{match.terrain?.name || 'Terrain pending'}</Meta>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <ActionButton onClick={join}>Reserve spot</ActionButton>
              <ActionButton variant="ghost" onClick={leave}>Leave match</ActionButton>
              <ActionButton variant="ghost"><Share2 size={17} /> Invite</ActionButton>
              <ActionButton variant="ghost" onClick={() => setCheckedIn(true)}><ClipboardCheck size={17} /> {checkedIn ? 'Checked in' : 'Check in'}</ActionButton>
            </div>
          </div>
        </div>

        <section className="grid gap-3 md:grid-cols-3">
          <CaptainTask done title="Pitch selected" text={match.terrain?.name || 'Linked after booking'} />
          <CaptainTask done={fillRate >= 70} title="Squad almost full" text={`${match.maxPlayers - match.playersCount} spots left`} />
          <CaptainTask done title="Teams balanced" text="Updated automatically" />
        </section>

        <TeamBoard players={match.players} />

        <section className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-turf dark:text-limeball">Smart waitlist</p>
                <h2 className="text-xl font-black">Next players in line</h2>
              </div>
              <UserPlus size={20} />
            </div>
            <div className="mt-4 space-y-2">
              {waitlist.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between rounded-lg bg-black/[0.04] px-3 py-2.5 dark:bg-white/[0.06]">
                  <div>
                    <p className="font-black">{index + 1}. {player.name}</p>
                    <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">{player.position} / L{player.skill}</p>
                  </div>
                  <span className="rounded-lg bg-limeball px-2 py-1 text-xs font-black text-ink">Auto-in</span>
                </div>
              ))}
            </div>
            <ActionButton className="mt-4 w-full" variant="ghost" onClick={joinWaitlist}><UserPlus size={17} /> Join waitlist</ActionButton>
          </div>

          <form onSubmit={submitScore} className="rounded-lg border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-turf dark:text-limeball">Progression</p>
                <h2 className="text-xl font-black">Submit result</h2>
              </div>
              <Trophy size={20} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <input className="field" name="teamVolt" type="number" min="0" defaultValue="5" aria-label="Team Volt score" />
              <input className="field" name="teamPulse" type="number" min="0" defaultValue="4" aria-label="Team Pulse score" />
            </div>
            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button key={rating} type="button" className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 hover:border-limeball hover:bg-limeball hover:text-ink dark:border-white/10">
                  <Star size={16} />
                </button>
              ))}
            </div>
            {scoreSubmitted && (
              <p className="mt-3 rounded-lg bg-limeball/15 px-3 py-2 text-sm font-black text-turf dark:text-limeball">
                Score saved. XP and trust score updated locally.
              </p>
            )}
            <ActionButton className="mt-4 w-full"><Trophy size={17} /> Save result</ActionButton>
          </form>
        </section>
      </section>

      <aside className="rounded-lg border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase text-turf dark:text-limeball">Live room</p>
            <h2 className="text-xl font-black">Match chat</h2>
          </div>
          <MessageCircle size={20} />
        </div>
        <div className="mt-4 flex h-[420px] flex-col gap-2 overflow-y-auto rounded-lg bg-black/[0.04] p-3 dark:bg-black/20">
          {messages.map((message) => (
            <div key={message.id} className="rounded-lg bg-white p-3 text-sm dark:bg-white/10">
              <p className="font-black">{message.user?.profile?.name || 'Player'}</p>
              <p className="text-black/70 dark:text-white/70">{message.body}</p>
            </div>
          ))}
        </div>
        <form onSubmit={send} className="mt-3 flex gap-2">
          <input className="field" name="message" placeholder="Type to the squad" />
          <ActionButton><Send size={17} /></ActionButton>
        </form>
      </aside>
    </div>
  );
}

function Meta({ icon: Icon, children }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-bold text-white/75">
      <Icon size={16} className="shrink-0 text-limeball" />
      <span className="truncate">{children}</span>
    </div>
  );
}

function CaptainTask({ done, title, text }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white/75 p-4 dark:border-white/10 dark:bg-white/10">
      <CheckCircle2 size={19} className={done ? 'text-turf dark:text-limeball' : 'text-black/25 dark:text-white/25'} />
      <h3 className="mt-2 font-black">{title}</h3>
      <p className="mt-1 text-sm font-medium text-black/55 dark:text-white/55">{text}</p>
    </div>
  );
}

function demoMatch(matchId) {
  const now = new Date();
  return {
    id: matchId,
    title: matchId.includes('balanced') ? 'Anfa balanced 7v7' : 'Maarif 5v5 fast fill',
    city: 'Casablanca',
    startsAt: new Date(now.getTime() + 90 * 60 * 1000).toISOString(),
    maxPlayers: 10,
    playersCount: 8,
    status: 'OPEN',
    terrain: { name: 'Casa Arena 5v5' },
    players: [
      { id: '1', team: 'Volt', name: 'Amine', preferredPosition: 'MID', skillLevel: 4 },
      { id: '2', team: 'Pulse', name: 'Omar', preferredPosition: 'FWD', skillLevel: 5 },
      { id: '3', team: 'Volt', name: 'Yassine', preferredPosition: 'DEF', skillLevel: 3 },
      { id: '4', team: 'Pulse', name: 'Hamza', preferredPosition: 'GK', skillLevel: 4 },
      { id: '5', team: 'Volt', name: 'Mehdi', preferredPosition: 'FWD', skillLevel: 5 },
      { id: '6', team: 'Pulse', name: 'Sami', preferredPosition: 'MID', skillLevel: 3 },
      { id: '7', team: 'Volt', name: 'Reda', preferredPosition: 'DEF', skillLevel: 2 },
      { id: '8', team: 'Pulse', name: 'Anas', preferredPosition: 'FLEX', skillLevel: 2 }
    ],
    messages: [
      { id: 'm1', body: 'I can bring one extra player if needed.', user: { profile: { name: 'Amine' } } },
      { id: 'm2', body: 'Teams look balanced. Keep me as MID.', user: { profile: { name: 'Yassine' } } }
    ]
  };
}
