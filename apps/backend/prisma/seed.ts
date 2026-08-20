import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_USERNAME = 'admin';
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin';
const ADMIN_IMG =
  'https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-female-user-profile-vector-illustration-isolated-background-women-profile-sign-business-concept_157943-38866.jpg';

const INSTRUMENTS = ['Guitar', 'Piano', 'Ukulele'];
const GENRES = [
  'Rock',
  'Jazz',
  'Pop',
  'Blues',
  'Metal',
  'Folklore',
  'Classical',
  'Country',
  'Reggae',
  'Funk',
  'Soul',
  'R&B',
  'Indie',
  'Alternative',
  'Punk',
  'Latin',
  'Flamenco',
  'Soundtrack',
];

async function seedAdmin() {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }],
    },
  });

  if (existing) {
    if (existing.role !== 'ADMIN') {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: 'ADMIN' },
      });
      console.log(`Promoted existing user "${existing.username}" to ADMIN`);
    } else {
      console.log(`Admin user already exists (${existing.username} / ${existing.email})`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.user.create({
    data: {
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'ADMIN',
      birthDate: new Date('1990-01-01'),
      urlImg: ADMIN_IMG,
    },
  });

  console.log(`Created admin user: ${ADMIN_USERNAME} / ${ADMIN_EMAIL} (password: ${ADMIN_PASSWORD})`);
}

async function seedNamedRecords(
  label: string,
  names: string[],
  upsert: (name: string) => Promise<unknown>,
) {
  for (const name of names) {
    await upsert(name);
  }
  console.log(`Seeded ${label}: ${names.join(', ')}`);
}

async function renameGenre(from: string, to: string) {
  const current = await prisma.genre.findUnique({ where: { name: from } });
  if (!current) return;
  const already = await prisma.genre.findUnique({ where: { name: to } });
  if (already) return;
  await prisma.genre.update({
    where: { id: current.id },
    data: { name: to },
  });
}

async function seedCatalogs() {
  await renameGenre('Folk', 'Folklore');

  await seedNamedRecords('instruments', INSTRUMENTS, (name) =>
    prisma.instrument.upsert({
      where: { name },
      update: {},
      create: { name },
    }),
  );

  await seedNamedRecords('genres', GENRES, (name) =>
    prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name },
    }),
  );
}

async function main() {
  await seedAdmin();
  await seedCatalogs();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
