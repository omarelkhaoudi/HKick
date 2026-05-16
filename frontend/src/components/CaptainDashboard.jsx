import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  ClipboardList,
  MessageSquareText,
  ShieldCheck,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { ActionButton } from "./ActionButton";

export function CaptainDashboard({
  match,
  currentUserId,
  confirmations,
  deposits,
  onToggleConfirmation,
  onToggleDeposit,
  onPayDeposit,
  onPromoteWaitlist,
  onNudgePlayers,
}) {
  const players = normalizePlayers(match?.players || []);
  const confirmedCount = players.filter(
    (player) => confirmations[player.id],
  ).length;
  const depositCount = players.filter((player) => deposits[player.id]).length;
  const unpaidPlayers = players.filter((player) => !deposits[player.id]);
  const riskPlayers = players.filter(
    (player) => !confirmations[player.id] || !deposits[player.id],
  );
  const spotsLeft = Math.max(
    0,
    (match?.maxPlayers || 0) - (match?.playersCount || players.length),
  );
  const readiness = players.length
    ? Math.round(((confirmedCount + depositCount) / (players.length * 2)) * 100)
    : 0;

  return (
    <section className="space-y-3">
      <div className="rounded-lg border border-emerald/30 bg-emerald/10 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase text-emerald">
              <ClipboardList size={15} /> Captain control
            </p>
            <h2 className="mt-1 text-2xl font-black">Match operations</h2>
            <p className="mt-1 text-sm font-semibold text-white/55">
              Confirm players, deposits and last-minute risk before kickoff.
            </p>
          </div>
          <span className="rounded-lg bg-emerald px-3 py-2 text-sm font-black text-obsidian">
            {readiness}% ready
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <CaptainMetric
            label="Confirmed"
            value={`${confirmedCount}/${players.length}`}
            icon={CheckCircle2}
          />
          <CaptainMetric
            label="Deposits"
            value={`${depositCount}/${players.length}`}
            icon={Banknote}
          />
          <CaptainMetric label="Open spots" value={spotsLeft} icon={UserPlus} />
          <CaptainMetric
            label="Risk"
            value={riskPlayers.length}
            icon={AlertTriangle}
            tone={riskPlayers.length ? "warn" : "ok"}
          />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-turf dark:text-limeball">
                Attendance
              </p>
              <h3 className="text-xl font-black">Player commitments</h3>
            </div>
            <ShieldCheck size={20} />
          </div>

          <div className="mt-4 space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="rounded-lg bg-black/[0.04] p-3 dark:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-black">{player.name}</p>
                    <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">
                      {player.position} / Team {player.team || "TBD"}
                    </p>
                  </div>
                  <span
                    className={`rounded-lg px-2 py-1 text-xs font-black ${confirmations[player.id] && deposits[player.id] ? "bg-limeball text-ink" : "bg-amber-400/15 text-amber-200"}`}
                  >
                    {confirmations[player.id] && deposits[player.id]
                      ? "Locked"
                      : "Pending"}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleConfirmation(player.id)}
                    className={toggleClass(confirmations[player.id])}
                  >
                    <CheckCircle2 size={15} />{" "}
                    {confirmations[player.id] ? "Confirmed" : "Confirm"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      player.id === currentUserId
                        ? onPayDeposit(player.id)
                        : onToggleDeposit(player.id)
                    }
                    className={toggleClass(deposits[player.id])}
                  >
                    <Banknote size={15} />{" "}
                    {deposits[player.id]
                      ? "Deposit paid"
                      : player.id === currentUserId
                        ? "Pay online"
                        : "Mark deposit"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-turf dark:text-limeball">
                  Risk list
                </p>
                <h3 className="text-xl font-black">Needs action</h3>
              </div>
              <AlertTriangle size={20} />
            </div>
            <div className="mt-4 space-y-2">
              {riskPlayers.slice(0, 4).map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-black/[0.04] px-3 py-2.5 dark:bg-white/[0.06]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-black">{player.name}</p>
                    <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">
                      {!confirmations[player.id]
                        ? "Needs confirmation"
                        : "Deposit missing"}
                    </p>
                  </div>
                  <UserMinus size={16} className="text-amber-300" />
                </div>
              ))}
              {!riskPlayers.length && (
                <p className="rounded-lg bg-limeball/15 px-3 py-3 text-sm font-black text-limeball">
                  All players are locked.
                </p>
              )}
            </div>
            <ActionButton
              variant="ghost"
              className="mt-4 w-full"
              onClick={onNudgePlayers}
            >
              <MessageSquareText size={17} /> Send reminders
            </ActionButton>
          </div>

          <div className="rounded-lg border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/10">
            <p className="text-xs font-black uppercase text-turf dark:text-limeball">
              Payments
            </p>
            <h3 className="mt-1 text-xl font-black">Collection plan</h3>
            <div className="mt-4 space-y-2 text-sm font-bold text-black/60 dark:text-white/60">
              <p className="flex justify-between">
                <span>Deposit target</span>
                <span>MAD {players.length * 50}</span>
              </p>
              <p className="flex justify-between">
                <span>Collected</span>
                <span>MAD {depositCount * 50}</span>
              </p>
              <p className="flex justify-between">
                <span>Remaining</span>
                <span>MAD {unpaidPlayers.length * 50}</span>
              </p>
            </div>
            <ActionButton className="mt-4 w-full" onClick={onPromoteWaitlist}>
              <UserPlus size={17} /> Fill risky spot
            </ActionButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function CaptainMetric({ label, value, icon: Icon, tone = "ok" }) {
  return (
    <div className="rounded-xl bg-[#121212] p-3">
      <Icon
        size={16}
        className={tone === "warn" ? "text-amber-300" : "text-emerald"}
      />
      <p className="mt-2 text-xl font-black">{value}</p>
      <p className="text-[10px] font-bold uppercase text-white/45">{label}</p>
    </div>
  );
}

function normalizePlayers(players) {
  return players.map((player) => ({
    id: player.userId || player.id,
    name: player.user?.profile?.name || player.name || "Player",
    position:
      player.user?.profile?.preferredPosition ||
      player.preferredPosition ||
      "FLEX",
    team: player.team,
  }));
}

function toggleClass(active) {
  return `inline-flex items-center justify-center gap-2 rounded-lg border px-2 py-2 text-xs font-black transition ${
    active
      ? "border-limeball bg-limeball text-ink"
      : "border-black/10 bg-white/70 text-black/60 hover:border-limeball dark:border-white/10 dark:bg-white/5 dark:text-white/65"
  }`;
}
