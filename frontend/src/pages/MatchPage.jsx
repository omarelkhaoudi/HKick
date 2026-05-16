import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  MapPin,
  MessageCircle,
  Send,
  Share2,
  Star,
  Trophy,
  Users,
  UserPlus,
  Sun,
  CloudRain,
  Cloud,
  QrCode,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ActionButton } from "../components/ActionButton";
import { CaptainDashboard } from "../components/CaptainDashboard";
import { TeamBoard } from "../components/TeamBoard";
import { api, matchApi, paymentApi } from "../services/api";
import { getSocket } from "../services/socket";
import { useAuthStore } from "../store/authStore";

export function MatchPage() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [checkedIn, setCheckedIn] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [resultStatus, setResultStatus] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [confirmations, setConfirmations] = useState({});
  const [deposits, setDeposits] = useState({});
  const [showQR, setShowQR] = useState(false);

  const [waitlist, setWaitlist] = useState([
    { id: "w1", name: "Karim", position: "MID", skill: 4 },
    { id: "w2", name: "Ilyas", position: "DEF", skill: 3 },
  ]);

  // Simulated Weather Data
  const weather = useMemo(() => {
    if (!match) return null;
    const hour = new Date(match.startsAt).getHours();
    if (hour > 18) return { temp: 19, condition: "Clear Night", Icon: Cloud };
    if (hour > 14) return { temp: 24, condition: "Sunny", Icon: Sun };
    return { temp: 21, condition: "Partly Cloudy", Icon: CloudRain };
  }, [match]);

  useEffect(() => {
    api(`/matches/${id}`)
      .then((data) => {
        setMatch(data.match);
        setMessages(data.match.messages || []);
        seedCaptainState(data.match);
      })
      .catch(() => {
        const demo = demoMatch(id);
        setMatch(demo);
        setMessages(demo.messages);
        seedCaptainState(demo);
        setError(
          "Demo lobby shown because this match is not in the database yet.",
        );
      });

    const socket = getSocket();
    socket?.emit("match:join-room", id);
    socket?.on("match:updated", setMatch);
    socket?.on("chat:message", (message) =>
      setMessages((current) => [...current, message]),
    );
    socket?.on("match:confirmation", (confirmation) => {
      setConfirmations((current) => ({
        ...current,
        [confirmation.userId]: ["CONFIRMED", "CHECKED_IN"].includes(
          confirmation.status,
        ),
      }));
      if (
        confirmation.userId === user?.id &&
        confirmation.status === "CHECKED_IN"
      )
        setCheckedIn(true);
    });
    socket?.on("match:deposit", (deposit) => {
      setDeposits((current) => ({
        ...current,
        [deposit.userId]: ["RESERVED", "CAPTURED"].includes(deposit.status),
      }));
    });
    socket?.on("match:result", (result) =>
      setMatch((current) => ({
        ...current,
        result,
        status: result.isFinal ? "COMPLETED" : current.status,
      })),
    );

    return () => {
      socket?.emit("match:leave-room", id);
      socket?.off("match:updated", setMatch);
      socket?.off("match:confirmation");
      socket?.off("match:deposit");
      socket?.off("match:result");
    };
  }, [id, user?.id]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const depositId = params.get("deposit");
    if (!depositId || params.get("payment") !== "success") return;

    paymentApi
      .syncMatchDeposit(depositId)
      .then((data) => {
        setDeposits((current) => ({
          ...current,
          [data.deposit.userId]: ["RESERVED", "CAPTURED"].includes(
            data.deposit.status,
          ),
        }));
      })
      .catch((error) =>
        setError(error.message || "Could not sync payment status."),
      );
  }, []);

  const fillRate = useMemo(() => {
    if (!match) return 0;
    return Math.min(
      100,
      Math.round((match.playersCount / match.maxPlayers) * 100),
    );
  }, [match]);

  async function join() {
    if (id.startsWith("demo-")) return;
    const data = await matchApi.join(id);
    setMatch(data.match);
  }

  async function leave() {
    if (id.startsWith("demo-")) return;
    const data = await matchApi.leave(id);
    setMatch(data.match);
  }

  async function send(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = form.get("message");
    if (!body) return;
    if (id.startsWith("demo-")) {
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), body, user: { profile: { name: "You" } } },
      ]);
      event.currentTarget.reset();
      return;
    }
    await matchApi.message(id, body);
    event.currentTarget.reset();
  }

  function joinWaitlist() {
    setWaitlist((current) => [
      { id: `w-${Date.now()}`, name: "You", position: "FLEX", skill: 3 },
      ...current.filter((player) => player.name !== "You"),
    ]);
  }

  async function submitScore(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      teamVoltScore: Number(form.get("teamVolt")),
      teamPulseScore: Number(form.get("teamPulse")),
      isFinal: true,
    };

    if (!id.startsWith("demo-")) {
      try {
        const data = await matchApi.result(id, payload);
        setMatch((current) => ({
          ...current,
          result: data.result,
          status: payload.isFinal ? "COMPLETED" : current.status,
        }));
        setResultStatus("Result saved in the database.");
      } catch (error) {
        setResultStatus(error.message || "Could not save result.");
        return;
      }
    } else {
      setResultStatus("Demo result saved locally.");
    }

    setScoreSubmitted(true);
  }

  function seedCaptainState(nextMatch) {
    const players = nextMatch.players || [];
    const confirmationRows = nextMatch.confirmations || [];
    const depositRows = nextMatch.deposits || [];

    setConfirmations(
      confirmationRows.length
        ? Object.fromEntries(
            confirmationRows.map((item) => [
              item.userId,
              ["CONFIRMED", "CHECKED_IN"].includes(item.status),
            ]),
          )
        : Object.fromEntries(
            players.map((player, index) => [
              player.userId || player.id,
              index < Math.ceil(players.length * 0.75),
            ]),
          ),
    );
    setDeposits(
      depositRows.length
        ? Object.fromEntries(
            depositRows.map((item) => [
              item.userId,
              ["RESERVED", "CAPTURED"].includes(item.status),
            ]),
          )
        : Object.fromEntries(
            players.map((player, index) => [
              player.userId || player.id,
              index < Math.ceil(players.length * 0.6),
            ]),
          ),
    );
    setCheckedIn(
      Boolean(
        confirmationRows.find(
          (item) => item.userId === user?.id && item.status === "CHECKED_IN",
        ),
      ),
    );
  }

  async function toggleConfirmation(playerId) {
    const next = !confirmations[playerId];
    setConfirmations((current) => ({ ...current, [playerId]: next }));

    if (id.startsWith("demo-")) return;
    try {
      await matchApi.confirm(id, {
        userId: playerId,
        status: next ? "CONFIRMED" : "PENDING",
      });
    } catch (error) {
      setConfirmations((current) => ({ ...current, [playerId]: !next }));
      setError(error.message || "Could not update confirmation.");
    }
  }

  async function toggleDeposit(playerId) {
    const next = !deposits[playerId];
    setDeposits((current) => ({ ...current, [playerId]: next }));

    if (id.startsWith("demo-")) return;
    try {
      await matchApi.deposit(id, {
        userId: playerId,
        amount: 50,
        status: next ? "RESERVED" : "REFUNDED",
      });
    } catch (error) {
      setDeposits((current) => ({ ...current, [playerId]: !next }));
      setError(error.message || "Could not update deposit.");
    }
  }

  async function payDeposit(playerId) {
    if (deposits[playerId]) return;
    if (id.startsWith("demo-")) {
      setDeposits((current) => ({ ...current, [playerId]: true }));
      return;
    }

    try {
      const data = await paymentApi.createMatchDepositCheckout({
        matchId: id,
        amount: 50,
      });
      if (!data.deposit.checkoutUrl) {
        setError("Payment provider did not return a checkout URL.");
        return;
      }
      window.location.href = data.deposit.checkoutUrl;
    } catch (error) {
      setError(error.message || "Could not start online payment.");
    }
  }

  function nudgePlayers() {
    setMessages((current) => [
      ...current,
      {
        id: `captain-reminder-${Date.now()}`,
        body: "Captain reminder: please confirm attendance and deposit before kickoff.",
        user: { profile: { name: "HKick Ops" } },
      },
    ]);
  }

  function promoteWaitlist() {
    const [nextPlayer, ...rest] = waitlist;
    if (!nextPlayer || !match) return;

    const player = {
      id: `promoted-${Date.now()}`,
      team: "Pulse",
      name: nextPlayer.name,
      preferredPosition: nextPlayer.position,
      skillLevel: nextPlayer.skill,
    };

    setWaitlist(rest);
    setMatch((current) => ({
      ...current,
      players: [...(current.players || []), player],
      playersCount: Math.min(
        current.maxPlayers,
        (current.playersCount || current.players?.length || 0) + 1,
      ),
    }));
    setConfirmations((current) => ({ ...current, [player.id]: true }));
    setDeposits((current) => ({ ...current, [player.id]: false }));
  }

  async function checkIn() {
    setCheckedIn(true);
    setConfirmations((current) => ({ ...current, [user?.id]: true }));

    if (id.startsWith("demo-")) return;
    try {
      await matchApi.confirm(id, { status: "CHECKED_IN" });
    } catch (error) {
      setCheckedIn(false);
      setError(error.message || "Could not check in.");
    }
  }

  async function submitReview(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subjectId = form.get("subjectId");
    const comment = form.get("comment");

    if (!subjectId) return;

    if (!id.startsWith("demo-")) {
      try {
        await matchApi.review(id, {
          subjectId,
          rating: reviewRating,
          comment,
          tags: ["reliable", "team-player"],
        });
      } catch (error) {
        setResultStatus(error.message || "Could not save review.");
        return;
      }
    }

    setReviewSubmitted(true);
  }

  const reviewTargets = (match?.players || [])
    .map((player) => ({
      id: player.userId || player.id,
      name: player.user?.profile?.name || player.name || "Player",
    }))
    .filter((player) => player.id !== user?.id);

  if (!match) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-black text-white/70 shadow-glow animate-pulse">
          Loading Lobby...
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid gap-6 lg:grid-cols-[1fr_380px] pb-12"
    >
      <section className="space-y-6">
        {/* Premium Match Banner */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-obsidian p-6 sm:p-8 text-white shadow-2xl border border-white/10 transition-transform"
        >
          <img
            src="https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1400&q=85"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/80 to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald/20 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-emerald transition-colors"
            >
              <ArrowLeft size={16} /> Back to Live Feed
            </Link>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald drop-shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald shadow-glow animate-pulse" />{" "}
                  {match.status} / {match.city}
                </p>
                <h1 className="mt-2 max-w-2xl font-display text-4xl sm:text-5xl font-black leading-tight drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                  {match.title}
                </h1>
                {error && (
                  <p className="mt-3 rounded-xl bg-red-500/20 border border-red-500/30 px-3 py-2 text-xs font-bold text-red-200">
                    {error}
                  </p>
                )}
              </div>
              <div className="rounded-2xl border border-white/10 bg-surface/80 backdrop-blur-md p-4 text-center shadow-inner min-w-[100px]">
                <p className="font-display text-4xl font-black text-emerald drop-shadow-[0_0_10px_rgba(0,242,96,0.3)]">
                  {fillRate}%
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mt-1">
                  Filled
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              <Meta icon={CalendarClock} label="Kickoff">
                {new Date(match.startsAt).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Meta>
              <Meta icon={Users} label="Squad">
                {match.playersCount}/{match.maxPlayers} players
              </Meta>
              <Meta icon={MapPin} label="Location">
                {match.terrain?.name || "Pending"}
              </Meta>

              {/* Weather Widget */}
              {weather && (
                <div className="flex flex-col min-w-0 rounded-2xl bg-cyan/10 border border-cyan/20 px-4 py-3 text-sm shadow-inner text-cyan">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan/70 mb-1 flex items-center gap-1.5">
                    <weather.Icon size={12} /> {weather.condition}
                  </span>
                  <span className="font-bold truncate text-lg">
                    {weather.temp}°C
                  </span>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <ActionButton onClick={join} className="px-6 py-4 text-base">
                Reserve Spot
              </ActionButton>
              <ActionButton
                variant="ghost"
                onClick={checkIn}
                className="px-6 py-4 border-emerald/50 bg-emerald/10 text-emerald hover:bg-emerald hover:text-obsidian shadow-glow"
              >
                <ClipboardCheck size={20} />{" "}
                {checkedIn ? "Checked In" : "Check In Now"}
              </ActionButton>
              <ActionButton
                variant="ghost"
                onClick={() => setShowQR(true)}
                className="px-4 py-4 text-cyan border-cyan/30 hover:bg-cyan/10 hover:border-cyan/50"
              >
                <QrCode size={20} /> Show Ticket
              </ActionButton>
              <ActionButton
                variant="ghost"
                onClick={leave}
                className="px-4 py-4 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
              >
                Leave
              </ActionButton>
            </div>
          </div>
        </motion.div>

        {/* QR Code Modal */}
        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/90 backdrop-blur-md p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-surface border border-white/10 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl relative text-center"
              >
                <button
                  onClick={() => setShowQR(false)}
                  className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 rounded-full p-2 transition-colors"
                >
                  <X size={20} />
                </button>
                <QrCode size={40} className="text-emerald mx-auto mb-4" />
                <h2 className="font-display text-2xl font-black mb-2">
                  Match Ticket
                </h2>
                <p className="text-sm font-medium text-white/50 mb-8">
                  Show this QR code to the terrain staff or captain to confirm
                  your attendance.
                </p>

                <div className="bg-white p-4 rounded-3xl mx-auto w-48 h-48 flex items-center justify-center shadow-glow mb-6">
                  {/* Fake QR for UI purposes */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=hkick-match-${match.id}-user-${user?.id}`}
                    alt="QR Code"
                    className="w-full h-full rounded-xl"
                  />
                </div>

                <p className="text-xs font-bold uppercase tracking-widest text-emerald">
                  {match.title}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="grid gap-4 md:grid-cols-3">
          <CaptainTask
            done
            title="Pitch Selected"
            text={match.terrain?.name || "Linked after booking"}
          />
          <CaptainTask
            done={fillRate >= 70}
            title="Squad Status"
            text={`${match.maxPlayers - match.playersCount} spots left`}
          />
          <CaptainTask done title="Teams Balanced" text="Auto-optimized" />
        </section>

        {/* The components below will inherit the global styles, but ideally they'd be rewritten too. We keep them working for now. */}
        <CaptainDashboard
          match={match}
          currentUserId={user?.id}
          confirmations={confirmations}
          deposits={deposits}
          onToggleConfirmation={toggleConfirmation}
          onToggleDeposit={toggleDeposit}
          onPayDeposit={payDeposit}
          onPromoteWaitlist={promoteWaitlist}
          onNudgePlayers={nudgePlayers}
        />

        <TeamBoard players={match.players} />

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-panel rounded-[2rem] p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan mb-1">
                  Smart Waitlist
                </p>
                <h2 className="font-display text-xl font-black">
                  Next in line
                </h2>
              </div>
              <div className="p-2 bg-cyan/10 rounded-xl text-cyan">
                <UserPlus size={20} />
              </div>
            </div>
            <div className="space-y-3">
              {waitlist.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-2xl bg-surface/50 border border-white/5 px-4 py-3 hover:bg-surface transition-colors"
                >
                  <div>
                    <p className="font-bold text-sm text-white">
                      {index + 1}. {player.name}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-0.5">
                      {player.position} / L{player.skill}
                    </p>
                  </div>
                  <span className="rounded-xl bg-emerald/10 border border-emerald/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald">
                    Auto-in
                  </span>
                </div>
              ))}
            </div>
            <ActionButton
              className="mt-5 w-full py-3.5"
              variant="ghost"
              onClick={joinWaitlist}
            >
              <UserPlus size={18} /> Join waitlist
            </ActionButton>
          </div>

          <form
            onSubmit={submitScore}
            className="glass-panel rounded-[2rem] p-6 border border-white/5"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald mb-1">
                  Progression
                </p>
                <h2 className="font-display text-xl font-black">
                  Submit Result
                </h2>
              </div>
              <div className="p-2 bg-emerald/10 rounded-xl text-emerald">
                <Trophy size={20} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2 block">
                  Team Volt
                </label>
                <input
                  className="field bg-surface text-center font-display text-2xl font-black py-4 shadow-inner"
                  name="teamVolt"
                  type="number"
                  min="0"
                  defaultValue="5"
                />
              </div>
              <div className="text-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2 block">
                  Team Pulse
                </label>
                <input
                  className="field bg-surface text-center font-display text-2xl font-black py-4 shadow-inner"
                  name="teamPulse"
                  type="number"
                  min="0"
                  defaultValue="4"
                />
              </div>
            </div>

            {(scoreSubmitted || resultStatus) && (
              <p className="mt-4 rounded-xl bg-emerald/10 border border-emerald/20 px-4 py-3 text-xs font-bold text-emerald text-center">
                {resultStatus || "Score saved. XP and trust score updated."}
              </p>
            )}
            <ActionButton className="mt-6 w-full py-4 text-base">
              <Trophy size={18} /> Save Final Result
            </ActionButton>
          </form>
        </section>

        <form
          onSubmit={submitReview}
          className="glass-panel rounded-[2rem] p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-1">
                Post-match trust
              </p>
              <h2 className="font-display text-xl font-black">
                Review a player
              </h2>
            </div>
            <div className="p-2 bg-yellow-400/10 rounded-xl text-yellow-400">
              <Star size={20} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <select
              className="field bg-surface shadow-inner"
              name="subjectId"
              defaultValue={reviewTargets[0]?.id || ""}
            >
              {reviewTargets.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setReviewRating(rating)}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-all ${rating <= reviewRating ? "border-yellow-400 bg-yellow-400/20 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)]" : "border-white/10 bg-surface text-white/30 hover:bg-white/5"}`}
                >
                  <Star
                    size={18}
                    fill={rating <= reviewRating ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>
          </div>
          <input
            className="field bg-surface shadow-inner mt-4"
            name="comment"
            placeholder="Optional note for reliability and fair play"
          />
          {reviewSubmitted && (
            <p className="mt-4 rounded-xl bg-yellow-400/10 border border-yellow-400/20 px-4 py-3 text-xs font-bold text-yellow-400 text-center">
              Review saved securely.
            </p>
          )}
          <ActionButton
            className="mt-6 w-full py-4"
            disabled={!reviewTargets.length}
          >
            <Star size={18} /> Submit Review
          </ActionButton>
        </form>
      </section>

      {/* Live Chat Sidebar */}
      <aside className="glass-panel rounded-[2rem] border border-white/5 flex flex-col h-[600px] lg:h-[calc(100vh-100px)] sticky top-6">
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-surface/50 rounded-t-[2rem]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald mb-1">
              Live Room
            </p>
            <h2 className="font-display text-xl font-black">Match Chat</h2>
          </div>
          <div className="p-2 bg-emerald/10 rounded-xl text-emerald">
            <MessageCircle size={20} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((message) => {
            const isMe =
              message.user?.profile?.name === "You" ||
              message.user?.profile?.name === user?.profile?.name;
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={message.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                {!isMe && (
                  <span className="text-[10px] font-bold text-white/40 ml-2 mb-1.5">
                    {message.user?.profile?.name || "Player"}
                  </span>
                )}
                <div
                  className={`max-w-[85%] px-4 py-3 text-sm font-medium rounded-2xl ${isMe ? "bg-gradient-to-br from-emerald to-[#00A643] text-obsidian rounded-tr-sm shadow-glow" : "bg-surfaceLight/80 border border-white/5 text-white rounded-tl-sm"}`}
                >
                  {message.body}
                </div>
              </motion.div>
            );
          })}
        </div>

        <form
          onSubmit={send}
          className="p-4 pt-2 border-t border-white/5 bg-surface/30 rounded-b-[2rem]"
        >
          <div className="relative flex items-center">
            <input
              className="w-full bg-surface border border-white/10 rounded-2xl py-3.5 pl-4 pr-14 text-sm focus:outline-none focus:border-emerald/50 shadow-inner"
              name="message"
              placeholder="Type to the squad..."
            />
            <button className="absolute right-2 w-10 h-10 rounded-xl bg-emerald text-obsidian flex items-center justify-center hover:shadow-glow transition-all">
              <Send size={18} className="ml-1" />
            </button>
          </div>
        </form>
      </aside>
    </motion.div>
  );
}

function Meta({ icon: Icon, label, children }) {
  return (
    <div className="flex flex-col min-w-0 rounded-2xl bg-surface/50 border border-white/5 px-4 py-3 text-sm shadow-inner transition-colors hover:bg-surface">
      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald/70 mb-1 flex items-center gap-1.5">
        <Icon size={12} /> {label}
      </span>
      <span className="font-bold truncate">{children}</span>
    </div>
  );
}

function CaptainTask({ done, title, text }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface/50 p-5 glass-panel transition-all hover:bg-surface group">
      <CheckCircle2
        size={22}
        className={`mb-3 transition-transform group-hover:scale-110 ${done ? "text-emerald drop-shadow-[0_0_8px_rgba(0,242,96,0.5)]" : "text-white/20"}`}
      />
      <h3 className="font-bold text-white">{title}</h3>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/50">
        {text}
      </p>
    </div>
  );
}

// ... demoMatch is kept at the bottom as before
function demoMatch(matchId) {
  const now = new Date();
  return {
    id: matchId,
    title: matchId.includes("balanced")
      ? "Anfa Balanced 7v7"
      : "Maarif 5v5 Fast Fill",
    city: "Casablanca",
    startsAt: new Date(now.getTime() + 90 * 60 * 1000).toISOString(),
    maxPlayers: 10,
    playersCount: 8,
    status: "OPEN",
    terrain: { name: "Casa Arena 5v5" },
    players: [
      {
        id: "1",
        team: "Volt",
        name: "Amine",
        preferredPosition: "MID",
        skillLevel: 4,
      },
      {
        id: "2",
        team: "Pulse",
        name: "Omar",
        preferredPosition: "FWD",
        skillLevel: 5,
      },
      {
        id: "3",
        team: "Volt",
        name: "Yassine",
        preferredPosition: "DEF",
        skillLevel: 3,
      },
      {
        id: "4",
        team: "Pulse",
        name: "Hamza",
        preferredPosition: "GK",
        skillLevel: 4,
      },
      {
        id: "5",
        team: "Volt",
        name: "Mehdi",
        preferredPosition: "FWD",
        skillLevel: 5,
      },
      {
        id: "6",
        team: "Pulse",
        name: "Sami",
        preferredPosition: "MID",
        skillLevel: 3,
      },
      {
        id: "7",
        team: "Volt",
        name: "Reda",
        preferredPosition: "DEF",
        skillLevel: 2,
      },
      {
        id: "8",
        team: "Pulse",
        name: "Anas",
        preferredPosition: "FLEX",
        skillLevel: 2,
      },
    ],
    messages: [
      {
        id: "m1",
        body: "I can bring one extra player if needed.",
        user: { profile: { name: "Amine" } },
      },
      {
        id: "m2",
        body: "Teams look balanced. Keep me as MID.",
        user: { profile: { name: "Yassine" } },
      },
    ],
  };
}
