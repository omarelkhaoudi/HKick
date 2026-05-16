import { useEffect, useState } from "react";
import { CalendarPlus, MapPin, Plus, Star, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { bookingApi, terrainApi } from "../services/api";
import { CreateMatchModal } from "../components/CreateMatchModal";
import { useAuthStore } from "../store/authStore";

export function TerrainsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [terrains, setTerrains] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [bookingState, setBookingState] = useState({});
  const [matchBooking, setMatchBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hkick_bookings") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    terrainApi
      .list()
      .then((data) =>
        setTerrains(
          data.terrains.length >= requestedTerrains.length
            ? data.terrains
            : demoTerrains,
        ),
      )
      .catch(() => setTerrains(demoTerrains));
  }, []);

  function selectSlot(terrainId, slot) {
    setSelectedSlots((current) => ({ ...current, [terrainId]: slot }));
    setBookingState((current) => ({ ...current, [terrainId]: "" }));
  }

  async function book(terrain, slot = selectedSlots[terrain.id]) {
    if (!slot) {
      setBookingState((current) => ({
        ...current,
        [terrain.id]: "Select a time slot first.",
      }));
      return;
    }

    setBookingState((current) => ({
      ...current,
      [terrain.id]: "Reserving...",
    }));

    if (terrain.id.startsWith("demo-")) {
      setTimeout(() => {
        addBooking(terrain, slot, {
          id: `demo-booking-${Date.now()}`,
          status: "CONFIRMED",
        });
        setTerrains((items) =>
          items.map((item) =>
            item.id === terrain.id
              ? {
                  ...item,
                  availableHours: item.availableHours.filter(
                    (available) => available.id !== slot.id,
                  ),
                }
              : item,
          ),
        );
        setSelectedSlots((current) => ({ ...current, [terrain.id]: null }));
        setBookingState((current) => ({
          ...current,
          [terrain.id]: "Success! Pitch secured.",
        }));
      }, 600);
      return;
    }

    try {
      const data = await bookingApi.create({
        terrainId: terrain.id,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
      });
      addBooking(terrain, slot, data.booking);
    } catch (error) {
      setBookingState((current) => ({
        ...current,
        [terrain.id]: error.message || "Failed to secure pitch.",
      }));
      return;
    }

    setTerrains((items) =>
      items.map((item) =>
        item.id === terrain.id
          ? {
              ...item,
              availableHours: item.availableHours.filter(
                (available) => available.id !== slot.id,
              ),
            }
          : item,
      ),
    );
    setSelectedSlots((current) => ({ ...current, [terrain.id]: null }));
    setBookingState((current) => ({
      ...current,
      [terrain.id]: "Success! Pitch secured.",
    }));
  }

  function addBooking(terrain, slot, booking) {
    const nextBooking = {
      id: booking.id,
      terrainId: terrain.id.startsWith("demo-") ? "" : terrain.id,
      terrainName: terrain.name,
      city: terrain.city,
      address: terrain.address,
      imageUrl: terrain.imageUrl,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      status: booking.status || "CONFIRMED",
      pricePerHour: terrain.pricePerHour,
    };

    setBookings((current) => {
      const next = [
        nextBooking,
        ...current.filter((item) => item.id !== nextBooking.id),
      ].slice(0, 8);
      localStorage.setItem("hkick_bookings", JSON.stringify(next));
      return next;
    });
  }

  const filteredTerrains = terrains.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      {/* Header & Search */}
      <header className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight">
              Explore Pitches
            </h1>
            <p className="text-sm text-white/50 mt-1 font-medium">
              Find and book the best local turfs.
            </p>
          </div>
          <div className="bg-emerald/10 border border-emerald/20 text-emerald px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(0,242,96,0.15)]">
            {terrains.length} Pitches
          </div>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-emerald transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="field pl-11 py-3.5 bg-surface/50 shadow-inner rounded-2xl w-full"
            />
          </div>
          <button className="flex-shrink-0 w-12 h-12 bg-surface/50 border border-white/10 rounded-2xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors shadow-inner">
            <Filter size={20} />
          </button>
        </div>
      </header>

      {/* Bookings Carousel */}
      {bookings.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest">
              Upcoming Matches
            </h2>
            <button className="text-xs font-bold text-emerald hover:text-emerald/80 transition-colors">
              View All
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {bookings.map((booking) => (
              <motion.div
                whileHover={{ y: -4 }}
                key={booking.id}
                className="min-w-[260px] snap-center glass-panel rounded-2xl overflow-hidden flex flex-col group border border-white/10 hover:border-emerald/30 transition-all duration-300"
              >
                <div className="relative h-28 overflow-hidden">
                  <img
                    src={booking.imageUrl || fallbackPitchImage}
                    onError={useFallbackImage}
                    alt=""
                    className="h-full w-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
                  <div className="absolute top-3 right-3 bg-obsidian/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-emerald border border-white/10">
                    CONFIRMED
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-base truncate drop-shadow-md">
                      {booking.terrainName}
                    </h3>
                    <p className="text-xs text-white/80 font-medium">
                      {new Date(booking.startsAt).toLocaleDateString()} •{" "}
                      {new Date(booking.startsAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-surface/40">
                  <button
                    onClick={() => setMatchBooking(booking)}
                    className="w-full bg-white/5 hover:bg-emerald text-white hover:text-obsidian hover:shadow-glow transition-all duration-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-white/10 hover:border-transparent"
                  >
                    <Plus size={16} /> Create Match Invite
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Terrains List */}
      <div className="space-y-6 pb-10">
        {filteredTerrains.map((terrain) => {
          const selectedSlot = selectedSlots[terrain.id];
          const status = bookingState[terrain.id];

          return (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              key={terrain.id}
              className="glass-panel rounded-[2rem] overflow-hidden group border border-white/5 hover:border-white/10 transition-colors duration-500"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={terrain.imageUrl || fallbackPitchImage}
                  onError={useFallbackImage}
                  alt=""
                  className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent opacity-90" />

                {/* Top badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <div className="flex gap-2">
                    {terrain.amenities.slice(0, 2).map((amenity) => (
                      <span
                        key={amenity}
                        className="bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[10px] font-bold text-white/90 uppercase tracking-wide"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 text-sm font-black text-white border border-white/10 shadow-lg">
                    <Star
                      size={14}
                      className="text-yellow-400"
                      fill="currentColor"
                    />{" "}
                    {terrain.rating}
                  </div>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                  <div className="flex-1 pr-4">
                    <h2 className="font-display text-2xl font-black text-white leading-tight mb-1 drop-shadow-lg">
                      {terrain.name}
                    </h2>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-white/70 drop-shadow">
                      <MapPin size={14} className="text-cyan" />{" "}
                      {terrain.address}
                    </p>
                  </div>
                  <div className="text-right shrink-0 bg-black/40 backdrop-blur-md p-2.5 rounded-2xl border border-white/10">
                    <p className="text-xl font-black text-emerald leading-none">
                      {terrain.pricePerHour}
                    </p>
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                      MAD / HR
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-b from-surface/40 to-surface/80">
                <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">
                  Available Sessions
                </h4>
                <div className="grid grid-cols-4 gap-2.5">
                  {terrain.availableHours.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => selectSlot(terrain.id, slot)}
                      className={`relative overflow-hidden rounded-xl border transition-all duration-300 flex flex-col items-center justify-center py-2.5 ${
                        selectedSlot?.id === slot.id
                          ? "border-emerald bg-emerald text-obsidian shadow-glow scale-[1.02]"
                          : "border-white/10 bg-white/5 text-white/70 hover:border-emerald/50 hover:bg-emerald/10 hover:text-emerald"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5">
                        {new Date(slot.startsAt).toLocaleDateString([], {
                          weekday: "short",
                        })}
                      </span>
                      <span className="text-sm font-black">
                        {new Date(slot.startsAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {selectedSlot && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="flex flex-col gap-3 overflow-hidden"
                    >
                      {status && (
                        <p
                          className={`text-sm font-semibold text-center ${status.includes("Success") ? "text-emerald" : status.includes("Reserving") ? "text-white/60 animate-pulse" : "text-red-400"}`}
                        >
                          {status}
                        </p>
                      )}
                      <button
                        onClick={() => book(terrain)}
                        disabled={status === "Reserving..."}
                        className="w-full bg-gradient-to-r from-emerald to-[#00d455] text-obsidian font-black text-base py-3.5 rounded-xl hover:shadow-[0_0_20px_rgba(0,242,96,0.4)] transition-all duration-300 flex items-center justify-center gap-2 border border-emerald/50 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <CalendarPlus size={20} />{" "}
                        {status === "Reserving..."
                          ? "Processing..."
                          : "Confirm Booking"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.article>
          );
        })}
        {filteredTerrains.length === 0 && (
          <div className="text-center py-12 glass-panel rounded-2xl border border-white/5">
            <p className="text-white/50 font-medium">
              No pitches found matching your search.
            </p>
          </div>
        )}
      </div>

      <CreateMatchModal
        open={Boolean(matchBooking)}
        onClose={() => setMatchBooking(null)}
        onCreated={(match) => navigate(`/matches/${match.id}`)}
        user={user}
        initialBooking={matchBooking}
      />
    </div>
  );
}

const requestedTerrains = [
  {
    id: "demo-miro-foot",
    name: "Miro Foot",
    city: "Casablanca",
    address: "Sidi Maarouf, Casablanca",
    imageUrl:
      "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1200&q=80",
    pricePerHour: 250,
    rating: 4.8,
    amenities: ["5v5", "Lighting", "Parking"],
  },
  {
    id: "demo-campus-sport",
    name: "CAMPUS Sport",
    city: "Casablanca",
    address: "Oasis, Casablanca",
    imageUrl:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
    pricePerHour: 280,
    rating: 4.7,
    amenities: ["5v5", "Cafe", "Locker rooms"],
  },
  {
    id: "demo-arena-bouskoura",
    name: "ARENA Bouskoura",
    city: "Casablanca",
    address: "Bouskoura, Casablanca",
    imageUrl:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80",
    pricePerHour: 320,
    rating: 4.9,
    amenities: ["7v7", "Premium turf", "Parking"],
  },
  {
    id: "demo-city-foot-5",
    name: "City Foot 5",
    city: "Casablanca",
    address: "Ain Sebaa, Casablanca",
    imageUrl:
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=80",
    pricePerHour: 220,
    rating: 4.6,
    amenities: ["5v5", "Lighting", "Showers"],
  },
  {
    id: "demo-etoile-5",
    name: "Etoile 5",
    city: "Casablanca",
    address: "Racine, Casablanca",
    imageUrl:
      "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1200&q=80",
    pricePerHour: 260,
    rating: 4.7,
    amenities: ["5v5", "Cafe", "Parking"],
  },
  {
    id: "demo-club-el-firdaouss",
    name: "Club El Firdaouss",
    city: "Casablanca",
    address: "Hay El Firdaouss, Casablanca",
    imageUrl:
      "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=80",
    pricePerHour: 230,
    rating: 4.5,
    amenities: ["5v5", "Lighting", "Family"],
  },
];

const demoTerrains = requestedTerrains.map((terrain, index) => ({
  ...terrain,
  availableHours: demoSlots(index % 3),
}));

function demoSlots(offset = 0) {
  const now = new Date();
  return [18, 19, 20, 21].map((hour, index) => {
    const startsAt = new Date(now);
    startsAt.setDate(now.getDate() + offset);
    startsAt.setHours(hour, 0, 0, 0);
    const endsAt = new Date(startsAt);
    endsAt.setHours(hour + 1);
    return {
      id: `demo-slot-${offset}-${index}`,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    };
  });
}

const fallbackPitchImage =
  "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1200&q=80";

function useFallbackImage(event) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = fallbackPitchImage;
}
