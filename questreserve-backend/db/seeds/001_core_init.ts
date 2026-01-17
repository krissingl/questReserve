import { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";

export async function seed(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    /* =====================
       1️⃣ ADMIN USERS
    ===================== */
    const adminUsers = [
      {
        id: uuidv4(),
        first_name: "The",
        last_name: "Wizard",
        email: "the_wizard@wiztower.com",
        password_hash: "hashed_pw1",
        role: "PLATFORM_ADMIN",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: uuidv4(),
        first_name: "Gandalf",
        last_name: "the Gray",
        email: "gandalf_the_gray@wiztower.com",
        password_hash: "hashed_pw2",
        role: "CLIENT_SUCCESS",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: uuidv4(),
        first_name: "Tom",
        last_name: "Bombadil",
        email: "tom_bombadil@wiztower.com",
        password_hash: "hashed_pw3",
        role: "SUPERUSER",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
    ];
    await trx("admin_user").insert(adminUsers);

    /* =====================
       2️⃣ PROVIDERS
    ===================== */
    const providers = [
      {
        id: uuidv4(),
        first_name: "Smaug",
        last_name: "the Great",
        email: "smaugthegreat123@yohaa.com",
        password_hash: "hashed_pw1",
        organization_name: null,
        plan: "FREE",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: uuidv4(),
        first_name: "Halaster",
        last_name: "Blackcloak",
        email: "madmage@undermtn.com",
        password_hash: "hashed_pw2",
        organization_name: "Undermountain Corp",
        plan: "STANDARD",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: uuidv4(),
        first_name: "Strahd",
        last_name: "von Zarovich",
        email: "typeO@barovia.gov",
        password_hash: "hashed_pw3",
        organization_name: "Barovia Gov",
        plan: "PREMIUM",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
    ];
    await trx("provider").insert(providers);

    /* =====================
       3️⃣ END USERS
    ===================== */
    const endUsers = [
      {
        id: uuidv4(),
        first_name: "Laios",
        last_name: "Touden",
        email: "monsterslover23@yohaa.com",
        password_hash: "hashed_pw1",
        role: "REGULAR",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: uuidv4(),
        first_name: "Bilbo",
        last_name: "Baggins",
        email: "underhill111@aoi.com",
        password_hash: "hashed_pw2",
        role: "PREMIERE",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: uuidv4(),
        first_name: "Geralt",
        last_name: "of Rivia",
        email: "geralt_riv@witcherscorp.com",
        password_hash: "hashed_pw3",
        role: "CORPORATE",
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
    ];
    await trx("end_user").insert(endUsers);

    /* =====================
       4️⃣ BOOKING LOCATIONS
    ===================== */
    const bookingLocations = providers.map((provider, idx) => ({
      id: uuidv4(),
      provider_id: provider.id,
      name: `location${idx + 1}`,
      description: `Description for location${idx + 1}`,
      difficulty: idx % 2 === 0 ? "EASY" : "MEDIUM",
      cancellation_policy: "Standard cancellation rules",
      created_at: trx.fn.now(),
      updated_at: trx.fn.now(),
    }));
    await trx("booking_location").insert(bookingLocations);

    /* =====================
       5️⃣ TIME SLOTS
    ===================== */
    const timeSlots = bookingLocations.flatMap((location, idx) => [
      {
        id: uuidv4(),
        booking_location_id: location.id,
        start_time: new Date(Date.now() + idx * 3600 * 1000),
        end_time: new Date(Date.now() + (idx + 1) * 3600 * 1000),
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
      {
        id: uuidv4(),
        booking_location_id: location.id,
        start_time: new Date(Date.now() + (idx + 2) * 3600 * 1000),
        end_time: new Date(Date.now() + (idx + 3) * 3600 * 1000),
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      },
    ]);
    await trx("time_slot").insert(timeSlots);

    /* =====================
       6️⃣ BOOKINGS
    ===================== */
    const bookings = endUsers.flatMap((user, idx) => {
      const slot = timeSlots[idx % timeSlots.length];
      return [
        {
          id: uuidv4(),
          time_slot_id: slot.id,
          end_user_id: user.id,
          status: "BOOKED",
          created_at: trx.fn.now(),
          updated_at: trx.fn.now(),
        },
      ];
    });
    await trx("booking").insert(bookings);
  });
}
