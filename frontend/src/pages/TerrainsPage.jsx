import { useEffect, useState } from 'react';
import { CalendarPlus, CheckCircle2, Clock3, MapPin, Navigation, Plus, Star } from 'lucide-react';
import { ActionButton } from '../components/ActionButton';
import { bookingApi, terrainApi } from '../services/api';

export function TerrainsPage() {
  const [terrains, setTerrains] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [bookingState, setBookingState] = useState({});
  const [bookings, setBookings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hkick_bookings') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    terrainApi.list()
      .then((data) => setTerrains(data.terrains.length >= requestedTerrains.length ? data.terrains : demoTerrains))
      .catch(() => setTerrains(demoTerrains));
  }, []);

  function selectSlot(terrainId, slot) {
    setSelectedSlots((current) => ({ ...current, [terrainId]: slot }));
    setBookingState((current) => ({ ...current, [terrainId]: '' }));
  }

  async function book(terrain, slot = selectedSlots[terrain.id]) {
    if (!slot) {
      setBookingState((current) => ({ ...current, [terrain.id]: 'Choose an hour first.' }));
      return;
    }

    setBookingState((current) => ({ ...current, [terrain.id]: 'Booking...' }));

    if (terrain.id.startsWith('demo-')) {
      setTimeout(() => {
        addBooking(terrain, slot, { id: `demo-booking-${Date.now()}`, status: 'CONFIRMED' });
        setTerrains((items) =>
          items.map((item) =>
            item.id === terrain.id
              ? { ...item, availableHours: item.availableHours.filter((available) => available.id !== slot.id) }
              : item
          )
        );
        setSelectedSlots((current) => ({ ...current, [terrain.id]: null }));
        setBookingState((current) => ({ ...current, [terrain.id]: 'Pitch reserved. Demo confirmation created.' }));
      }, 350);
      return;
    }

    try {
      const data = await bookingApi.create({
        terrainId: terrain.id,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt
      });
      addBooking(terrain, slot, data.booking);
    } catch (error) {
      setBookingState((current) => ({ ...current, [terrain.id]: error.message || 'Could not reserve this pitch.' }));
      return;
    }

    setTerrains((items) =>
      items.map((item) =>
        item.id === terrain.id
          ? { ...item, availableHours: item.availableHours.filter((available) => available.id !== slot.id) }
          : item
      )
    );
    setSelectedSlots((current) => ({ ...current, [terrain.id]: null }));
    setBookingState((current) => ({ ...current, [terrain.id]: 'Pitch reserved successfully.' }));
  }

  function addBooking(terrain, slot, booking) {
    const nextBooking = {
      id: booking.id,
      terrainName: terrain.name,
      address: terrain.address,
      imageUrl: terrain.imageUrl,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      status: booking.status || 'CONFIRMED',
      pricePerHour: terrain.pricePerHour
    };

    setBookings((current) => {
      const next = [nextBooking, ...current.filter((item) => item.id !== nextBooking.id)].slice(0, 8);
      localStorage.setItem('hkick_bookings', JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-lg bg-ink p-5 text-white sm:p-7">
        <img src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1500&q=85" alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-black uppercase text-limeball">Pitch marketplace</p>
          <h1 className="mt-2 text-4xl font-black leading-none sm:text-5xl">Book the terrain from the same flow as the match.</h1>
          <p className="mt-4 font-semibold text-white/70">
            HKick should feel more operational than a directory: live slots, payment-ready booking, distance, trust, and match context.
          </p>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Signal icon={Clock3} title="Live slots" text="Show only hours that can still convert." />
        <Signal icon={CheckCircle2} title="No-show control" text="Ready for deposits and player reliability." />
        <Signal icon={Navigation} title="Near the squad" text="Prioritize pitches near active players." />
      </section>

      <section className="rounded-lg border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-turf dark:text-limeball">My bookings</p>
            <h2 className="text-2xl font-black">Reserved pitches</h2>
          </div>
          <span className="rounded-lg bg-limeball px-3 py-2 text-sm font-black text-ink">{bookings.length}</span>
        </div>

        {bookings.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {bookings.map((booking) => (
              <article key={booking.id} className="grid grid-cols-[92px_1fr] overflow-hidden rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/10">
                <img src={booking.imageUrl || fallbackPitchImage} onError={useFallbackImage} alt="" className="h-full min-h-28 w-full object-cover" />
                <div className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black">{booking.terrainName}</h3>
                      <p className="mt-1 text-sm font-semibold text-black/55 dark:text-white/55">{booking.address}</p>
                    </div>
                    <span className="rounded-lg bg-turf px-2 py-1 text-xs font-black text-white">{booking.status}</span>
                  </div>
                  <p className="mt-3 text-sm font-black">
                    {new Date(booking.startsAt).toLocaleDateString([], { weekday: 'long', day: '2-digit', month: 'short' })} / {new Date(booking.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <button className="mt-3 inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm font-black transition hover:border-limeball hover:bg-limeball hover:text-ink dark:border-white/10">
                    <Plus size={15} /> Create match here
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-black/[0.04] px-4 py-3 text-sm font-bold text-black/55 dark:bg-white/[0.06] dark:text-white/55">
            Your reserved pitches will appear here after confirmation.
          </p>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {terrains.map((terrain) => {
          const selectedSlot = selectedSlots[terrain.id];
          const status = bookingState[terrain.id];

          return (
          <article key={terrain.id} className="overflow-hidden rounded-lg border border-black/10 bg-white/85 shadow-sm dark:border-white/10 dark:bg-white/10">
            <div className="relative">
              <img src={terrain.imageUrl || fallbackPitchImage} onError={useFallbackImage} alt="" className="h-60 w-full object-cover" />
              <div className="absolute left-3 top-3 rounded-lg bg-limeball px-3 py-2 text-xs font-black uppercase text-ink">Available tonight</div>
              <span className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-ink/90 px-2.5 py-1 text-sm font-black text-limeball">
                <Star size={14} fill="currentColor" /> {terrain.rating}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">{terrain.name}</h2>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-black/60 dark:text-white/60"><MapPin size={15} /> {terrain.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black">MAD {terrain.pricePerHour}</p>
                  <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">per hour</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {terrain.amenities.map((amenity) => <span key={amenity} className="rounded-lg bg-black/[0.06] px-3 py-1 text-xs font-bold dark:bg-white/10">{amenity}</span>)}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {terrain.availableHours.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => selectSlot(terrain.id, slot)}
                    className={`rounded-lg border px-3 py-2 text-sm font-black transition hover:border-limeball hover:bg-limeball hover:text-ink ${
                      selectedSlot?.id === slot.id
                        ? 'border-limeball bg-limeball text-ink'
                        : 'border-black/10 dark:border-white/10'
                    }`}
                  >
                    {new Date(slot.startsAt).toLocaleDateString([], { weekday: 'short' })}<br />
                    {new Date(slot.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </button>
                ))}
              </div>

              {selectedSlot && (
                <p className="mt-3 rounded-lg bg-limeball/15 px-3 py-2 text-sm font-black text-turf dark:text-limeball">
                  Selected: {new Date(selectedSlot.startsAt).toLocaleDateString([], { weekday: 'long' })} at {new Date(selectedSlot.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
              {status && (
                <p className="mt-3 rounded-lg bg-black/[0.04] px-3 py-2 text-sm font-bold text-black/60 dark:bg-white/[0.06] dark:text-white/65">
                  {status}
                </p>
              )}

              <ActionButton className="mt-4 w-full" onClick={() => book(terrain)} disabled={status === 'Booking...'}>
                <CalendarPlus size={17} /> {status === 'Booking...' ? 'Reserving...' : 'Reserve pitch'}
              </ActionButton>
            </div>
          </article>
          );
        })}
      </div>
    </div>
  );
}

function Signal({ icon: Icon, title, text }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white/75 p-4 dark:border-white/10 dark:bg-white/10">
      <Icon size={19} className="text-turf dark:text-limeball" />
      <h3 className="mt-2 font-black">{title}</h3>
      <p className="mt-1 text-sm font-medium text-black/55 dark:text-white/55">{text}</p>
    </div>
  );
}

const requestedTerrains = [
  {
    id: 'demo-miro-foot',
    name: 'Miro Foot',
    city: 'Casablanca',
    address: 'Sidi Maarouf, Casablanca',
    imageUrl: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1200&q=80',
    pricePerHour: 250,
    rating: 4.8,
    amenities: ['5v5', 'Lighting', 'Parking', 'Showers']
  },
  {
    id: 'demo-campus-sport',
    name: 'CAMPUS Sport',
    city: 'Casablanca',
    address: 'Oasis, Casablanca',
    imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80',
    pricePerHour: 280,
    rating: 4.7,
    amenities: ['5v5', 'Cafe', 'Locker rooms', 'Referee option']
  },
  {
    id: 'demo-arena-bouskoura',
    name: 'ARENA Bouskoura',
    city: 'Casablanca',
    address: 'Bouskoura, Casablanca',
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80',
    pricePerHour: 320,
    rating: 4.9,
    amenities: ['7v7', 'Premium turf', 'Parking', 'Cafe']
  },
  {
    id: 'demo-city-foot-5',
    name: 'City Foot 5',
    city: 'Casablanca',
    address: 'Ain Sebaa, Casablanca',
    imageUrl: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=80',
    pricePerHour: 220,
    rating: 4.6,
    amenities: ['5v5', 'Lighting', 'Changing rooms']
  },
  {
    id: 'demo-etoile-5',
    name: 'Etoile 5',
    city: 'Casablanca',
    address: 'Racine, Casablanca',
    imageUrl: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1200&q=80',
    pricePerHour: 260,
    rating: 4.7,
    amenities: ['5v5', 'Cafe', 'Parking']
  },
  {
    id: 'demo-club-el-firdaouss',
    name: 'Club El Firdaouss',
    city: 'Casablanca',
    address: 'Hay El Firdaouss, Casablanca',
    imageUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=80',
    pricePerHour: 230,
    rating: 4.5,
    amenities: ['5v5', 'Lighting', 'Family area']
  }
];

const demoTerrains = requestedTerrains.map((terrain, index) => ({
  ...terrain,
  availableHours: demoSlots(index % 3)
}));

function demoSlots(offset = 0) {
  const now = new Date();
  return [18, 19, 20, 21].map((hour, index) => {
    const startsAt = new Date(now);
    startsAt.setDate(now.getDate() + offset);
    startsAt.setHours(hour, 0, 0, 0);
    const endsAt = new Date(startsAt);
    endsAt.setHours(hour + 1);
    return { id: `demo-slot-${offset}-${index}`, startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() };
  });
}

const fallbackPitchImage = 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1200&q=80';

function useFallbackImage(event) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = fallbackPitchImage;
}
