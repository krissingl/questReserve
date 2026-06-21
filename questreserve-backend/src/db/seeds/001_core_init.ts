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
const PROFILE_PICS_DIR = path.resolve(__dirname, "../../../uploads", "profile-pictures");

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

function planProfilePicCopy(srcPath: string, slug: string): FileCopyJob {
  const ext = path.extname(srcPath);
  const filename = `${slug}${ext}`;
  return {
    src: srcPath,
    destDir: PROFILE_PICS_DIR,
    destPath: path.join(PROFILE_PICS_DIR, filename),
    url: `${BACKEND_PUBLIC_URL}/uploads/profile-pictures/${filename}`,
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
  "10c00009-0000-0000-0000-000000000000": "StormveilCastle",
  "10c00010-0000-0000-0000-000000000000": "Moria",
  "10c00011-0000-0000-0000-000000000000": "TempleOfTime",
  "10c00012-0000-0000-0000-000000000000": "DragonRoostCavern",
};

const PROVIDER_PICTURES: Record<string, string> = {
  [FIXED_PROVIDER_ID]: "strahd",
  "cccccccc-cccc-cccc-cccc-cccccccccccc": "",
  "dddddddd-dddd-dddd-dddd-dddddddddddd": "smaug",
  "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee": "vecna",
  "ffffffff-ffff-ffff-ffff-ffffffffffff": "",
  "00000000-ffff-0000-ffff-000000000000": "gohma",
  "a1a1a1a1-0000-0000-0000-000000000000": "godrickGrafted",
  "b2b2b2b2-0000-0000-0000-000000000000": "balrog",
};

const CUSTOMER_PICTURES: Record<string, string> = {
  [FIXED_END_USER_ID]: "laiostouden",
  "11111111-2222-3333-4444-555555555555": "bilbobaggins",
  "22222222-3333-4444-5555-666666666666": "geraltofrivia",
  "33333333-4444-5555-6666-777777777777": "ciriofcintra",
  "44444444-5555-6666-7777-888888888888": "navithefairy",
  "55555555-6666-7777-8888-999999999999": "tatlthefairy",
  "66666666-7777-8888-9999-000000000000": "trevorbelmont",
  "77777777-8888-9999-0000-111111111111": "alucardtepes",
};

function findProfilePicFile(folder: string, slug: string): string | null {
  if (!slug) return null;
  const dir = path.join(ASSETS_DIR, folder);
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  const match = files.find((f) => f.startsWith(slug) && /\.(jpg|jpeg|png|webp)$/i.test(f));
  return match ? path.join(dir, match) : null;
}

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

  // Plan provider and customer profile picture copies
  const providerPictureUrls: Record<string, string | null> = {};
  for (const [id, slug] of Object.entries(PROVIDER_PICTURES)) {
    const src = findProfilePicFile("providers", slug);
    if (src) {
      const job = planProfilePicCopy(src, slug);
      copyJobs.push(job);
      providerPictureUrls[id] = job.url;
    } else {
      providerPictureUrls[id] = null;
    }
  }

  const customerPictureUrls: Record<string, string | null> = {};
  for (const [id, slug] of Object.entries(CUSTOMER_PICTURES)) {
    const src = findProfilePicFile("customers", slug);
    if (src) {
      const job = planProfilePicCopy(src, slug);
      copyJobs.push(job);
      customerPictureUrls[id] = job.url;
    } else {
      customerPictureUrls[id] = null;
    }
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
        bio: "I am the Ancient. I am the Land. For centuries I have presided over the mists of Barovia, and I invite those bold enough to test themselves against my domain. Barovia Experiences offers curated encounters across the castle and village — each designed personally, each unforgettable. Come. The night is young.",
        profile_picture_url: providerPictureUrls[FIXED_PROVIDER_ID] ?? null,
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
        bio: "Archmage. Dungeon architect. The Mad Mage of Undermountain. I have spent centuries constructing the greatest dungeon complex in the known world and have graciously opened two wings to the public: the Sargauth Level and the Caverns of the Xanathar. I may have changed them since you booked. This is part of the experience.",
        profile_picture_url: providerPictureUrls["cccccccc-cccc-cccc-cccc-cccccccccccc"] ?? null,
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
        bio: "I am Smaug. I lay upon a bed of gold that would blind lesser beings with its splendor, and I have elected to share this experience with paying guests. I know every coin in my treasury. I will know if you move anything. Enjoy the experience. Do not enjoy it too much.",
        profile_picture_url: providerPictureUrls["dddddddd-dddd-dddd-dddd-dddddddddddd"] ?? null,
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
        bio: "I have transcended mortality and catalogued secrets that would dissolve the minds of the unprepared. The Whispered Tomb Archive is not entertainment — it is an examination. Complete the inscription sequence, preserve the texts, and do not annotate anything. Parties who cannot read ancient script under escalating temporal pressure have no business in my archive.",
        profile_picture_url: providerPictureUrls["eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"] ?? null,
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
        bio: "The House of Tepes has protected — and preyed upon — the lands of Wallachia for a thousand years. My experience was unmatched on this platform and is currently unavailable due to an administrative matter I consider entirely overblown. I will return. I have nothing further to say to the compliance team.",
        profile_picture_url: providerPictureUrls["ffffffff-ffff-ffff-ffff-ffffffffffff"] ?? null,
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
        bio: "Queen Gohma presides over three locations as part of Ganon's Forces' adventure portfolio. All offer environments rich in web architecture, egg sac installations, and organic puzzle design. The web fixtures are decorative and not to be disturbed. Parties who follow the briefing guidelines complete their objectives. Parties who do not follow the guidelines become part of the environment.",
        profile_picture_url: providerPictureUrls["00000000-ffff-0000-ffff-000000000000"] ?? null,
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "a1a1a1a1-0000-0000-0000-000000000000",
        first_name: "Godrick",
        last_name: "the Grafted",
        email: "grafted@stormveil.net",
        password_hash: hash,
        organization_name: "Stormveil Castle",
        plan: "STANDARD",
        status: "ACTIVE",
        bio: "I AM GODRICK THE GRAFTED. ALL-CONQUERING. SCION OF THE GOLDEN LINEAGE. Stormveil Castle offers the finest dungeon challenge on this platform, built through decades of dedication and grafting expertise that is entirely within the terms of service. It is not for parties who have not read the briefing. Most parties are not ready. This is the point.",
        profile_picture_url: providerPictureUrls["a1a1a1a1-0000-0000-0000-000000000000"] ?? null,
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "b2b2b2b2-0000-0000-0000-000000000000",
        first_name: "Durin's",
        last_name: "Bane",
        email: "durins.bane@khazad-dum.net",
        password_hash: hash,
        organization_name: "Khazad-dûm Expeditions",
        plan: "PREMIUM",
        status: "ACTIVE",
        bio: "The Balrog has walked in flame since before your world had a name. Khazad-dum is the only experience I offer and it requires no further description. You will enter the ancient halls. You will find the bridge. I will rise. No refunds.",
        profile_picture_url: providerPictureUrls["b2b2b2b2-0000-0000-0000-000000000000"] ?? null,
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
        bio: "Dungeon delver and field researcher with a particular interest in the culinary applications of monster biology. Most dungeon creatures are significantly more edible than their reputation suggests, and I document them as I go. I book adventures primarily to explore new locations and catalogue unfamiliar species. My party tolerates this. If your dungeon has a unique monster ecosystem, I will be very enthusiastic about it.",
        profile_picture_url: customerPictureUrls[FIXED_END_USER_ID] ?? null,
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
        bio: "A hobbit of the Shire, retired from adventure more times than I can count. I have had one long and unexpected journey that I wrote a book about, and I keep the occasional booking to stay sharp. I am experienced in finding things that do not wish to be found, I have very quiet feet, and I do not sneak into anyone's storage tunnels on purpose. Usually.",
        profile_picture_url: customerPictureUrls["11111111-2222-3333-4444-555555555555"] ?? null,
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
        bio: "Witcher. Contract work available on request. I book dungeon experiences between contracts for training and reconnaissance. I prefer HARD to LEGENDARY difficulty, I do not use hints, and my party will not damage the facilities beyond what is strictly necessary to complete the objective. Hmm.",
        profile_picture_url: customerPictureUrls["22222222-3333-4444-5555-666666666666"] ?? null,
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
        bio: "Witcher-trained, Continent-tested. I book experiences for tactical conditioning and because I genuinely enjoy them when the design holds up. I prefer locations that reward spatial awareness over brute force, I read the full briefing, and I expect the dungeon to deliver what it promises.",
        profile_picture_url: customerPictureUrls["33333333-4444-5555-6666-777777777777"] ?? null,
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
        bio: "Guide fairy and adventure enthusiast! I have traveled across Hyrule with my partner Link and I bring that same energy to every booking! I specialize in real-time party coordination and I am VERY good at noticing things other party members miss! HEY! Some parties find this extremely helpful! Others find it a lot! I am always available to point out what you may have overlooked!",
        profile_picture_url: customerPictureUrls["44444444-5555-6666-7777-888888888888"] ?? null,
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
        bio: "Fairy. I have traveled through time, collected every mask in an alternate Hyrule, and crossed dimensions I do not have time to explain. I book dungeon experiences because at this point they are a normal Tuesday for me. I am an honest reviewer: I will not pretend to be impressed by things that do not impress me, and I will give full credit where it is due.",
        profile_picture_url: customerPictureUrls["55555555-6666-7777-8888-999999999999"] ?? null,
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
        bio: "The Belmont family has hunted creatures of darkness for generations and I carry that legacy into every dungeon I enter. I complete what I start. I read the briefing. Whether I follow every item in the briefing is an operational decision I reserve the right to make on-site based on conditions as I find them. Previous providers have found this arrangement satisfactory. Some have found it less so. I refer them to my completion record.",
        profile_picture_url: customerPictureUrls["66666666-7777-8888-9999-000000000000"] ?? null,
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
        bio: "I have navigated my father's castle in its full wrath, alone, and lived. I book QuestReserve experiences in the belief that even the most accomplished adventurer benefits from structured challenge. I am a thorough and methodical party member, and I ask only that the location deliver what it promises. I note in my reviews when it exceeds expectations — as well as when the entry briefing is delivered entirely in chittering.",
        profile_picture_url: customerPictureUrls["77777777-8888-9999-0000-111111111111"] ?? null,
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
        party_size_min: 2,
        party_size_max: 6,
        level_range_min: 5,
        level_range_max: 10,
        landscape_type: "mountain",
        setting: "interior",
        environment_tags: ["haunted"],
        magic_restrictions: ["divine_restricted"],
        tone_tags: ["horror", "mystery"],
        gore_level: 1,
        non_lethal_mode: false,
        permadeath_risk: false,
        primary_focus: -3,
        boss_encounter: true,
        pvp_permitted: false,
        scouting_permitted: true,
        run_time_minutes: 120,
        reset_time_hours: 24,
        time_limit_minutes: null,
        has_safe_room: false,
        has_merchant: true,
        equipment_provided: false,
        guide_provided: false,
        loot_type: "random",
        boss_loot: true,
        unique_item_chance: false,
        booking_type: "exclusive",
        solo_permitted: false,
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
        party_size_min: 3,
        party_size_max: 5,
        level_range_min: 12,
        level_range_max: 20,
        landscape_type: "cave",
        setting: "interior",
        environment_tags: ["haunted"],
        magic_restrictions: ["divine_restricted", "antimagic"],
        tone_tags: ["horror"],
        gore_level: 2,
        non_lethal_mode: false,
        permadeath_risk: true,
        primary_focus: 4,
        boss_encounter: true,
        pvp_permitted: false,
        scouting_permitted: false,
        run_time_minutes: 180,
        reset_time_hours: 48,
        time_limit_minutes: 180,
        has_safe_room: false,
        has_merchant: false,
        equipment_provided: false,
        guide_provided: false,
        loot_type: "guaranteed",
        boss_loot: true,
        unique_item_chance: true,
        booking_type: "exclusive",
        solo_permitted: false,
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
        party_size_min: 1,
        party_size_max: 8,
        level_range_min: 1,
        level_range_max: 5,
        landscape_type: "plains",
        setting: "exterior",
        environment_tags: ["haunted"],
        magic_restrictions: ["none"],
        tone_tags: ["mystery", "political"],
        gore_level: 0,
        non_lethal_mode: true,
        permadeath_risk: false,
        primary_focus: -4,
        boss_encounter: false,
        pvp_permitted: false,
        scouting_permitted: true,
        run_time_minutes: 90,
        reset_time_hours: 24,
        time_limit_minutes: 120,
        has_safe_room: true,
        has_merchant: true,
        equipment_provided: false,
        guide_provided: true,
        loot_type: "random",
        boss_loot: false,
        unique_item_chance: true,
        booking_type: "concurrent",
        solo_permitted: true,
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
        party_size_min: 2,
        party_size_max: 4,
        level_range_min: 8,
        level_range_max: 15,
        landscape_type: "swamp",
        setting: "interior",
        environment_tags: ["toxic"],
        magic_restrictions: ["wild_magic"],
        tone_tags: ["comedic", "heroic"],
        gore_level: 1,
        non_lethal_mode: false,
        permadeath_risk: false,
        primary_focus: -4,
        boss_encounter: false,
        pvp_permitted: false,
        scouting_permitted: true,
        run_time_minutes: 150,
        reset_time_hours: 48,
        time_limit_minutes: 180,
        has_safe_room: true,
        has_merchant: false,
        equipment_provided: false,
        guide_provided: false,
        loot_type: "random",
        boss_loot: false,
        unique_item_chance: false,
        booking_type: "exclusive",
        solo_permitted: false,
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
        party_size_min: 2,
        party_size_max: 4,
        level_range_min: 15,
        level_range_max: 20,
        landscape_type: "urban",
        setting: "interior",
        environment_tags: [],
        magic_restrictions: ["antimagic"],
        tone_tags: ["mystery"],
        gore_level: 0,
        non_lethal_mode: false,
        permadeath_risk: true,
        primary_focus: -3,
        boss_encounter: true,
        pvp_permitted: false,
        scouting_permitted: false,
        run_time_minutes: 240,
        reset_time_hours: 72,
        time_limit_minutes: 240,
        has_safe_room: false,
        has_merchant: false,
        equipment_provided: false,
        guide_provided: false,
        loot_type: "guaranteed",
        boss_loot: true,
        unique_item_chance: true,
        booking_type: "exclusive",
        solo_permitted: false,
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
        party_size_min: 2,
        party_size_max: 6,
        level_range_min: 10,
        level_range_max: 18,
        landscape_type: "mountain",
        setting: "interior",
        environment_tags: [],
        magic_restrictions: ["none"],
        tone_tags: ["heroic"],
        gore_level: 0,
        non_lethal_mode: false,
        permadeath_risk: false,
        primary_focus: -5,
        boss_encounter: true,
        pvp_permitted: false,
        scouting_permitted: true,
        run_time_minutes: 90,
        reset_time_hours: 168,
        time_limit_minutes: 90,
        has_safe_room: false,
        has_merchant: false,
        equipment_provided: false,
        guide_provided: false,
        loot_type: "guaranteed",
        boss_loot: true,
        unique_item_chance: true,
        booking_type: "exclusive",
        solo_permitted: false,
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
        party_size_min: 1,
        party_size_max: 3,
        level_range_min: 5,
        level_range_max: 12,
        landscape_type: "desert",
        setting: "interior",
        environment_tags: ["haunted"],
        magic_restrictions: ["arcane_restricted"],
        tone_tags: ["horror", "mystery"],
        gore_level: 0,
        non_lethal_mode: false,
        permadeath_risk: false,
        primary_focus: -5,
        boss_encounter: true,
        pvp_permitted: false,
        scouting_permitted: false,
        run_time_minutes: 60,
        reset_time_hours: 24,
        time_limit_minutes: 60,
        has_safe_room: false,
        has_merchant: false,
        equipment_provided: false,
        guide_provided: false,
        loot_type: "none",
        boss_loot: false,
        unique_item_chance: false,
        booking_type: "exclusive",
        solo_permitted: true,
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
        party_size_min: 1,
        party_size_max: 4,
        level_range_min: 1,
        level_range_max: 6,
        landscape_type: "forest",
        setting: "interior",
        environment_tags: ["haunted"],
        magic_restrictions: ["none"],
        tone_tags: ["heroic"],
        gore_level: 0,
        non_lethal_mode: true,
        permadeath_risk: false,
        primary_focus: -2,
        boss_encounter: true,
        pvp_permitted: false,
        scouting_permitted: true,
        run_time_minutes: 75,
        reset_time_hours: 24,
        time_limit_minutes: null,
        has_safe_room: true,
        has_merchant: false,
        equipment_provided: true,
        guide_provided: false,
        loot_type: "random",
        boss_loot: true,
        unique_item_chance: false,
        booking_type: "concurrent",
        solo_permitted: true,
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "10c00009-0000-0000-0000-000000000000",
        provider_id: "a1a1a1a1-0000-0000-0000-000000000000",
        name: "Stormveil Castle — Grafted Throne",
        description:
          "Breach the storm-drenched ramparts and fog-gated corridors of Godrick's stronghold. Navigate the battlements, the grafting chambers, and the All-Conquering's throne room. Few who enter leave unchanged.",
        difficulty: "HARD",
        cancellation_policy: "50% refund if cancelled 24 hours or more in advance. No refund within 24 hours of the raid.",
        image_url: firstUrl("10c00009-0000-0000-0000-000000000000"),
        party_size_min: 1,
        party_size_max: 3,
        level_range_min: 10,
        level_range_max: 20,
        landscape_type: "coastal",
        setting: "both",
        environment_tags: [],
        magic_restrictions: ["none"],
        tone_tags: ["heroic"],
        gore_level: 2,
        non_lethal_mode: false,
        permadeath_risk: true,
        primary_focus: 5,
        boss_encounter: true,
        pvp_permitted: false,
        scouting_permitted: true,
        run_time_minutes: 180,
        reset_time_hours: 72,
        time_limit_minutes: null,
        has_safe_room: false,
        has_merchant: false,
        equipment_provided: false,
        guide_provided: false,
        loot_type: "guaranteed",
        boss_loot: true,
        unique_item_chance: true,
        booking_type: "exclusive",
        solo_permitted: true,
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "10c00010-0000-0000-0000-000000000000",
        provider_id: "b2b2b2b2-0000-0000-0000-000000000000",
        name: "Moria — The Bridge of Khazad-dûm",
        description:
          "Descend through the ancient halls of Khazad-dûm and cross the bridge before Durin's Bane rises from the deep. The chasm below is bottomless, the bridge will not hold forever, and the Balrog has never been kept waiting.",
        difficulty: "LEGENDARY",
        cancellation_policy: "No refunds. Durin's Bane accepts no cancellations.",
        image_url: firstUrl("10c00010-0000-0000-0000-000000000000"),
        party_size_min: 4,
        party_size_max: 9,
        level_range_min: 15,
        level_range_max: 20,
        landscape_type: "tundra",
        setting: "interior",
        environment_tags: ["frozen"],
        magic_restrictions: ["none"],
        tone_tags: ["heroic"],
        gore_level: 3,
        non_lethal_mode: false,
        permadeath_risk: true,
        primary_focus: 3,
        boss_encounter: true,
        pvp_permitted: false,
        scouting_permitted: false,
        run_time_minutes: 60,
        reset_time_hours: 168,
        time_limit_minutes: 60,
        has_safe_room: false,
        has_merchant: false,
        equipment_provided: false,
        guide_provided: false,
        loot_type: "none",
        boss_loot: false,
        unique_item_chance: false,
        booking_type: "exclusive",
        solo_permitted: false,
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "10c00011-0000-0000-0000-000000000000",
        provider_id: "00000000-ffff-0000-ffff-000000000000",
        name: "Temple of Time — Sacred Grove",
        description:
          "Navigate the ancient ruins of the Temple of Time, past stone guardians and crumbling passages, to confront Armogohma in the sanctum above. The temple has slept for centuries — your arrival will wake it.",
        difficulty: "MEDIUM",
        cancellation_policy: "Full refund if cancelled 5 or more days in advance. No refund within 5 days.",
        image_url: firstUrl("10c00011-0000-0000-0000-000000000000"),
        party_size_min: 1,
        party_size_max: 4,
        level_range_min: 5,
        level_range_max: 10,
        landscape_type: "mountain",
        setting: "interior",
        environment_tags: [],
        magic_restrictions: ["none"],
        tone_tags: ["mystery"],
        gore_level: 0,
        non_lethal_mode: false,
        permadeath_risk: false,
        primary_focus: -1,
        boss_encounter: true,
        pvp_permitted: false,
        scouting_permitted: true,
        run_time_minutes: 105,
        reset_time_hours: 24,
        time_limit_minutes: null,
        has_safe_room: false,
        has_merchant: false,
        equipment_provided: false,
        guide_provided: false,
        loot_type: "random",
        boss_loot: true,
        unique_item_chance: false,
        booking_type: "concurrent",
        solo_permitted: true,
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: "10c00012-0000-0000-0000-000000000000",
        provider_id: "00000000-ffff-0000-ffff-000000000000",
        name: "Dragon Roost Cavern",
        description:
          "Climb the volcanic interior of Dragon Roost Island, navigate the lava-choked chambers of the Rito tribe's ancestral home, and face Gohma at the cavern's heart. A classic quest for those new to the adventure.",
        difficulty: "EASY",
        cancellation_policy: "Full refund if cancelled 48 hours or more in advance. No refund within 48 hours.",
        image_url: firstUrl("10c00012-0000-0000-0000-000000000000"),
        party_size_min: 1,
        party_size_max: 4,
        level_range_min: 1,
        level_range_max: 5,
        landscape_type: "volcanic",
        setting: "interior",
        environment_tags: ["lava"],
        magic_restrictions: ["none"],
        tone_tags: ["heroic", "comedic"],
        gore_level: 0,
        non_lethal_mode: true,
        permadeath_risk: false,
        primary_focus: 2,
        boss_encounter: true,
        pvp_permitted: false,
        scouting_permitted: true,
        run_time_minutes: 45,
        reset_time_hours: 24,
        time_limit_minutes: null,
        has_safe_room: true,
        has_merchant: false,
        equipment_provided: true,
        guide_provided: true,
        loot_type: "random",
        boss_loot: true,
        unique_item_chance: false,
        booking_type: "concurrent",
        solo_permitted: true,
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

      // Stormveil Castle — Grafted Throne (loc 9)
      { id: "510c0040-0000-0000-0000-000000000000", booking_location_id: "10c00009-0000-0000-0000-000000000000", start_time: fixedDate(2027, 5, 15, 14), end_time: fixedDate(2027, 5, 15, 17), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0041-0000-0000-0000-000000000000", booking_location_id: "10c00009-0000-0000-0000-000000000000", start_time: fixedDate(2027, 7, 22, 18), end_time: fixedDate(2027, 7, 22, 21), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0042-0000-0000-0000-000000000000", booking_location_id: "10c00009-0000-0000-0000-000000000000", start_time: fixedDate(2027, 9, 18, 12), end_time: fixedDate(2027, 9, 18, 15), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0043-0000-0000-0000-000000000000", booking_location_id: "10c00009-0000-0000-0000-000000000000", start_time: fixedDate(2027, 11, 14, 16), end_time: fixedDate(2027, 11, 14, 19), created_at: trx.fn.now(), updated_at: trx.fn.now() },

      // Moria — The Bridge of Khazad-dûm (loc 10)
      { id: "510c0044-0000-0000-0000-000000000000", booking_location_id: "10c00010-0000-0000-0000-000000000000", start_time: fixedDate(2027, 6, 21, 20), end_time: fixedDate(2027, 6, 21, 23), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0045-0000-0000-0000-000000000000", booking_location_id: "10c00010-0000-0000-0000-000000000000", start_time: fixedDate(2027, 10, 31, 20), end_time: fixedDate(2027, 10, 31, 23), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0046-0000-0000-0000-000000000000", booking_location_id: "10c00010-0000-0000-0000-000000000000", start_time: fixedDate(2027, 12, 20, 21), end_time: fixedDate(2027, 12, 20, 23), created_at: trx.fn.now(), updated_at: trx.fn.now() },

      // Temple of Time — Sacred Grove (loc 11)
      { id: "510c0047-0000-0000-0000-000000000000", booking_location_id: "10c00011-0000-0000-0000-000000000000", start_time: fixedDate(2027, 4, 24, 10), end_time: fixedDate(2027, 4, 24, 12), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0048-0000-0000-0000-000000000000", booking_location_id: "10c00011-0000-0000-0000-000000000000", start_time: fixedDate(2027, 7, 11, 11), end_time: fixedDate(2027, 7, 11, 13), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0049-0000-0000-0000-000000000000", booking_location_id: "10c00011-0000-0000-0000-000000000000", start_time: fixedDate(2027, 10, 9,  10), end_time: fixedDate(2027, 10, 9,  12), created_at: trx.fn.now(), updated_at: trx.fn.now() },

      // Dragon Roost Cavern (loc 12)
      { id: "510c0050-0000-0000-0000-000000000000", booking_location_id: "10c00012-0000-0000-0000-000000000000", start_time: fixedDate(2027, 5, 1,  10), end_time: fixedDate(2027, 5, 1,  12), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0051-0000-0000-0000-000000000000", booking_location_id: "10c00012-0000-0000-0000-000000000000", start_time: fixedDate(2027, 6, 12, 13), end_time: fixedDate(2027, 6, 12, 15), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0052-0000-0000-0000-000000000000", booking_location_id: "10c00012-0000-0000-0000-000000000000", start_time: fixedDate(2027, 8, 28, 10), end_time: fixedDate(2027, 8, 28, 12), created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "510c0053-0000-0000-0000-000000000000", booking_location_id: "10c00012-0000-0000-0000-000000000000", start_time: fixedDate(2027, 11, 6,  11), end_time: fixedDate(2027, 11, 6,  13), created_at: trx.fn.now(), updated_at: trx.fn.now() },
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
      // Additional bookings for expanded review coverage across all locations
      { id: "b00c0009-0000-0000-0000-000000000000", time_slot_id: "510c0005-0000-0000-0000-000000000000", end_user_id: "22222222-3333-4444-5555-666666666666", status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "b00c0010-0000-0000-0000-000000000000", time_slot_id: "510c0011-0000-0000-0000-000000000000", end_user_id: "11111111-2222-3333-4444-555555555555", status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "b00c0011-0000-0000-0000-000000000000", time_slot_id: "510c0040-0000-0000-0000-000000000000", end_user_id: "66666666-7777-8888-9999-000000000000", status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "b00c0012-0000-0000-0000-000000000000", time_slot_id: "510c0044-0000-0000-0000-000000000000", end_user_id: FIXED_END_USER_ID, status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "b00c0013-0000-0000-0000-000000000000", time_slot_id: "510c0047-0000-0000-0000-000000000000", end_user_id: "33333333-4444-5555-6666-777777777777", status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "b00c0014-0000-0000-0000-000000000000", time_slot_id: "510c0050-0000-0000-0000-000000000000", end_user_id: "44444444-5555-6666-7777-888888888888", status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "b00c0015-0000-0000-0000-000000000000", time_slot_id: "510c0041-0000-0000-0000-000000000000", end_user_id: "55555555-6666-7777-8888-999999999999", status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
      { id: "b00c0016-0000-0000-0000-000000000000", time_slot_id: "510c0010-0000-0000-0000-000000000000", end_user_id: "77777777-8888-9999-0000-111111111111", status: "BOOKED", created_at: trx.fn.now(), updated_at: trx.fn.now() },
    ];
    await trx("booking").insert(bookings);

    const reviews = [
      // === b00c0001: Laios at Castle Ravenloft Great Hall (Strahd) ===
      { id: "aa000001-0000-0000-0000-000000000000", reviewer_id: FIXED_END_USER_ID, reviewer_type: "customer", target_id: FIXED_PROVIDER_ID, target_type: "provider", booking_id: "b00c0001-0000-0000-0000-000000000000", rating: 4, body: "Our party cleared the Great Hall ahead of schedule, but I spent nearly the entire run cataloguing the local fauna. The giant rats near the west corridor are surprisingly well-marbled. Strahd swept in for the finale looking genuinely threatening — professional, atmospheric, four stars. Would have been five but nobody warned us the chandeliers were load-bearing.", created_at: trx.fn.now() },
      { id: "aa000002-0000-0000-0000-000000000000", reviewer_id: FIXED_END_USER_ID, reviewer_type: "customer", target_id: "10c00001-0000-0000-0000-000000000000", target_type: "location", booking_id: "b00c0001-0000-0000-0000-000000000000", rating: 5, body: "Exceptional dungeon design. The fog obscures the scent trails, which frustrated our tracker but added enormously to the atmosphere. Multiple patrol routes, two hidden chambers, and at least three edible monster species I had not previously catalogued. Our party found the bell-room mechanism on our third circuit. Highly recommended for any party that values thorough exploration over speed.", created_at: trx.fn.now() },
      { id: "aa000003-0000-0000-0000-000000000000", reviewer_id: FIXED_PROVIDER_ID, reviewer_type: "provider", target_id: FIXED_END_USER_ID, target_type: "customer", booking_id: "b00c0001-0000-0000-0000-000000000000", rating: 5, body: "Mr. Touden's party completed the riddle sequence in admirable time. I have one note: he attempted to eat one of my ravens. The ravens are part of the experience, Mr. Touden. They are not included in the dungeon for culinary purposes. I have deducted nothing — it was, in its own bizarre way, entirely in the spirit of adventuring. I look forward to his next visit.", created_at: trx.fn.now() },

      // === b00c0002: Bilbo at Barovia Midnight Market (Strahd) ===
      { id: "aa000004-0000-0000-0000-000000000000", reviewer_id: "11111111-2222-3333-4444-555555555555", reviewer_type: "customer", target_id: FIXED_PROVIDER_ID, target_type: "provider", booking_id: "b00c0002-0000-0000-0000-000000000000", rating: 5, body: "I am no stranger to cursed markets and spectral merchants — I have dealt with stranger things in my long and eventful career — but Barovia's Midnight Market surpassed even my considerable expectations. Strahd is an attentive host in the truest sense: he does not let you forget, not even for a moment, that you are entirely at his mercy. Top marks.", created_at: trx.fn.now() },
      { id: "aa000005-0000-0000-0000-000000000000", reviewer_id: "11111111-2222-3333-4444-555555555555", reviewer_type: "customer", target_id: "10c00003-0000-0000-0000-000000000000", target_type: "location", booking_id: "b00c0002-0000-0000-0000-000000000000", rating: 5, body: "A moonlit market of genuine quality. The spectral merchants were well-briefed and in character throughout. Our company very nearly purchased the wrong cursed item on the first pass — an embarrassing error I must attribute to the younger members of the party who shall remain nameless. The correct item was found on the second run, and the satisfaction of lifting the curse was, as they say, priceless.", created_at: trx.fn.now() },
      { id: "aa000006-0000-0000-0000-000000000000", reviewer_id: FIXED_PROVIDER_ID, reviewer_type: "provider", target_id: "11111111-2222-3333-4444-555555555555", target_type: "customer", booking_id: "b00c0002-0000-0000-0000-000000000000", rating: 4, body: "Mr. Baggins's company conducted themselves with admirable composure throughout the midnight hour. One small note: several vendor stalls reported missing inventory at close of market. I cannot prove anything. Mr. Baggins was, as always, terribly charming about the whole affair. Four stars. Recommended, with the caveat that you count your stock before they leave.", created_at: trx.fn.now() },

      // === b00c0003: Ciri at Undermountain Sargauth (Halaster) ===
      { id: "aa000007-0000-0000-0000-000000000000", reviewer_id: "33333333-4444-5555-6666-777777777777", reviewer_type: "customer", target_id: "cccccccc-cccc-cccc-cccc-cccccccccccc", target_type: "provider", booking_id: "b00c0003-0000-0000-0000-000000000000", rating: 3, body: "The Sargauth level has real potential but Halaster spent most of our run cackling from somewhere in the walls. Two of the illusion traps recycled the same image. Our party's mage identified the repeat on the second loop and we exploited it to skip the third chamber entirely — I do not think that was intended. Points for atmosphere, minus two for consistency. Get your traps reviewed.", created_at: trx.fn.now() },
      { id: "aa000008-0000-0000-0000-000000000000", reviewer_id: "33333333-4444-5555-6666-777777777777", reviewer_type: "customer", target_id: "10c00004-0000-0000-0000-000000000000", target_type: "location", booking_id: "b00c0003-0000-0000-0000-000000000000", rating: 4, body: "For a mid-tier dungeon wing it delivers. The collapsing passages required real coordination — our party's formation training paid off here. Visibility is intentionally poor, which works in the location's favor. The river section had excellent tension. Our team completed it under the par time, which we are unreasonably proud of.", created_at: trx.fn.now() },
      { id: "aa000014-0000-0000-0000-000000000000", reviewer_id: "cccccccc-cccc-cccc-cccc-cccccccccccc", reviewer_type: "provider", target_id: "33333333-4444-5555-6666-777777777777", target_type: "customer", booking_id: "b00c0003-0000-0000-0000-000000000000", rating: 4, body: "This party bypassed my third illusion trap by identifying the repeated image in the second sequence, and I want everyone to know that was NOT an error — it was a TEST — and they FAILED by PASSING and I am docking a star because real adventurers experience the full illusion sequence. Also the silver-haired one kept muttering about 'shortcuts' in a way I found personally disrespectful. RECOMMENDED. Four stars. Wait, three. FOUR.", created_at: trx.fn.now() },

      // === b00c0004: Navi at Lonely Mountain Treasure Vault (Smaug) ===
      { id: "aa000009-0000-0000-0000-000000000000", reviewer_id: "44444444-5555-6666-7777-888888888888", reviewer_type: "customer", target_id: "dddddddd-dddd-dddd-dddd-dddddddddddd", target_type: "provider", booking_id: "b00c0004-0000-0000-0000-000000000000", rating: 5, body: "HEY! LISTEN! THIS IS THE BEST THING OUR PARTY HAS EVER DONE. Smaug is a GENIUS. He plays a sleeping dragon better than any dragon I have ever seen, and I have seen several. Every time someone on our team breathed too loudly he shifted and the whole party nearly lost their minds. We retrieved the Arkenstone. We SCREAMED. Ten out of five stars. WOULD DO AGAIN IMMEDIATELY.", created_at: trx.fn.now() },
      { id: "aa000010-0000-0000-0000-000000000000", reviewer_id: "44444444-5555-6666-7777-888888888888", reviewer_type: "customer", target_id: "10c00006-0000-0000-0000-000000000000", target_type: "location", booking_id: "b00c0004-0000-0000-0000-000000000000", rating: 5, body: "The scale of this vault is genuinely astonishing. Our party had thirty seconds to spare at the end. THIRTY. I was on the other side of the room. My wings were a liability because I kept accidentally jingling against the treasure piles. In retrospect this is not an ideal dungeon for fairies. I did not care. Still the best experience of my life. Five stars forever.", created_at: trx.fn.now() },
      { id: "aa000015-0000-0000-0000-000000000000", reviewer_id: "dddddddd-dddd-dddd-dddd-dddddddddddd", reviewer_type: "provider", target_id: "44444444-5555-6666-7777-888888888888", target_type: "customer", booking_id: "b00c0004-0000-0000-0000-000000000000", rating: 3, body: "My treasury is maintained at a level of acoustic perfection that took two centuries to achieve. This party — and specifically the individual of fairy persuasion — shattered that perfection approximately fourteen times in the span of one hour. Jingling. Constant, unrelenting jingling. The Arkenstone was retrieved, which I acknowledge. My nap was ruined, which I do not acknowledge. Three stars, because at least they did not drop anything.", created_at: trx.fn.now() },

      // === b00c0005: Alucard at Cursed Deku Tree (Gohma) ===
      { id: "aa000011-0000-0000-0000-000000000000", reviewer_id: "77777777-8888-9999-0000-111111111111", reviewer_type: "customer", target_id: "00000000-ffff-0000-ffff-000000000000", target_type: "provider", booking_id: "b00c0005-0000-0000-0000-000000000000", rating: 4, body: "I have navigated my father's castle in darkness without a torch. I hold the experience of Queen Gohma's forest dungeon in high regard nonetheless. The design is genuinely inspired: vertical, organic, and disorienting in ways that repay careful attention. My party completed the parasite sequence without casualties. I found the queen herself appropriately theatrical. One star deducted for the entry briefing, which was delivered entirely in what I can only describe as chittering.", created_at: trx.fn.now() },
      { id: "aa000042-0000-0000-0000-000000000000", reviewer_id: "77777777-8888-9999-0000-111111111111", reviewer_type: "customer", target_id: "10c00008-0000-0000-0000-000000000000", target_type: "location", booking_id: "b00c0005-0000-0000-0000-000000000000", rating: 5, body: "The Heart of the Forest holds the distinction of being the only location where I found myself concerned about vertical space rather than horizontal. The interior of the Deku Tree is a masterwork of organic level design: rings of platforms, vine systems that serve as both obstacles and puzzle elements, and a parasite encounter that demands simultaneous awareness of multiple attack vectors. My party cleared the curse sequence with precision. Hauntingly beautiful space.", created_at: trx.fn.now() },
      { id: "aa000016-0000-0000-0000-000000000000", reviewer_id: "00000000-ffff-0000-ffff-000000000000", reviewer_type: "provider", target_id: "77777777-8888-9999-0000-111111111111", target_type: "customer", booking_id: "b00c0005-0000-0000-0000-000000000000", rating: 4, body: "This party arrived on time, which the egg sacs appreciated. The tall one with the silver hair severed two web installations in the entry corridor during what I can only assume was warmup. Those were decorative. The sign says DECORATIVE. He looked at the sign. He cut through them anyway. The forest spirit has been notified. The dungeon was completed successfully. I am giving four stars because at least he did not try to eat anything.", created_at: trx.fn.now() },

      // === b00c0006: Tatl at Whispered Tomb Archive (Vecna) ===
      { id: "aa000012-0000-0000-0000-000000000000", reviewer_id: "55555555-6666-7777-8888-999999999999", reviewer_type: "customer", target_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee", target_type: "provider", booking_id: "b00c0006-0000-0000-0000-000000000000", rating: 5, body: "Look, I have been through weirder. I have crossed time. But the Archive hit different. Vecna keeps the ritual countdown at an absolutely criminal pace — we had the first inscription decoded when the second alarm triggered and honestly I thought we were done. We were not done. We decoded all three with about twelve seconds left. Vecna emerged right on schedule looking insufferably pleased with himself. I hate that I am giving him five stars but I am.", created_at: trx.fn.now() },
      { id: "aa000013-0000-0000-0000-000000000000", reviewer_id: "55555555-6666-7777-8888-999999999999", reviewer_type: "customer", target_id: "10c00007-0000-0000-0000-000000000000", target_type: "location", booking_id: "b00c0006-0000-0000-0000-000000000000", rating: 5, body: "The archive space is beautifully constructed. Cold stone, real candle effects, the inscription walls are legible but intimidating — exactly right for the bit. A party of three is ideal. Four is chaotic and one person ends up doing nothing. Come with someone who can actually read ancient script or your team will spend the first five minutes staring at each other.", created_at: trx.fn.now() },
      { id: "aa000017-0000-0000-0000-000000000000", reviewer_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee", reviewer_type: "provider", target_id: "55555555-6666-7777-8888-999999999999", target_type: "customer", booking_id: "b00c0006-0000-0000-0000-000000000000", rating: 3, body: "The fairy completed the inscription sequence in a time I would classify as adequate but unworthy of celebration. The second inscription was solved incorrectly on the first attempt. I have reviewed the scroll evidence. The fairy annotated my ancient inscriptions with what appear to be emoticons. In permanent ink. This is why I have a no-writing policy in the archive. Five stars for completion. Zero stars for the defacement. The average is three. Three stars.", created_at: trx.fn.now() },

      // === b00c0009: Geralt at Castle Ravenloft Crypts (Strahd) ===
      { id: "aa000018-0000-0000-0000-000000000000", reviewer_id: "22222222-3333-4444-5555-666666666666", reviewer_type: "customer", target_id: "10c00002-0000-0000-0000-000000000000", target_type: "location", booking_id: "b00c0009-0000-0000-0000-000000000000", rating: 3, body: "Deep. Wet. Undead sentinels were competent. Our party located the objective in the third vault — southwest passage, the one they do not mark on the map. Strahd's trap design in this wing is more technical than theatrical, which I appreciated. Dock one star for the cave-in trigger near the second alcove: either fix it or warn people it is load-bearing. Hmm.", created_at: trx.fn.now() },
      { id: "aa000019-0000-0000-0000-000000000000", reviewer_id: "22222222-3333-4444-5555-666666666666", reviewer_type: "customer", target_id: FIXED_PROVIDER_ID, target_type: "provider", booking_id: "b00c0009-0000-0000-0000-000000000000", rating: 4, body: "Professional. Kept to the premise throughout. Did not break character when one of ours got stuck in a sarcophagus for eight minutes. That is discipline. The Crypts wing is harder than the Great Hall — recommend it to any party who found the Hall too comfortable. Good dungeon.", created_at: trx.fn.now() },
      { id: "aa000020-0000-0000-0000-000000000000", reviewer_id: FIXED_PROVIDER_ID, reviewer_type: "provider", target_id: "22222222-3333-4444-5555-666666666666", target_type: "customer", booking_id: "b00c0009-0000-0000-0000-000000000000", rating: 3, body: "Mr. of Rivia's party operates with a cold efficiency I find mildly unsettling. They spoke less than any group I have hosted. The witcher dismantled the southeast trap mechanism — which is rated LEGENDARY and has not been cleared in three raids — in approximately four minutes using a technique I did not recognize and prefer not to have documented. Three stars not because the party performed poorly, but because they performed too well. I must redesign the third vault before anyone else finds that approach.", created_at: trx.fn.now() },

      // === b00c0010: Bilbo at Undermountain Caverns of the Xanathar (Halaster) ===
      { id: "aa000021-0000-0000-0000-000000000000", reviewer_id: "11111111-2222-3333-4444-555555555555", reviewer_type: "customer", target_id: "10c00005-0000-0000-0000-000000000000", target_type: "location", booking_id: "b00c0010-0000-0000-0000-000000000000", rating: 4, body: "In the deep places of the world I have seen many things. I have walked the tunnels beneath the Misty Mountains. I mention this not to boast but to provide context: the beholder's surveillance network is something else entirely. Our company was spotted and catalogued within three minutes. We navigated it through careful timing, one fortunate distraction, and a very large hat. Recommended for experienced parties who enjoy the distinct sensation of being watched.", created_at: trx.fn.now() },
      { id: "aa000022-0000-0000-0000-000000000000", reviewer_id: "11111111-2222-3333-4444-555555555555", reviewer_type: "customer", target_id: "cccccccc-cccc-cccc-cccc-cccccccccccc", target_type: "provider", booking_id: "b00c0010-0000-0000-0000-000000000000", rating: 3, body: "I had hoped to meet Halaster between raids to discuss the dungeon design, as I had some notes. His assistant informed me that Halaster does not take notes from adventurers, and that he had already revised two of the traps since our run — revisions made, apparently, because he got bored of the originals. I respect creativity. I do not entirely respect unpredictability at the LEGENDARY tier. Three stars: genuinely excellent experience, not recommended for parties who require consistency.", created_at: trx.fn.now() },
      { id: "aa000023-0000-0000-0000-000000000000", reviewer_id: "cccccccc-cccc-cccc-cccc-cccccccccccc", reviewer_type: "provider", target_id: "11111111-2222-3333-4444-555555555555", target_type: "customer", booking_id: "b00c0010-0000-0000-0000-000000000000", rating: 2, body: "Mr. Baggins's company survived the beholder network by wearing a hat. A HAT. This defeats my surveillance algorithm in a way I cannot currently explain. I have updated the algorithm. More importantly: Mr. Baggins examined every side passage in my dungeon, including the ones that are not part of the experience and are genuinely just my storage tunnels. He found the one that leads to my notes. He READ my notes. MY PERSONAL NOTES. I am docking stars for the violation and additional stars for the fact that the hat worked. Two stars. He is banned from all side passages.", created_at: trx.fn.now() },

      // === b00c0011: Trevor at Stormveil Castle Grafted Throne (Godrick) ===
      { id: "aa000024-0000-0000-0000-000000000000", reviewer_id: "66666666-7777-8888-9999-000000000000", reviewer_type: "customer", target_id: "10c00009-0000-0000-0000-000000000000", target_type: "location", booking_id: "b00c0011-0000-0000-0000-000000000000", rating: 4, body: "Good dungeon. The battlements are properly brutal — two party members went down before we hit the fog gate and had to regroup. The grafting chambers are unsettling in exactly the right way for a location that has a website. Our team took about two and a half hours before we reached the throne room. Would have been faster if we had not missed the side entrance the first time through. The whip is extremely useful here, whatever the briefing says.", created_at: trx.fn.now() },
      { id: "aa000025-0000-0000-0000-000000000000", reviewer_id: "66666666-7777-8888-9999-000000000000", reviewer_type: "customer", target_id: "a1a1a1a1-0000-0000-0000-000000000000", target_type: "provider", booking_id: "b00c0011-0000-0000-0000-000000000000", rating: 4, body: "Godrick knows how to fill a castle. The traps are aggressive but legible — you can read most of them if you are paying attention, which our party learned to do after the third time the floor gave way. The throne room finale is properly theatrical. I have cleared worse, but this one has atmosphere. Four stars.", created_at: trx.fn.now() },
      { id: "aa000026-0000-0000-0000-000000000000", reviewer_id: "a1a1a1a1-0000-0000-0000-000000000000", reviewer_type: "provider", target_id: "66666666-7777-8888-9999-000000000000", target_type: "customer", booking_id: "b00c0011-0000-0000-0000-000000000000", rating: 1, body: "THIS PARTY BROUGHT A WHIP. THE PRE-RAID BRIEFING EXPLICITLY PROHIBITS WHIPS, FLAILS, AND ITEMS WITH EXCESSIVE HORIZONTAL SWING RADIUS. THE BELMONT INDIVIDUAL NODDED DURING THE BRIEFING. I WATCHED HIM NOD. AND THEN HE BROUGHT THE WHIP INTO MY GRAFTED THRONE ROOM AND DESTROYED TWO CHANDELIER INSTALLATIONS I HAVE BEEN CULTIVATING FOR FORTY YEARS. ONE STAR. THE WHIP WAS ALSO VERY EFFECTIVE WHICH ONLY MAKES IT WORSE. ALL WHO OPPOSE ME CRUMBLE EXCEPT APPARENTLY THE ONES WITH WHIPS. ONE STAR.", created_at: trx.fn.now() },

      // === b00c0012: Laios at Moria — Bridge of Khazad-dûm (Balrog) ===
      { id: "aa000027-0000-0000-0000-000000000000", reviewer_id: FIXED_END_USER_ID, reviewer_type: "customer", target_id: "10c00010-0000-0000-0000-000000000000", target_type: "location", booking_id: "b00c0012-0000-0000-0000-000000000000", rating: 5, body: "Khazad-dum is everything I hoped it would be. The domain is ecologically fascinating: our party spotted at least four troll variants, two types of cave-dwelling fungi with extraordinary culinary potential, and what I believe was a warg subspecies I had not previously catalogued. The bridge crossing itself is genuinely spectacular — the chasm depth creates wind effects the whole party felt. We made the crossing with approximately forty seconds on the clock. I may have stopped to examine the fungi. My party has asked me to note that they do not endorse the fungi stop. Five stars.", created_at: trx.fn.now() },
      { id: "aa000028-0000-0000-0000-000000000000", reviewer_id: FIXED_END_USER_ID, reviewer_type: "customer", target_id: "b2b2b2b2-0000-0000-0000-000000000000", target_type: "provider", booking_id: "b00c0012-0000-0000-0000-000000000000", rating: 5, body: "Durin's Bane is a professional. The emergence timing at the bridge was pitch-perfect — our party heard it before we saw it and the sound alone sent our healer up three flights of stairs. Respect for the craft. Also: the fire whip is a remarkable specimen. Is that biological? Magical? Both? I submitted a question about this through the pre-booking FAQ and never heard back. Five stars regardless.", created_at: trx.fn.now() },
      { id: "aa000029-0000-0000-0000-000000000000", reviewer_id: "b2b2b2b2-0000-0000-0000-000000000000", reviewer_type: "provider", target_id: FIXED_END_USER_ID, target_type: "customer", booking_id: "b00c0012-0000-0000-0000-000000000000", rating: 2, body: "The Touden party crossed my bridge in adequate time. I have no complaint regarding their performance. I have a complaint regarding the individual who, while the rest of his party ran for the exit, stopped mid-bridge to crouch and examine the stonework. The bridge was actively collapsing. He was taking notes. On a collapsing bridge above a bottomless chasm while ancient fire incarnate rose from the deep. He also inquired about my dietary habits as he ran. The Balrog has been consulted on many things across the ages. Recipe development is not among them. Two stars.", created_at: trx.fn.now() },

      // === b00c0013: Ciri at Temple of Time — Sacred Grove (Gohma) ===
      { id: "aa000030-0000-0000-0000-000000000000", reviewer_id: "33333333-4444-5555-6666-777777777777", reviewer_type: "customer", target_id: "10c00011-0000-0000-0000-000000000000", target_type: "location", booking_id: "b00c0013-0000-0000-0000-000000000000", rating: 4, body: "The guardians operate with more mechanical complexity than you find in most mid-tier locations — no flat patrol routes. The sanctum sequence required genuine coordination: our party split tasks and still hit the time pressure on the final guardian. The crumbling passages force routing decisions that actually matter. One note: the briefing describes the temple as dormant, which significantly undersells how awake it becomes once you are inside. Adjust expectations accordingly. Four stars.", created_at: trx.fn.now() },
      { id: "aa000031-0000-0000-0000-000000000000", reviewer_id: "33333333-4444-5555-6666-777777777777", reviewer_type: "customer", target_id: "00000000-ffff-0000-ffff-000000000000", target_type: "provider", booking_id: "b00c0013-0000-0000-0000-000000000000", rating: 4, body: "I ran Gohma's Deku Tree location on a previous booking and the Temple of Time is a clear step up in design complexity. Multiple phases, vertical challenge elements, a boss encounter that requires thinking while dodging. The briefing is thorough and accurate, which I appreciate more than most. Would return for the next tier.", created_at: trx.fn.now() },
      { id: "aa000032-0000-0000-0000-000000000000", reviewer_id: "00000000-ffff-0000-ffff-000000000000", reviewer_type: "provider", target_id: "33333333-4444-5555-6666-777777777777", target_type: "customer", booking_id: "b00c0013-0000-0000-0000-000000000000", rating: 5, body: "The silver-haired party completed the guardian sequence without triggering a single corridor alarm — a first for this season. Armogohma reports that the final phase was resolved before the sanctum reached full activation. The party entered at scheduled time, followed every briefing guideline, and did not touch any of the web fixtures. This is the review I always hoped to write. Five stars. The silver-haired one is somewhat unnerving in her competence, but this is a compliment.", created_at: trx.fn.now() },

      // === b00c0014: Navi at Dragon Roost Cavern (Gohma) ===
      { id: "aa000033-0000-0000-0000-000000000000", reviewer_id: "44444444-5555-6666-7777-888888888888", reviewer_type: "customer", target_id: "10c00012-0000-0000-0000-000000000000", target_type: "location", booking_id: "b00c0014-0000-0000-0000-000000000000", rating: 5, body: "VOLCANIC. LAVA. A REAL LAVA CHAMBER. I HAVE NEVER BEEN SO WARM. My party said I was making it worse by narrating everything out loud but I disagree because SOMEONE needed to track the lava cycling and that SOMEONE was me and we CLEARED it. The Gohma encounter at the cavern heart was incredible — fast, technical, and one of our party got launched by the shockwave and SURVIVED and we are still talking about it. Five stars. If you are a fairy: wear something fire-resistant.", created_at: trx.fn.now() },
      { id: "aa000034-0000-0000-0000-000000000000", reviewer_id: "44444444-5555-6666-7777-888888888888", reviewer_type: "customer", target_id: "00000000-ffff-0000-ffff-000000000000", target_type: "provider", booking_id: "b00c0014-0000-0000-0000-000000000000", rating: 5, body: "HEY! Gohma runs Dragon Roost with an energy that matches the location perfectly. Everything moved at exactly the right pace. The lava cycling gave our party real decisions to make and those decisions had real consequences. The Gohma encounter is legitimately scary even when you know it is coming. Especially when you know it is coming. My wings still smell faintly of sulfur. FIVE STARS.", created_at: trx.fn.now() },
      { id: "aa000035-0000-0000-0000-000000000000", reviewer_id: "00000000-ffff-0000-ffff-000000000000", reviewer_type: "provider", target_id: "44444444-5555-6666-7777-888888888888", target_type: "customer", booking_id: "b00c0014-0000-0000-0000-000000000000", rating: 3, body: "The fairy party completed Dragon Roost within the time window, which the egg sacs appreciate. One note: the fairy individual emitted a sustained alerting tone throughout all three lava chambers. This tone was audible from the monitoring station. The lava cycle guardians are calibrated for stealth-compatible noise levels and were visibly confused. The party compensated through speed rather than silence, which is a valid strategy and not expressly prohibited by the briefing. Future parties: silence is optional but our guardians operate better with it. Three stars because the fairy is very loud.", created_at: trx.fn.now() },

      // === b00c0015: Tatl at Stormveil Castle — Grafted Throne (Godrick) ===
      { id: "aa000036-0000-0000-0000-000000000000", reviewer_id: "55555555-6666-7777-8888-999999999999", reviewer_type: "customer", target_id: "10c00009-0000-0000-0000-000000000000", target_type: "location", booking_id: "b00c0015-0000-0000-0000-000000000000", rating: 3, body: "Stormveil is legitimately hard. Our party hit the fog gate six times before we figured out the corridor formation. The battlements are punishing and the grafting chambers are genuinely disturbing in a way I did not expect from a location that has a website. Three stars not because it was bad but because nobody in our party read the full briefing and we made it harder than it needed to be. That is entirely on us. The dungeon itself is well-built.", created_at: trx.fn.now() },
      { id: "aa000037-0000-0000-0000-000000000000", reviewer_id: "55555555-6666-7777-8888-999999999999", reviewer_type: "customer", target_id: "a1a1a1a1-0000-0000-0000-000000000000", target_type: "provider", booking_id: "b00c0015-0000-0000-0000-000000000000", rating: 4, body: "Godrick handles the grafted throne reveal very well — the atmospheric build-up is excellent and he is clearly committed to the bit. Four stars. Docking one for the post-run debrief where he asked each member of our party individually whether they had felt the power of the grafted and would not accept yes as a final answer.", created_at: trx.fn.now() },
      { id: "aa000038-0000-0000-0000-000000000000", reviewer_id: "a1a1a1a1-0000-0000-0000-000000000000", reviewer_type: "provider", target_id: "55555555-6666-7777-8888-999999999999", target_type: "customer", booking_id: "b00c0015-0000-0000-0000-000000000000", rating: 4, body: "THE TATL PARTY READ THE BRIEFING. THE WHOLE BRIEFING. No whips. No flails. No items with excessive horizontal swing radius. They entered the battlements in formation. They navigated the fog gate on the third attempt, which is adequate. One member was briefly launched by a fog gate guardian but rose immediately, which showed spirit. The throne room finale was resolved with appropriate effort. Four stars. This is what ALL parties should aspire to. YOU HEAR ME, BELMONT.", created_at: trx.fn.now() },

      // === b00c0016: Alucard at Undermountain Sargauth (Halaster) ===
      { id: "aa000039-0000-0000-0000-000000000000", reviewer_id: "77777777-8888-9999-0000-111111111111", reviewer_type: "customer", target_id: "10c00004-0000-0000-0000-000000000000", target_type: "location", booking_id: "b00c0016-0000-0000-0000-000000000000", rating: 5, body: "I approach the Sargauth Level having navigated significantly more lethal environs, and I will confess it surprised me. The passages are intelligently designed: width-constrained in ways that prevent the formation strategies that make most dungeons trivial for parties of my experience. The river section near the eastern collapse is genuinely inspired — water, darkness, and a current that demands attention. My party completed it without casualty. Five stars, which I do not give lightly.", created_at: trx.fn.now() },
      { id: "aa000040-0000-0000-0000-000000000000", reviewer_id: "77777777-8888-9999-0000-111111111111", reviewer_type: "customer", target_id: "cccccccc-cccc-cccc-cccc-cccccccccccc", target_type: "provider", booking_id: "b00c0016-0000-0000-0000-000000000000", rating: 3, body: "Halaster materialized twice during our run: once to cackle, and once to adjust a trap our party had already bypassed. The second appearance I found professionally questionable — the hallmark of a dungeon host who cannot resist interfering with a run in progress. The dungeon is excellent. The mad mage needs to trust his own work. Three stars: two for the dungeon itself, one for having the good sense to eventually leave us alone.", created_at: trx.fn.now() },
      { id: "aa000041-0000-0000-0000-000000000000", reviewer_id: "cccccccc-cccc-cccc-cccc-cccccccccccc", reviewer_type: "provider", target_id: "77777777-8888-9999-0000-111111111111", target_type: "customer", booking_id: "b00c0016-0000-0000-0000-000000000000", rating: 4, body: "The pale one does not breathe. I noticed. I recalibrated the gas trap accordingly. He cleared it in twelve seconds anyway. Also he transformed briefly in the river section — I SAW it — into a mist or possibly a wolf, and technically the pre-booking FAQ addresses transformation abilities under special abilities: please disclose, and he disclosed NOTHING. This is a violation. I am docking one star. Four stars total because the transformation was impressive, and he put the collapsing stones back where he found them, which no party has EVER done, and I genuinely appreciated it.", created_at: trx.fn.now() },
    ];
    await trx("review").insert(reviews);
  });

  // Execute file copies only after the transaction commits successfully
  fs.mkdirSync(PROFILE_PICS_DIR, { recursive: true });
  for (const { src, destDir, destPath } of copyJobs) {
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, destPath);
  }
}
