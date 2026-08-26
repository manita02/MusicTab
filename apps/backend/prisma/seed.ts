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
  'Tango',
  'Cumbia',
  'Salsa',
  'Milonga',
  'Chacarera',
  'Zamba',
  'Chamamé',
  'Cuarteto',
];

const PDF_PLACEHOLDER = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
const PDF_PLACEHOLDER_W3 = 'https://www.w3.org/WAI/WCAG21/working-examples/pdf-table/table.pdf';

type DemoTab = {
  title: string;
  artist: string;
  genre: string;
  instrument: string;
  urlYoutube: string;
  urlImagen: string;
  urlPdf: string;
  createdAt: Date;
};

const DEMO_TABS: DemoTab[] = [
  {
    title: 'Milo J — Rara Vez',
    artist: 'Milo J',
    genre: 'Latin',
    instrument: 'Guitar',
    urlYoutube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    urlImagen: 'https://picsum.photos/seed/miloj-rara/400/300',
    urlPdf: PDF_PLACEHOLDER,
    createdAt: new Date('2024-03-10T12:00:00.000Z'),
  },
  {
    title: 'Milo J — M.A.I',
    artist: 'Milo J',
    genre: 'Pop',
    instrument: 'Piano',
    urlYoutube: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    urlImagen: 'https://picsum.photos/seed/miloj-mai/400/300',
    urlPdf: PDF_PLACEHOLDER_W3,
    createdAt: new Date('2024-08-22T12:00:00.000Z'),
  },
  {
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    genre: 'Rock',
    instrument: 'Guitar',
    urlYoutube: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
    urlImagen: 'https://picsum.photos/seed/scom/400/300',
    urlPdf: PDF_PLACEHOLDER,
    createdAt: new Date('2024-01-15T12:00:00.000Z'),
  },
  {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    genre: 'Rock',
    instrument: 'Piano',
    urlYoutube: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    urlImagen: 'https://picsum.photos/seed/bohemian/400/300',
    urlPdf: PDF_PLACEHOLDER_W3,
    createdAt: new Date('2024-06-20T12:00:00.000Z'),
  },
  {
    title: 'Seven Nation Army',
    artist: 'The White Stripes',
    genre: 'Rock',
    instrument: 'Guitar',
    urlYoutube: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
    urlImagen: 'https://picsum.photos/seed/seven-nation/400/300',
    urlPdf: PDF_PLACEHOLDER,
    createdAt: new Date('2026-08-01T12:00:00.000Z'),
  },
  {
    title: 'Somewhere Over the Rainbow',
    artist: "Israel Kamakawiwo'ole",
    genre: 'Pop',
    instrument: 'Ukulele',
    urlYoutube: 'https://www.youtube.com/watch?v=V1bFr2SWP1I',
    urlImagen: 'https://picsum.photos/seed/rainbow-uke/400/300',
    urlPdf: PDF_PLACEHOLDER_W3,
    createdAt: new Date('2024-11-05T12:00:00.000Z'),
  },
  {
    title: 'River Flows in You',
    artist: 'Yiruma',
    genre: 'Classical',
    instrument: 'Piano',
    urlYoutube: 'https://www.youtube.com/watch?v=7maJOI3QMu0',
    urlImagen: 'https://picsum.photos/seed/yiruma/400/300',
    urlPdf: PDF_PLACEHOLDER,
    createdAt: new Date('2025-02-14T12:00:00.000Z'),
  },
  {
    title: 'Take Five',
    artist: 'Dave Brubeck',
    genre: 'Jazz',
    instrument: 'Piano',
    urlYoutube: 'https://www.youtube.com/watch?v=vmDDOFXSgAs',
    urlImagen: 'https://picsum.photos/seed/take-five/400/300',
    urlPdf: PDF_PLACEHOLDER_W3,
    createdAt: new Date('2024-04-18T12:00:00.000Z'),
  },
  {
    title: 'Por una Cabeza',
    artist: 'Carlos Gardel',
    genre: 'Tango',
    instrument: 'Guitar',
    urlYoutube: 'https://www.youtube.com/watch?v=nX1u-5w2pY8',
    urlImagen: 'https://picsum.photos/seed/por-una-cabeza/400/300',
    urlPdf: PDF_PLACEHOLDER,
    createdAt: new Date('2025-06-11T12:00:00.000Z'),
  },
  {
    title: 'El Bombón Asesino',
    artist: 'Los Palmeras',
    genre: 'Cumbia',
    instrument: 'Guitar',
    urlYoutube: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    urlImagen: 'https://picsum.photos/seed/bombon-asesino/400/300',
    urlPdf: PDF_PLACEHOLDER_W3,
    createdAt: new Date('2025-09-15T12:00:00.000Z'),
  },
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

async function seedDemoTabs(adminId: number) {
  const genres = await prisma.genre.findMany();
  const instruments = await prisma.instrument.findMany();
  const genreByName = new Map(genres.map((g) => [g.name, g.id]));
  const instrumentByName = new Map(instruments.map((i) => [i.name, i.id]));

  let created = 0;
  let skipped = 0;

  for (const demo of DEMO_TABS) {
    const existing = await prisma.tab.findUnique({ where: { title: demo.title } });
    if (existing) {
      skipped += 1;
      continue;
    }

    const genreId = genreByName.get(demo.genre);
    const instrumentId = instrumentByName.get(demo.instrument);
    if (!genreId || !instrumentId) {
      throw new Error(`Missing catalog entry for "${demo.title}" (${demo.genre} / ${demo.instrument})`);
    }

    await prisma.tab.create({
      data: {
        title: demo.title,
        artist: demo.artist,
        urlYoutube: demo.urlYoutube,
        urlImagen: demo.urlImagen,
        urlPdf: demo.urlPdf,
        createdAt: demo.createdAt,
        userId: adminId,
        genreId,
        instrumentId,
        viewCount: 0,
      },
    });
    created += 1;
  }

  console.log(`Seeded demo tabs: ${created} created, ${skipped} already existed`);
}

async function main() {
  const admin = await seedAdmin();
  await seedCatalogs();
  await seedDemoTabs(admin.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
