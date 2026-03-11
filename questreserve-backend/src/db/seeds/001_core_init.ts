import { Knex } from "knex";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;
const SHARED_PASSWORD = "Password1!";

// Fixed UUIDs — used in testing guide curl examples.
// Do not change these without updating docs/phase6-5docs/backend-testing-guide.md.
const FIXED_ADMIN_ID = "11111111-1111-1111-1111-111111111111";
const FIXED_PROVIDER_ID = "22222222-2222-2222-2222-222222222222";
const FIXED_END_USER_ID = "33333333-3333-3333-3333-333333333333";

// Deterministic future dates relative to a fixed reference point.
// Slots are spread across 6 future weeks at varied times of day.
function futureDate(weeksFromNow: number, dayOffset: number, hour: number): Date {
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const startOfWeek = new Date(now.getTime() + weeksFromNow * 7 * msPerDay);
  startOfWeek.setHours(0, 0, 0, 0);
  const day = new Date(startOfWeek.getTime() + dayOffset * msPerDay);
  day.setHours(hour, 0, 0, 0);
  return day;
}

export async function seed(knex: Knex): Promise<void> {
  const hash = await bcrypt.hash(SHARED_PASSWORD, SALT_ROUNDS);

  await knex.transaction(async (trx) => {
    await trx("booking").del();
    await trx("time_slot").del();
    await trx("booking_location").del();
    await trx("end_user").del();
    await trx("provider").del();
    await trx("admin_user").del();

    // -----------------------------------------------------------------------
    // ADMIN USERS
    // -----------------------------------------------------------------------
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

    // -----------------------------------------------------------------------
    // PROVIDERS
    // -----------------------------------------------------------------------
    // provider[0] = Strahd (FIXED_PROVIDER_ID, PREMIUM, ACTIVE)
    // provider[5] = Queen Gohma (SUSPENDED)
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
        id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
        first_name: "Vlad",
        last_name: "Dracula Tepes",
        email: "dracula@castlevania.net",
        password_hash: hash,
        organization_name: "Castlevania Experiences",
        plan: "PREMIUM",
        status: "ACTIVE",
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
        status: "SUSPENDED",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
    ];
    await trx("provider").insert(providers);

    // -----------------------------------------------------------------------
    // END USERS
    // -----------------------------------------------------------------------
    // endUser[0] = Laios (FIXED_END_USER_ID, REGULAR)
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

    // -----------------------------------------------------------------------
    // BOOKING LOCATIONS
    // Strahd (FIXED_PROVIDER_ID) has 3 locations — all difficulties represented.
    // Halaster has 2 locations.
    // Remaining providers have 1 each.
    // Total: 8 locations, all 4 difficulties covered.
    // -----------------------------------------------------------------------
    const locations = [
      // Strahd — 3 locations
      {
        id: "10c00001-0000-0000-0000-000000000000",
        provider_id: FIXED_PROVIDER_ID,
        name: "Castle Ravenloft — Great Hall",
        description:
          "Navigate the fog-drenched halls of Castle Ravenloft. Solve the riddle of the dark lord's curse before the final bell tolls.",
        difficulty: "MEDIUM",
        cancellation_policy: "Full refund if cancelled 7 or more days in advance. No refund within 7 days.",
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
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      // Halaster — 2 locations
      {
        id: "10c00004-0000-0000-0000-000000000000",
        provider_id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        name: "Undermountain — Sargauth Level",
        description:
          "The mad mage's mid-tier dungeon wing. Collapsing passages and Halaster's own illusion traps test your wits as much as your strength.",
        difficulty: "HARD",
        cancellation_policy: "No refunds within 24 hours of the raid. 50% refund if cancelled 1–3 days before.",
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
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      // Smaug — 1 location
      {
        id: "10c00006-0000-0000-0000-000000000000",
        provider_id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
        name: "The Lonely Mountain — Treasure Vault",
        description:
          "Walk the treasure-choked halls of Erebor and find the Arkenstone before the dragon stirs. Time your movements carefully — sound carries.",
        difficulty: "HARD",
        cancellation_policy: "No refunds. The dragon waits for no one.",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      // Vecna — 1 location
      {
        id: "10c00007-0000-0000-0000-000000000000",
        provider_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        name: "The Whispered Tomb — Archive of Secrets",
        description:
          "Decipher the lich's ritual inscriptions before his awakening is complete. The archive holds the counterspell — if you can read it.",
        difficulty: "MEDIUM",
        cancellation_policy: "Full refund if cancelled 5 or more days in advance. No refund within 5 days.",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      // Mordenkainen — 1 location
      {
        id: "10c00008-0000-0000-0000-000000000000",
        provider_id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
        name: "The Obsidian Citadel — Apprentice Wing",
        description:
          "A structured introductory raid designed for first-timers. Mordenkainen himself reviews the challenge designs. Difficulty is real but survivable.",
        difficulty: "EASY",
        cancellation_policy: "Full refund if cancelled 24 hours or more in advance.",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      // Iuz — 1 location (provider is SUSPENDED; location exists but provider cannot log in)
      // Intentionally not included — a SUSPENDED provider should have no active bookable content.
      // Locations for Iuz (id: 00000000-ffff-0000-ffff-000000000000) are omitted.
    ];
    await trx("booking_location").insert(locations);

    // -----------------------------------------------------------------------
    // TIME SLOTS — spread across 6 future weeks at varied times
    // Each location gets 2–3 slots on different days and at different hours.
    // -----------------------------------------------------------------------
    const slots = [
      // Castle Ravenloft — Great Hall (MEDIUM)
      { id: "510c0001-0000-0000-0000-000000000000", booking_location_id: "10c00001-0000-0000-0000-000000000000", start_time: futureDate(1, 1, 18), end_time: futureDate(1, 1, 20), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0002-0000-0000-0000-000000000000", booking_location_id: "10c00001-0000-0000-0000-000000000000", start_time: futureDate(1, 4, 20), end_time: futureDate(1, 4, 22), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0003-0000-0000-0000-000000000000", booking_location_id: "10c00001-0000-0000-0000-000000000000", start_time: futureDate(2, 6, 14), end_time: futureDate(2, 6, 16), created_at: trx.fn.now(), updated_at: trx.fn.now() },

      // Castle Ravenloft — Crypts (LEGENDARY)
      { id: "510c0004-0000-0000-0000-000000000000", booking_location_id: "10c00002-0000-0000-0000-000000000000", start_time: futureDate(1, 5, 21), end_time: futureDate(1, 5, 23), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0005-0000-0000-0000-000000000000", booking_location_id: "10c00002-0000-0000-0000-000000000000", start_time: futureDate(3, 0, 19), end_time: futureDate(3, 0, 21), created_at: trx.fn.now(), updated_at: trx.fn.now() },

      // Barovia Midnight Market (EASY)
      { id: "510c0006-0000-0000-0000-000000000000", booking_location_id: "10c00003-0000-0000-0000-000000000000", start_time: futureDate(1, 2, 10), end_time: futureDate(1, 2, 12), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0007-0000-0000-0000-000000000000", booking_location_id: "10c00003-0000-0000-0000-000000000000", start_time: futureDate(2, 0, 15), end_time: futureDate(2, 0, 17), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0008-0000-0000-0000-000000000000", booking_location_id: "10c00003-0000-0000-0000-000000000000", start_time: futureDate(4, 3, 11), end_time: futureDate(4, 3, 13), created_at: trx.fn.now(), updated_at: trx.fn.now() },

      // Undermountain — Sargauth Level (HARD)
      { id: "510c0009-0000-0000-0000-000000000000", booking_location_id: "10c00004-0000-0000-0000-000000000000", start_time: futureDate(1, 3, 17), end_time: futureDate(1, 3, 19), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0010-0000-0000-0000-000000000000", booking_location_id: "10c00004-0000-0000-0000-000000000000", start_time: futureDate(3, 2, 13), end_time: futureDate(3, 2, 15), created_at: trx.fn.now(), updated_at: trx.fn.now() },

      // Undermountain — Caverns of the Xanathar (LEGENDARY)
      { id: "510c0011-0000-0000-0000-000000000000", booking_location_id: "10c00005-0000-0000-0000-000000000000", start_time: futureDate(2, 4, 19), end_time: futureDate(2, 4, 21), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0012-0000-0000-0000-000000000000", booking_location_id: "10c00005-0000-0000-0000-000000000000", start_time: futureDate(5, 1, 20), end_time: futureDate(5, 1, 22), created_at: trx.fn.now(), updated_at: trx.fn.now() },

      // Lonely Mountain — Treasure Vault (HARD)
      { id: "510c0013-0000-0000-0000-000000000000", booking_location_id: "10c00006-0000-0000-0000-000000000000", start_time: futureDate(2, 1, 14), end_time: futureDate(2, 1, 16), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0014-0000-0000-0000-000000000000", booking_location_id: "10c00006-0000-0000-0000-000000000000", start_time: futureDate(4, 5, 10), end_time: futureDate(4, 5, 12), created_at: trx.fn.now(), updated_at: trx.fn.now() },

      // Whispered Tomb — Archive of Secrets (MEDIUM)
      { id: "510c0015-0000-0000-0000-000000000000", booking_location_id: "10c00007-0000-0000-0000-000000000000", start_time: futureDate(1, 0, 16), end_time: futureDate(1, 0, 18), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0016-0000-0000-0000-000000000000", booking_location_id: "10c00007-0000-0000-0000-000000000000", start_time: futureDate(3, 5, 12), end_time: futureDate(3, 5, 14), created_at: trx.fn.now(), updated_at: trx.fn.now() },

      // Obsidian Citadel — Apprentice Wing (EASY)
      { id: "510c0017-0000-0000-0000-000000000000", booking_location_id: "10c00008-0000-0000-0000-000000000000", start_time: futureDate(1, 6, 10), end_time: futureDate(1, 6, 12), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0018-0000-0000-0000-000000000000", booking_location_id: "10c00008-0000-0000-0000-000000000000", start_time: futureDate(2, 2, 14), end_time: futureDate(2, 2, 16), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0019-0000-0000-0000-000000000000", booking_location_id: "10c00008-0000-0000-0000-000000000000", start_time: futureDate(4, 0, 11), end_time: futureDate(4, 0, 13), created_at: trx.fn.now(), updated_at: trx.fn.now() },
    ];
    await trx("time_slot").insert(slots);

    // -----------------------------------------------------------------------
    // BOOKINGS
    // At least 4 BOOKED, at least 2 CANCELLED, spread across multiple users and locations.
    // -----------------------------------------------------------------------
    const bookings = [
      // BOOKED — Laios books the Great Hall
      { id: "b00c0001-0000-0000-0000-000000000000", time_slot_id: "510c0001-0000-0000-0000-000000000000", end_user_id: FIXED_END_USER_ID, status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      // BOOKED — Bilbo books the Midnight Market
      { id: "b00c0002-0000-0000-0000-000000000000", time_slot_id: "510c0007-0000-0000-0000-000000000000", end_user_id: "11111111-2222-3333-4444-555555555555", status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      // BOOKED — Ciri books Undermountain Sargauth Level
      { id: "b00c0003-0000-0000-0000-000000000000", time_slot_id: "510c0009-0000-0000-0000-000000000000", end_user_id: "33333333-4444-5555-6666-777777777777", status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      // BOOKED — Navi books the Lonely Mountain
      { id: "b00c0004-0000-0000-0000-000000000000", time_slot_id: "510c0013-0000-0000-0000-000000000000", end_user_id: "44444444-5555-6666-7777-888888888888", status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      // BOOKED — Alucard books the Obsidian Citadel
      { id: "b00c0005-0000-0000-0000-000000000000", time_slot_id: "510c0017-0000-0000-0000-000000000000", end_user_id: "77777777-8888-9999-0000-111111111111", status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      // BOOKED — Tatl books the Whispered Tomb
      { id: "b00c0006-0000-0000-0000-000000000000", time_slot_id: "510c0015-0000-0000-0000-000000000000", end_user_id: "55555555-6666-7777-8888-999999999999", status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      // CANCELLED — Geralt cancelled a Crypts booking
      { id: "b00c0007-0000-0000-0000-000000000000", time_slot_id: "510c0004-0000-0000-0000-000000000000", end_user_id: "22222222-3333-4444-5555-666666666666", status: "CANCELLED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      // CANCELLED — Trevor cancelled an Obsidian Citadel booking
      { id: "b00c0008-0000-0000-0000-000000000000", time_slot_id: "510c0018-0000-0000-0000-000000000000", end_user_id: "66666666-7777-8888-9999-000000000000", status: "CANCELLED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
    ];
    await trx("booking").insert(bookings);
  });
}
