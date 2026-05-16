import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CalendarClock,
  CheckCircle2,
  Gauge,
  MapPinned,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { opsApi } from "../services/api";

export function OpsPage() {
  const [summary, setSummary] = useState(() => demoSummary());
  const [source, setSource] = useState("demo");

  useEffect(() => {
    opsApi
      .summary()
      .then((data) => {
        setSummary(data);
        setSource("live");
      })
      .catch(() => {
        setSummary(demoSummary());
        setSource("demo");
      });
  }, []);
  const activeMatches = summary.matches.filter((match) =>
    ["OPEN", "FULL", "LIVE"].includes(match.status),
  );

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      <section className="relative overflow-hidden rounded-2xl bg-[#121212] p-5 border border-[#333333]">
        <img
          src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/90 to-obsidian/40" />
        <div className="relative">
          <p className="flex items-center gap-2 text-xs font-black uppercase text-emerald">
            <Gauge size={15} /> Ops dashboard
          </p>
          <h1 className="mt-2 text-3xl font-black">Today control room</h1>
          <p className="mt-2 text-sm font-semibold text-white/60">
            Track revenue, pitch usage, match fill rate and operational risk.
          </p>
          <span className="mt-4 inline-flex rounded-lg bg-white/10 px-2 py-1 text-xs font-black uppercase text-white/55">
            {source === "live" ? "Live Prisma data" : "Demo fallback"}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <OpsMetric
          icon={Banknote}
          label="Revenue"
          value={`MAD ${summary.metrics.revenue}`}
        />
        <OpsMetric
          icon={MapPinned}
          label="Utilization"
          value={`${summary.metrics.utilization}%`}
        />
        <OpsMetric
          icon={Users}
          label="Avg fill"
          value={`${summary.metrics.averageFill}%`}
        />
        <OpsMetric
          icon={AlertTriangle}
          label="Risk"
          value={summary.metrics.riskCount}
          tone={summary.metrics.riskCount ? "warn" : "ok"}
        />
      </section>

      <section className="rounded-2xl border border-[#333333] bg-[#121212]/80 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-emerald">
              Match pipeline
            </p>
            <h2 className="text-xl font-black">Live operations</h2>
          </div>
          <TrendingUp size={20} />
        </div>

        <div className="mt-4 space-y-2">
          {activeMatches.slice(0, 5).map((match) => {
            const fillRate = Math.min(
              100,
              Math.round(((match.playersCount || 0) / match.maxPlayers) * 100),
            );
            const spotsLeft = match.maxPlayers - (match.playersCount || 0);

            return (
              <Link
                key={match.id}
                to={`/matches/${match.id}`}
                className="block rounded-xl bg-[#1A1A1A] p-3 transition hover:bg-[#222]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-black">{match.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-bold uppercase text-white/45">
                      <CalendarClock size={13} />{" "}
                      {new Date(match.startsAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      / {match.terrain?.name || match.city}
                    </p>
                  </div>
                  <span
                    className={`rounded-lg px-2 py-1 text-xs font-black ${spotsLeft >= 3 ? "bg-amber-400/15 text-amber-200" : "bg-emerald/15 text-emerald"}`}
                  >
                    {spotsLeft} left
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald"
                    style={{ width: `${fillRate}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {summary.riskMatches.length > 0 && (
        <section className="rounded-2xl border border-[#333333] bg-[#121212]/80 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-amber-300">
                Attention queue
              </p>
              <h2 className="text-xl font-black">Operational risks</h2>
            </div>
            <AlertTriangle size={20} />
          </div>
          <div className="mt-4 space-y-2">
            {summary.riskMatches.slice(0, 4).map((match) => (
              <Link
                key={match.id}
                to={`/matches/${match.id}`}
                className="block rounded-xl bg-[#1A1A1A] px-3 py-3 transition hover:bg-[#222]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-black">{match.title}</p>
                    <p className="text-xs font-bold uppercase text-white/45">
                      {match.risk.spotsLeft} spots /{" "}
                      {match.risk.missingConfirmations} confirmations /{" "}
                      {match.risk.missingDeposits} deposits
                    </p>
                  </div>
                  <span className="rounded-lg bg-amber-400/15 px-2 py-1 text-xs font-black text-amber-200">
                    R{match.risk.score}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-[#333333] bg-[#121212]/80 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase text-emerald">
              Venue calendar
            </p>
            <h2 className="text-xl font-black">Confirmed bookings</h2>
          </div>
          <CheckCircle2 size={20} />
        </div>
        <div className="mt-4 space-y-2">
          {summary.bookings.slice(0, 5).map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-[#1A1A1A] px-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-black">{booking.terrainName}</p>
                <p className="text-xs font-bold uppercase text-white/45">
                  {new Date(booking.startsAt).toLocaleDateString()} /{" "}
                  {new Date(booking.startsAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span className="rounded-lg bg-cyan/10 px-2 py-1 text-xs font-black text-cyan">
                MAD {booking.pricePerHour || 250}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function OpsMetric({ icon: Icon, label, value, tone = "ok" }) {
  return (
    <div className="rounded-2xl border border-[#333333] bg-[#121212]/80 p-4">
      <Icon
        size={18}
        className={tone === "warn" ? "text-amber-300" : "text-emerald"}
      />
      <p className="mt-3 text-2xl font-black">{value}</p>
      <p className="text-xs font-bold uppercase text-white/45">{label}</p>
    </div>
  );
}

function demoMatches() {
  const now = new Date();
  return [
    demoMatch("demo-ops-1", "Maarif 5v5 Evening", 8, 10, 90),
    demoMatch("demo-ops-2", "Anfa Pro Training", 11, 14, 180),
    demoMatch("demo-ops-3", "Bouskoura 7v7", 9, 14, 240),
  ].map((match) => ({
    ...match,
    startsAt: new Date(now.getTime() + match.offset * 60000).toISOString(),
  }));
}

function demoMatch(id, title, playersCount, maxPlayers, offset) {
  return {
    id,
    title,
    city: "Casablanca",
    playersCount,
    maxPlayers,
    offset,
    status: "OPEN",
    terrain: { name: "Casa Arena" },
  };
}

function demoBookings() {
  const now = new Date();
  return [
    {
      id: "b1",
      terrainName: "Miro Foot",
      startsAt: new Date(now.getTime() + 60 * 60000).toISOString(),
      pricePerHour: 250,
    },
    {
      id: "b2",
      terrainName: "Campus Sport",
      startsAt: new Date(now.getTime() + 120 * 60000).toISOString(),
      pricePerHour: 280,
    },
    {
      id: "b3",
      terrainName: "ARENA Bouskoura",
      startsAt: new Date(now.getTime() + 180 * 60000).toISOString(),
      pricePerHour: 320,
    },
  ];
}

function demoSummary() {
  const matches = demoMatches();
  const bookings = demoBookings();
  const activeMatches = matches.filter((match) =>
    ["OPEN", "FULL", "LIVE"].includes(match.status),
  );
  const averageFill = Math.round(
    (activeMatches.reduce(
      (sum, match) => sum + (match.playersCount || 0) / match.maxPlayers,
      0,
    ) *
      100) /
      activeMatches.length,
  );
  const riskMatches = matches
    .map((match) => ({
      ...match,
      risk: {
        score: match.maxPlayers - match.playersCount >= 3 ? 3 : 1,
        spotsLeft: match.maxPlayers - match.playersCount,
        missingConfirmations:
          match.maxPlayers - match.playersCount >= 3 ? 2 : 0,
        missingDeposits: match.maxPlayers - match.playersCount >= 3 ? 3 : 1,
      },
    }))
    .filter((match) => match.risk.score > 1);

  return {
    metrics: {
      revenue: bookings.reduce((sum, booking) => sum + booking.pricePerHour, 0),
      utilization: 60,
      averageFill,
      riskCount: riskMatches.length,
      bookedSlots: bookings.length,
      totalSlots: 5,
    },
    matches,
    riskMatches,
    bookings,
    generatedAt: new Date().toISOString(),
  };
}
