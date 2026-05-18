import { Knex } from "knex";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const SALT_ROUNDS = 10;
const SHARED_PASSWORD = "Password1!";

const FIXED_ADMIN_ID = "11111111-1111-1111-1111-111111111111";
const FIXED_PROVIDER_ID = "22222222-2222-2222-2222-222222222222";
const FIXED_END_USER_ID = "33333333-3333-3333-3333-333333333333";

/** Returns a fixed absolute date for seed stability. */
function fixedDate(year: number, month: number, day: number, hour: number): Date {
  return new Date(year, month - 1, day, hour, 0, 0, 0);
}

// --- Local static file helpers ---

const BACKEND_PUBLIC_URL = process.env.BACKEND_PUBLIC_URL ?? "http://localhost:3001";
const UPLOADS_DIR = path.resolve(__dirname, "../../../uploads", "location-images");

interface FileCopyJob {
  src: string;
  destDir: string;
  destPath: string;
  url: string;
}

function planImageCopy(srcPath: string, locationId: string, index: number): FileCopyJob {
  const ext = path.extname(srcPath);
  const filename = `${locationId}-${index}${ext}`;
  const destDir = path.join(UPLOADS_DIR, locationId);
  return {
    src: srcPath,
    destDir,
    destPath: path.join(destDir, filename),
    url: `${BACKEND_PUBLIC_URL}/uploads/location-images/${locationId}/${filename}`,
  };
}

const ASSETS_DIR = path.resolve(__dirname, "../../../../assets/locationImagesDemo");

