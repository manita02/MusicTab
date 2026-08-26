import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_USERNAME = 'admin';
const ADMIN_EMAIL = 'admin@gmail.com';
const LEGACY_ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin';
const ADMIN_SIGNUP_IP = '127.0.0.1';
const ADMIN_IMG =
  'https://imgs.search.brave.com/cKpndh_PLl3bVHQqLUPiuQ3ERWbja_MIKeFqA52qCqs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5nYWxsLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMTUvVXNl/ci1CYWNrZ3JvdW5k/LVBORy5wbmc';

const INSTRUMENTS = [
  { name: 'Guitar', urlIco: '/src/assets/guitarra.png' },
  { name: 'Piano', urlIco: '/src/assets/piano.png' },
  { name: 'Ukulele', urlIco: '/src/assets/ukelele.png' },
  { name: 'Electric Guitar', urlIco: '/src/assets/guitarra-electrica.png' },
];
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
  'Tango',
  'Cumbia',
  'Salsa',
  'Milonga',
  'Chacarera',
  'Zamba',
  'Chamamé',
  'Cuarteto',
];

async function seedAdmin() {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }, { email: LEGACY_ADMIN_EMAIL }],
    },
  });

  if (existing) {
    const data: { role?: string; email?: string; signupIp?: string; urlImg?: string } = {};
    if (existing.role !== 'ADMIN') {
      data.role = 'ADMIN';
    }
    if (existing.email === LEGACY_ADMIN_EMAIL) {
      data.email = ADMIN_EMAIL;
    }
    if (!existing.signupIp) {
      data.signupIp = ADMIN_SIGNUP_IP;
    }
    if (
      !existing.urlImg ||
      existing.urlImg.includes('img.freepik.com/premium-vector/avatar-profile-icon')
    ) {
      data.urlImg = ADMIN_IMG;
    }

    if (Object.keys(data).length > 0) {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data,
      });
      console.log(
        `Updated admin user (${updated.username} / ${updated.email}, signupIp=${updated.signupIp})`,
      );
      return updated;
    }

    console.log(`Admin user already exists (${existing.username} / ${existing.email})`);
    return existing;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const created = await prisma.user.create({
    data: {
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'ADMIN',
      birthDate: new Date('1990-01-01'),
      urlImg: ADMIN_IMG,
      signupIp: ADMIN_SIGNUP_IP,
    },
  });

  console.log(`Created admin user: ${ADMIN_USERNAME} / ${ADMIN_EMAIL} (password: ${ADMIN_PASSWORD})`);
  return created;
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

  for (const { name, urlIco } of INSTRUMENTS) {
    await prisma.instrument.upsert({
      where: { name },
      update: { urlIco },
      create: { name, urlIco },
    });
  }
  console.log(`Seeded instruments: ${INSTRUMENTS.map((i) => i.name).join(', ')}`);

  await seedNamedRecords('genres', GENRES, (name) =>
    prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name },
    }),
  );
}

async function deleteAdminTabs(adminId: number) {
  const result = await prisma.tab.deleteMany({ where: { userId: adminId } });
  console.log(`Removed ${result.count} tab(s) owned by admin`);
}

async function main() {
  const admin = await seedAdmin();
  await deleteAdminTabs(admin.id);
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
