import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  await prisma.user.upsert({
    where: { email: 'captain@hkick.test' },
    update: {},
    create: {
      email: 'captain@hkick.test',
      passwordHash,
      profile: {
        create: {
          name: 'Yassine Captain',
          age: 25,
          city: 'Casablanca',
          preferredPosition: 'MID',
          skillLevel: 4,
          avatarUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=300&q=80'
        }
      }
    }
  });

  const terrains = [
    {
      name: 'Miro Foot',
      city: 'Casablanca',
      address: 'Sidi Maarouf, Casablanca',
      imageUrl: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1200&q=80',
      pricePerHour: 250,
      amenities: ['5v5', 'Lighting', 'Parking', 'Showers']
    },
    {
      name: 'CAMPUS Sport',
      city: 'Casablanca',
      address: 'Oasis, Casablanca',
      imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80',
      pricePerHour: 280,
      amenities: ['5v5', 'Cafe', 'Locker rooms', 'Referee option']
    },
    {
      name: 'ARENA Bouskoura',
      city: 'Casablanca',
      address: 'Bouskoura, Casablanca',
      imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80',
      pricePerHour: 320,
      amenities: ['7v7', 'Premium turf', 'Parking', 'Cafe']
    },
    {
      name: 'City Foot 5',
      city: 'Casablanca',
      address: 'Ain Sebaa, Casablanca',
      imageUrl: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=80',
      pricePerHour: 220,
      amenities: ['5v5', 'Lighting', 'Changing rooms']
    },
    {
      name: 'Etoile 5',
      city: 'Casablanca',
      address: 'Racine, Casablanca',
      imageUrl: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1200&q=80',
      pricePerHour: 260,
      amenities: ['5v5', 'Cafe', 'Parking']
    },
    {
      name: 'Club El Firdaouss',
      city: 'Casablanca',
      address: 'Hay El Firdaouss, Casablanca',
      imageUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=80',
      pricePerHour: 230,
      amenities: ['5v5', 'Lighting', 'Family area']
    }
  ];

  for (const terrain of terrains) {
    const saved = await prisma.terrain.upsert({
      where: { id: terrain.name.toLowerCase().replaceAll(' ', '-') },
      update: terrain,
      create: { id: terrain.name.toLowerCase().replaceAll(' ', '-'), ...terrain }
    });

    await prisma.terrainSlot.deleteMany({ where: { terrainId: saved.id } });

    for (let day = 0; day < 4; day += 1) {
      for (const hour of [18, 19, 20, 21]) {
        const startsAt = new Date();
        startsAt.setDate(startsAt.getDate() + day);
        startsAt.setHours(hour, 0, 0, 0);
        const endsAt = new Date(startsAt);
        endsAt.setHours(hour + 1);
        await prisma.terrainSlot.create({ data: { terrainId: saved.id, startsAt, endsAt } });
      }
    }
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