function imagesInFolder(folder: string): string[] {
  const dir = path.join(ASSETS_DIR, folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .map((f) => path.join(dir, f));
}

// Map location IDs to their asset folders
const LOCATION_IMAGE_FOLDERS: Record<string, string> = {
  "10c00001-0000-0000-0000-000000000000": "ravenloft-greathall",
  "10c00002-0000-0000-0000-000000000000": "ravenloft-crypts",
  "10c00003-0000-0000-0000-000000000000": "barovia-midnight-market",
  "10c00004-0000-0000-0000-000000000000": "undermountain-sargauth",
  "10c00005-0000-0000-0000-000000000000": "undermountain-xanthar",
  "10c00006-0000-0000-0000-000000000000": "lonelymtn",
  "10c00007-0000-0000-0000-000000000000": "whisperedtomb",
  "10c00008-0000-0000-0000-000000000000": "cursedDekuTree",
};

export async function seed(knex: Knex): Promise<void> {
  const hash = await bcrypt.hash(SHARED_PASSWORD, SALT_ROUNDS);

  // Plan file copies (compute destinations and URLs without touching disk yet)
  const copyJobs: FileCopyJob[] = [];
  const locationImageUrls: Record<string, string[]> = {};
  for (const [locationId, folder] of Object.entries(LOCATION_IMAGE_FOLDERS)) {
    const files = imagesInFolder(folder);
    locationImageUrls[locationId] = files.map((file, i) => {
      const job = planImageCopy(file, locationId, i);
      copyJobs.push(job);
      return job.url;
    });
  }

  await knex.transaction(async (trx) => {
    await trx("booking").del();
    await trx("time_slot").del();
    await trx("location_images").del();
    await trx("booking_location").del();
    await trx("end_user").del();
    await trx("provider").del();
    await trx("admin_user").del();

    const adminUsers = [
      {
        id: FIXED_ADMIN_ID,
        first_name: "The",
        last_name: "Wizard",
        email: "the_wizard@wiztower.com",
        password_hash: hash,
        role: "PLATFORM_ADMIN",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        first_name: "Gandalf",
        last_name: "the Gray",
        email: "gandalf_the_gray@wiztower.com",
        password_hash: hash,
        role: "CLIENT_SUCCESS",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        first_name: "Tom",
        last_name: "Bombadil",
        email: "tom_bombadil@wiztower.com",
        password_hash: hash,
        role: "SUPERUSER",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
    ];
    await trx("admin_user").insert(adminUsers);

    const providers = [
      {
        id: FIXED_PROVIDER_ID,
        first_name: "Strahd",
        last_name: "von Zarovich",
        email: "typeO@barovia.gov",
        password_hash: hash,
        organization_name: "Barovia Experiences",
        plan: "PREMIUM",
        status: "ACTIVE",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        first_name: "Halaster",
        last_name: "Blackcloak",
        email: "madmage@undermtn.com",
        password_hash: hash,
        organization_name: "Undermountain Corp",
        plan: "STANDARD",
        status: "ACTIVE",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
        first_name: "Smaug",
        last_name: "the Tremendous",
        email: "smaug@erebor.co",
        password_hash: hash,
        organization_name: null,
        plan: "FREE",
        status: "ACTIVE",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        first_name: "Vecna",
        last_name: "the Undying",
        email: "vecna@whisperedtombs.net",
        password_hash: hash,
        organization_name: "Whispered Tombs LLC",
        plan: "STANDARD",
        status: "ACTIVE",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        // Previously hosted Obsidian Citadel — suspended now that location is removed
        id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
        first_name: "Vlad",
        last_name: "Dracula Tepes",
        email: "dracula@castlevania.net",
        password_hash: hash,
        organization_name: "Castlevania Experiences",
        plan: "PREMIUM",
        status: "SUSPENDED",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "00000000-ffff-0000-ffff-000000000000",
        first_name: "Queen",
        last_name: "Gohma",
        email: "gohma@deku-tree.hyrule",
        password_hash: hash,
        organization_name: "Ganon's Forces",
        plan: "PREMIUM",
        status: "ACTIVE",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
    ];
    await trx("provider").insert(providers);

    const endUsers = [
      {
        id: FIXED_END_USER_ID,
        first_name: "Laios",
        last_name: "Touden",
        email: "laios.touden@yohaa.com",
        password_hash: hash,
        role: "REGULAR",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "11111111-2222-3333-4444-555555555555",
        first_name: "Bilbo",
        last_name: "Baggins",
        email: "underhill111@aoi.com",
        password_hash: hash,
        role: "REGULAR",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "22222222-3333-4444-5555-666666666666",
        first_name: "Geralt",
        last_name: "of Rivia",
        email: "geralt_riv@witcherscorp.com",
        password_hash: hash,
        role: "REGULAR",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "33333333-4444-5555-6666-777777777777",
        first_name: "Ciri",
        last_name: "of Cintra",
        email: "ciri.cintra@witcherscorp.com",
        password_hash: hash,
        role: "PREMIERE",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "44444444-5555-6666-7777-888888888888",
        first_name: "Navi",
        last_name: "the Fairy",
        email: "navi@kokiri-forest.hyrule",
        password_hash: hash,
        role: "PREMIERE",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "55555555-6666-7777-8888-999999999999",
        first_name: "Tatl",
        last_name: "the Fairy",
        email: "tatltale231@yohaa.com",
        password_hash: hash,
        role: "PREMIERE",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "66666666-7777-8888-9999-000000000000",
        first_name: "Trevor",
        last_name: "Belmont",
        email: "trevor@belmont-order.net",
        password_hash: hash,
        role: "CORPORATE",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "77777777-8888-9999-0000-111111111111",
        first_name: "Alucard",
        last_name: "Tepes",
        email: "alucard@castlevania.net",
        password_hash: hash,
        role: "CORPORATE",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
    ];
    await trx("end_user").insert(endUsers);

    const firstUrl = (id: string) => locationImageUrls[id]?.[0] ?? null;

    const locations = [
      {
        id: "10c00001-0000-0000-0000-000000000000",
        provider_id: FIXED_PROVIDER_ID,
        name: "Castle Ravenloft — Great Hall",
        description:
          "Navigate the fog-drenched halls of Castle Ravenloft. Solve the riddle of the dark lord's curse before the final bell tolls.",
        difficulty: "MEDIUM",
        cancellation_policy: "Full refund if cancelled 7 or more days in advance. No refund within 7 days.",
        image_url: firstUrl("10c00001-0000-0000-0000-000000000000"),
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "10c00002-0000-0000-0000-000000000000",
        provider_id: FIXED_PROVIDER_ID,
        name: "Castle Ravenloft — Crypts of the Zarovich Line",
        description:
          "Descend into the ancestral crypts beneath the castle. Ancient traps and undead sentinels guard the count's most jealously kept secret.",
        difficulty: "LEGENDARY",
        cancellation_policy: "Full refund if cancelled 7 or more days in advance. No refund within 7 days.",
        image_url: firstUrl("10c00002-0000-0000-0000-000000000000"),
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "10c00003-0000-0000-0000-000000000000",
        provider_id: FIXED_PROVIDER_ID,
        name: "The Village of Barovia — Midnight Market",
        description:
          "A moonlit market that appears only at midnight. Barter with spectral merchants and find the one item that breaks the village's curse.",
        difficulty: "EASY",
        cancellation_policy: "Full refund if cancelled 48 hours or more in advance. No refund within 48 hours.",
        image_url: firstUrl("10c00003-0000-0000-0000-000000000000"),
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "10c00004-0000-0000-0000-000000000000",
        provider_id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        name: "Undermountain — Sargauth Level",
        description:
          "The mad mage's mid-tier dungeon wing. Collapsing passages and Halaster's own illusion traps test your wits as much as your strength.",
        difficulty: "HARD",
        cancellation_policy: "No refunds within 24 hours of the raid. 50% refund if cancelled 1–3 days before.",
        image_url: firstUrl("10c00004-0000-0000-0000-000000000000"),
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "10c00005-0000-0000-0000-000000000000",
        provider_id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        name: "Undermountain — Caverns of the Xanathar",
        description:
          "Tread carefully through the Xanathar's private surveillance network. One wrong step and the beholder's eye opens.",
        difficulty: "LEGENDARY",
        cancellation_policy: "No refunds within 24 hours of the raid. 50% refund if cancelled 1–3 days before.",
        image_url: firstUrl("10c00005-0000-0000-0000-000000000000"),
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "10c00006-0000-0000-0000-000000000000",
        provider_id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
        name: "The Lonely Mountain — Treasure Vault",
        description:
          "Walk the treasure-choked halls of Erebor and find the Arkenstone before the dragon stirs. Time your movements carefully — sound carries.",
        difficulty: "HARD",
        cancellation_policy: "No refunds. The dragon waits for no one.",
        image_url: firstUrl("10c00006-0000-0000-0000-000000000000"),
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "10c00007-0000-0000-0000-000000000000",
        provider_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        name: "The Whispered Tomb — Archive of Secrets",
        description:
          "Decipher the lich's ritual inscriptions before his awakening is complete. The archive holds the counterspell — if you can read it.",
        difficulty: "MEDIUM",
        cancellation_policy: "Full refund if cancelled 5 or more days in advance. No refund within 5 days.",
        image_url: firstUrl("10c00007-0000-0000-0000-000000000000"),
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "10c00008-0000-0000-0000-000000000000",
        provider_id: "00000000-ffff-0000-ffff-000000000000",
        name: "The Cursed Deku Tree — Heart of the Forest",
        description:
          "Venture into the ancient tree's cursed heartwood and break the parasite's hold before the forest spirit fades forever. Speed and silence are your only allies.",
        difficulty: "EASY",
        cancellation_policy: "Full refund if cancelled 24 hours or more in advance.",
        image_url: firstUrl("10c00008-0000-0000-0000-000000000000"),
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
    ];
    await trx("booking_location").insert(locations);

    // Insert location_images rows for every uploaded image
    const imageRows: {
      id: string;
      booking_location_id: string;
      image_url: string;
      display_order: number;
      created_at: ReturnType<typeof trx.fn.now>;
      updated_at: ReturnType<typeof trx.fn.now>;
    }[] = [];
    for (const [locationId, urls] of Object.entries(locationImageUrls)) {
      urls.forEach((url, i) => {
        imageRows.push({
          id: uuidv4(),
          booking_location_id: locationId,
          image_url: url,
          display_order: i,
          created_at: trx.fn.now(),
          updated_at: trx.fn.now(),
        });
      });
    }
    if (imageRows.length > 0) {
      await trx("location_images").insert(imageRows);
    }

    // Past slots (2026-01 to 2026-02) — kept for expired/past-excursion testing
    const pastSlots = [
      { id: "510c0001-0000-0000-0000-000000000000", booking_location_id: "10c00001-0000-0000-0000-000000000000", start_time: fixedDate(2026, 1, 10, 18), end_time: fixedDate(2026, 1, 10, 20), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0004-0000-0000-0000-000000000000", booking_location_id: "10c00002-0000-0000-0000-000000000000", start_time: fixedDate(2026, 2, 7,  21), end_time: fixedDate(2026, 2, 7,  23), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0007-0000-0000-0000-000000000000", booking_location_id: "10c00003-0000-0000-0000-000000000000", start_time: fixedDate(2026, 2, 14, 15), end_time: fixedDate(2026, 2, 14, 17), created_at: trx.fn.now(), updated_at: trx.fn.now() },
    ];

    // Future slots spread across Apr–Dec 2027
    const futureSlots = [
      // Castle Ravenloft — Great Hall (loc 1)
      { id: "510c0002-0000-0000-0000-000000000000", booking_location_id: "10c00001-0000-0000-0000-000000000000", start_time: fixedDate(2027, 4, 18, 20), end_time: fixedDate(2027, 4, 18, 22), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0003-0000-0000-0000-000000000000", booking_location_id: "10c00001-0000-0000-0000-000000000000", start_time: fixedDate(2027, 5, 10, 14), end_time: fixedDate(2027, 5, 10, 16), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0021-0000-0000-0000-000000000000", booking_location_id: "10c00001-0000-0000-0000-000000000000", start_time: fixedDate(2027, 7, 4,  10), end_time: fixedDate(2027, 7, 4,  12), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0022-0000-0000-0000-000000000000", booking_location_id: "10c00001-0000-0000-0000-000000000000", start_time: fixedDate(2027, 9, 19, 18), end_time: fixedDate(2027, 9, 19, 20), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0023-0000-0000-0000-000000000000", booking_location_id: "10c00001-0000-0000-0000-000000000000", start_time: fixedDate(2027, 11, 27, 20), end_time: fixedDate(2027, 11, 27, 22), created_at: trx.fn.now(), updated_at: trx.fn.now() },

      // Castle Ravenloft — Crypts (loc 2)
      { id: "510c0005-0000-0000-0000-000000000000", booking_location_id: "10c00002-0000-0000-0000-000000000000", start_time: fixedDate(2027, 6, 13, 19), end_time: fixedDate(2027, 6, 13, 21), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0024-0000-0000-0000-000000000000", booking_location_id: "10c00002-0000-0000-0000-000000000000", start_time: fixedDate(2027, 8, 22, 21), end_time: fixedDate(2027, 8, 22, 23), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0025-0000-0000-0000-000000000000", booking_location_id: "10c00002-0000-0000-0000-000000000000", start_time: fixedDate(2027, 10, 30, 20), end_time: fixedDate(2027, 10, 30, 22), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0026-0000-0000-0000-000000000000", booking_location_id: "10c00002-0000-0000-0000-000000000000", start_time: fixedDate(2027, 12, 5, 19), end_time: fixedDate(2027, 12, 5, 21), created_at: trx.fn.now(), updated_at: trx.fn.now() },

      // Village of Barovia — Midnight Market (loc 3)
      { id: "510c0006-0000-0000-0000-000000000000", booking_location_id: "10c00003-0000-0000-0000-000000000000", start_time: fixedDate(2027, 4, 25, 10), end_time: fixedDate(2027, 4, 25, 12), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0008-0000-0000-0000-000000000000", booking_location_id: "10c00003-0000-0000-0000-000000000000", start_time: fixedDate(2027, 6, 5,  11), end_time: fixedDate(2027, 6, 5,  13), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0027-0000-0000-0000-000000000000", booking_location_id: "10c00003-0000-0000-0000-000000000000", start_time: fixedDate(2027, 8, 14, 10), end_time: fixedDate(2027, 8, 14, 12), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0028-0000-0000-0000-000000000000", booking_location_id: "10c00003-0000-0000-0000-000000000000", start_time: fixedDate(2027, 10, 2, 14), end_time: fixedDate(2027, 10, 2, 16), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0029-0000-0000-0000-000000000000", booking_location_id: "10c00003-0000-0000-0000-000000000000", start_time: fixedDate(2027, 12, 12, 11), end_time: fixedDate(2027, 12, 12, 13), created_at: trx.fn.now(), updated_at: trx.fn.now() },

      // Undermountain — Sargauth Level (loc 4)
      { id: "510c0009-0000-0000-0000-000000000000", booking_location_id: "10c00004-0000-0000-0000-000000000000", start_time: fixedDate(2027, 5, 8,  17), end_time: fixedDate(2027, 5, 8,  19), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0010-0000-0000-0000-000000000000", booking_location_id: "10c00004-0000-0000-0000-000000000000", start_time: fixedDate(2027, 7, 17, 13), end_time: fixedDate(2027, 7, 17, 15), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0030-0000-0000-0000-000000000000", booking_location_id: "10c00004-0000-0000-0000-000000000000", start_time: fixedDate(2027, 9, 11, 10), end_time: fixedDate(2027, 9, 11, 12), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0031-0000-0000-0000-000000000000", booking_location_id: "10c00004-0000-0000-0000-000000000000", start_time: fixedDate(2027, 11, 13, 17), end_time: fixedDate(2027, 11, 13, 19), created_at: trx.fn.now(), updated_at: trx.fn.now() },

      // Undermountain — Caverns of the Xanathar (loc 5)
      { id: "510c0011-0000-0000-0000-000000000000", booking_location_id: "10c00005-0000-0000-0000-000000000000", start_time: fixedDate(2027, 5, 22, 19), end_time: fixedDate(2027, 5, 22, 21), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0012-0000-0000-0000-000000000000", booking_location_id: "10c00005-0000-0000-0000-000000000000", start_time: fixedDate(2027, 8, 6,  20), end_time: fixedDate(2027, 8, 6,  22), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0032-0000-0000-0000-000000000000", booking_location_id: "10c00005-0000-0000-0000-000000000000", start_time: fixedDate(2027, 10, 18, 19), end_time: fixedDate(2027, 10, 18, 21), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0033-0000-0000-0000-000000000000", booking_location_id: "10c00005-0000-0000-0000-000000000000", start_time: fixedDate(2027, 12, 19, 20), end_time: fixedDate(2027, 12, 19, 22), created_at: trx.fn.now(), updated_at: trx.fn.now() },

      // The Lonely Mountain — Treasure Vault (loc 6)
      { id: "510c0013-0000-0000-0000-000000000000", booking_location_id: "10c00006-0000-0000-0000-000000000000", start_time: fixedDate(2027, 4, 30, 14), end_time: fixedDate(2027, 4, 30, 16), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0014-0000-0000-0000-000000000000", booking_location_id: "10c00006-0000-0000-0000-000000000000", start_time: fixedDate(2027, 7, 24, 10), end_time: fixedDate(2027, 7, 24, 12), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0034-0000-0000-0000-000000000000", booking_location_id: "10c00006-0000-0000-0000-000000000000", start_time: fixedDate(2027, 9, 26, 14), end_time: fixedDate(2027, 9, 26, 16), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0035-0000-0000-0000-000000000000", booking_location_id: "10c00006-0000-0000-0000-000000000000", start_time: fixedDate(2027, 11, 20, 10), end_time: fixedDate(2027, 11, 20, 12), created_at: trx.fn.now(), updated_at: trx.fn.now() },

      // The Whispered Tomb — Archive of Secrets (loc 7)
      { id: "510c0015-0000-0000-0000-000000000000", booking_location_id: "10c00007-0000-0000-0000-000000000000", start_time: fixedDate(2027, 5, 3,  16), end_time: fixedDate(2027, 5, 3,  18), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0016-0000-0000-0000-000000000000", booking_location_id: "10c00007-0000-0000-0000-000000000000", start_time: fixedDate(2027, 7, 31, 12), end_time: fixedDate(2027, 7, 31, 14), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0036-0000-0000-0000-000000000000", booking_location_id: "10c00007-0000-0000-0000-000000000000", start_time: fixedDate(2027, 9, 12, 16), end_time: fixedDate(2027, 9, 12, 18), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0037-0000-0000-0000-000000000000", booking_location_id: "10c00007-0000-0000-0000-000000000000", start_time: fixedDate(2027, 11, 6, 10), end_time: fixedDate(2027, 11, 6, 12), created_at: trx.fn.now(), updated_at: trx.fn.now() },

      // The Cursed Deku Tree — Heart of the Forest (loc 8)
      { id: "510c0017-0000-0000-0000-000000000000", booking_location_id: "10c00008-0000-0000-0000-000000000000", start_time: fixedDate(2027, 4, 19, 10), end_time: fixedDate(2027, 4, 19, 12), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0018-0000-0000-0000-000000000000", booking_location_id: "10c00008-0000-0000-0000-000000000000", start_time: fixedDate(2027, 6, 28, 14), end_time: fixedDate(2027, 6, 28, 16), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0019-0000-0000-0000-000000000000", booking_location_id: "10c00008-0000-0000-0000-000000000000", start_time: fixedDate(2027, 8, 9,  11), end_time: fixedDate(2027, 8, 9,  13), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0038-0000-0000-0000-000000000000", booking_location_id: "10c00008-0000-0000-0000-000000000000", start_time: fixedDate(2027, 10, 16, 10), end_time: fixedDate(2027, 10, 16, 12), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0039-0000-0000-0000-000000000000", booking_location_id: "10c00008-0000-0000-0000-000000000000", start_time: fixedDate(2027, 12, 7,  14), end_time: fixedDate(2027, 12, 7,  16), created_at: trx.fn.now(), updated_at: trx.fn.now() },
    ];

    const slots = [...pastSlots, ...futureSlots];
    await trx("time_slot").insert(slots);

    const bookings = [
      { id: "b00c0001-0000-0000-0000-000000000000", time_slot_id: "510c0001-0000-0000-0000-000000000000", end_user_id: FIXED_END_USER_ID, status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "b00c0002-0000-0000-0000-000000000000", time_slot_id: "510c0007-0000-0000-0000-000000000000", end_user_id: "11111111-2222-3333-4444-555555555555", status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "b00c0003-0000-0000-0000-000000000000", time_slot_id: "510c0009-0000-0000-0000-000000000000", end_user_id: "33333333-4444-5555-6666-777777777777", status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "b00c0004-0000-0000-0000-000000000000", time_slot_id: "510c0013-0000-0000-0000-000000000000", end_user_id: "44444444-5555-6666-7777-888888888888", status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "b00c0005-0000-0000-0000-000000000000", time_slot_id: "510c0017-0000-0000-0000-000000000000", end_user_id: "77777777-8888-9999-0000-111111111111", status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "b00c0006-0000-0000-0000-000000000000", time_slot_id: "510c0015-0000-0000-0000-000000000000", end_user_id: "55555555-6666-7777-8888-999999999999", status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "b00c0007-0000-0000-0000-000000000000", time_slot_id: "510c0004-0000-0000-0000-000000000000", end_user_id: "22222222-3333-4444-5555-666666666666", status: "CANCELLED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "b00c0008-0000-0000-0000-000000000000", time_slot_id: "510c0018-0000-0000-0000-000000000000", end_user_id: "66666666-7777-8888-9999-000000000000", status: "CANCELLED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
    ];
    await trx("booking").insert(bookings);
  });

  // Execute file copies only after the transaction commits successfully
  for (const { src, destDir, destPath } of copyJobs) {
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, destPath);
  }
}
