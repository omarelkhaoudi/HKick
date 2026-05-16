import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Lock,
  MapPin,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { ActionButton } from "./ActionButton";
import { matchApi, terrainApi } from "../services/api";

const defaultHours = [18, 19, 20, 21];

export function CreateMatchModal({
  open,
  onClose,
  onCreated,
  user,
  initialBooking,
}) {
  const city = user?.profile?.city || initialBooking?.city || "Casablanca";
  const [terrains, setTerrains] = useState([]);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState(() =>
    buildInitialForm(city, initialBooking),
  );

  useEffect(() => {
    if (!open) return;
    setForm(buildInitialForm(city, initialBooking));
    setStatus("");
    terrainApi
      .list()
      .then((data) => setTerrains(data.terrains || []))
      .catch(() => setTerrains([]));
  }, [city, initialBooking, open]);

  const selectedTerrain = useMemo(
    () => terrains.find((terrain) => terrain.id === form.terrainId),
    [form.terrainId, terrains],
  );

  if (!open) return null;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setStatus("Creating match...");

    const startsAt = new Date(`${form.date}T${form.time}:00`);
    if (Number.isNaN(startsAt.getTime())) {
      setStatus("Choose a valid date and time.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      city: form.city.trim(),
      startsAt: startsAt.toISOString(),
      maxPlayers: Number(form.maxPlayers),
      visibility: form.visibility,
      terrainId: form.terrainId || null,
    };

    try {
      const data = await matchApi.create(payload);
      setStatus("Match created.");
      onCreated?.(data.match);
      onClose();
    } catch {
      const demoMatch = {
        id: `demo-created-${Date.now()}`,
        ...payload,
        playersCount: 1,
        status: "OPEN",
        averageSkill: user?.profile?.skillLevel || 3,
        terrain: {
          name:
            selectedTerrain?.name ||
            initialBooking?.terrainName ||
            "Pitch pending",
          address: selectedTerrain?.address || initialBooking?.address,
        },
      };
      onCreated?.(demoMatch);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-4 pt-16 backdrop-blur-sm sm:items-center sm:p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-2xl border border-[#333333] bg-[#121212] p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-emerald">
              Captain mode
            </p>
            <h2 className="mt-1 text-2xl font-black">
              Create a realistic match
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-button"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-white/50">
              Match title
            </span>
            <input
              className="field"
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              required
              minLength={3}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase text-white/50">
                <MapPin size={13} /> City
              </span>
              <input
                className="field"
                value={form.city}
                onChange={(event) => update("city", event.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase text-white/50">
                <Users size={13} /> Players
              </span>
              <select
                className="field"
                value={form.maxPlayers}
                onChange={(event) => update("maxPlayers", event.target.value)}
              >
                {[8, 10, 12, 14, 16, 18, 22].map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase text-white/50">
                <CalendarClock size={13} /> Date
              </span>
              <input
                className="field"
                type="date"
                value={form.date}
                onChange={(event) => update("date", event.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase text-white/50">
                Kickoff
              </span>
              <select
                className="field"
                value={form.time}
                onChange={(event) => update("time", event.target.value)}
              >
                {defaultHours.map((hour) => (
                  <option key={hour} value={`${hour}:00`}>
                    {hour}:00
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-white/50">
              Pitch
            </span>
            <select
              className="field"
              value={form.terrainId}
              onChange={(event) => update("terrainId", event.target.value)}
            >
              <option value="">
                {initialBooking?.terrainName || "Choose later"}
              </option>
              {terrains.map((terrain) => (
                <option key={terrain.id} value={terrain.id}>
                  {terrain.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => update("visibility", "PUBLIC")}
              className={optionClass(form.visibility === "PUBLIC")}
            >
              <ShieldCheck size={16} /> Public
            </button>
            <button
              type="button"
              onClick={() => update("visibility", "PRIVATE")}
              className={optionClass(form.visibility === "PRIVATE")}
            >
              <Lock size={16} /> Private
            </button>
          </div>

          <div className="rounded-xl bg-[#1A1A1A] p-3 text-sm text-white/65">
            {selectedTerrain?.name ||
              initialBooking?.terrainName ||
              "No pitch linked yet"}{" "}
            / balanced squads, live chat, waitlist and deposit-ready flow.
          </div>

          {status && <p className="text-sm font-bold text-cyan">{status}</p>}
          <ActionButton
            className="w-full"
            disabled={status === "Creating match..."}
          >
            Create Match
          </ActionButton>
        </div>
      </form>
    </div>
  );
}

function buildInitialForm(city, booking) {
  const startsAt = booking?.startsAt
    ? new Date(booking.startsAt)
    : new Date(Date.now() + 2 * 60 * 60 * 1000);
  return {
    title: booking?.terrainName
      ? `${booking.terrainName} squad`
      : `${city} football session`,
    city,
    date: startsAt.toISOString().slice(0, 10),
    time: `${String(startsAt.getHours()).padStart(2, "0")}:00`,
    maxPlayers: 10,
    visibility: "PUBLIC",
    terrainId: booking?.terrainId || "",
  };
}

function optionClass(active) {
  return `flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition ${
    active
      ? "border-emerald bg-emerald text-obsidian"
      : "border-[#333333] bg-[#1E1E1E] text-white/70 hover:border-emerald hover:text-emerald"
  }`;
}
