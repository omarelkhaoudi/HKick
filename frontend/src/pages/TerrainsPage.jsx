import { useEffect, useState } from 'react';
import { CalendarPlus, CheckCircle2, MapPin, Navigation, Plus, Star } from 'lucide-react';
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
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-[#333333]">
        <h1 className="text-2xl font-bold">Explore Pitches</h1>
        <span className="text-sm text-emerald bg-emerald/10 px-3 py-1 rounded-full font-semibold">
          {terrains.length} Available
        </span>
      </div>

      {bookings.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider">Your Bookings</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {bookings.map((booking) => (
              <div key={booking.id} className="min-w-[240px] glass-panel rounded-2xl overflow-hidden flex flex-col">
                <img src={booking.imageUrl || fallbackPitchImage} onError={useFallbackImage} alt="" className="h-24 w-full object-cover opacity-80" />
                <div className="p-3">
                  <h3 className="font-bold text-sm truncate">{booking.terrainName}</h3>
                  <p className="text-xs text-white/50">{new Date(booking.startsAt).toLocaleDateString()} • {new Date(booking.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <button className="mt-3 w-full bg-[#1E1E1E] hover:bg-[#333333] transition py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2">
                    <Plus size={14} /> Create Match
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="space-y-4">
        {terrains.map((terrain) => {
          const selectedSlot = selectedSlots[terrain.id];
          const status = bookingState[terrain.id];

          return (
          <article key={terrain.id} className="glass-panel rounded-2xl overflow-hidden">
            <div className="relative">
              <img src={terrain.imageUrl || fallbackPitchImage} onError={useFallbackImage} alt="" className="h-48 w-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian to-transparent opacity-80" />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{terrain.name}</h2>
                  <p className="flex items-center gap-1.5 text-xs font-medium text-white/80"><MapPin size={12} className="text-cyan" /> {terrain.address}</p>
                </div>
                <div className="text-right">
                  <span className="flex items-center gap-1 bg-obsidian/80 backdrop-blur rounded-full px-2 py-1 text-xs font-bold text-emerald">
                    <Star size={12} fill="currentColor" /> {terrain.rating}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2 flex-wrap flex-1">
                  {terrain.amenities.slice(0,3).map((amenity) => (
                    <span key={amenity} className="bg-[#1E1E1E] border border-[#333333] px-2 py-1 rounded text-[10px] font-bold text-white/70 uppercase">
                      {amenity}
                    </span>
                  ))}
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-black text-emerald">{terrain.pricePerHour} <span className="text-xs font-normal text-white/50">MAD/hr</span></p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {terrain.availableHours.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => selectSlot(terrain.id, slot)}
                    className={`rounded-xl border transition flex flex-col items-center py-2 ${
                      selectedSlot?.id === slot.id
                        ? 'border-emerald bg-emerald text-obsidian shadow-glow'
                        : 'border-[#333333] bg-[#1E1E1E] text-white/80 hover:border-emerald hover:text-emerald'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase">{new Date(slot.startsAt).toLocaleDateString([], { weekday: 'short' })}</span>
                    <span className="text-xs font-black">{new Date(slot.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </button>
                ))}
              </div>

              {selectedSlot && (
                <div className="mt-4 flex flex-col gap-2">
                  {status && (
                    <p className={`text-xs font-semibold ${status === 'Booking...' ? 'text-white/60' : 'text-cyan'}`}>
                      {status}
                    </p>
                  )}
                  <button 
                    onClick={() => book(terrain)} 
                    disabled={status === 'Booking...'}
                    className="w-full bg-emerald text-obsidian font-bold text-sm py-3 rounded-full hover:shadow-glow transition-shadow flex items-center justify-center gap-2"
                  >
                    <CalendarPlus size={18} /> {status === 'Booking...' ? 'Reserving...' : 'Reserve Pitch'}
                  </button>
                </div>
              )}
            </div>
          </article>
          );
        })}
      </div>
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
