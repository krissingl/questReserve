import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    // Clear tables in dependency order
    await trx('booking').del();
    await trx('time_slot').del();
    await trx('booking_location').del();
    await trx('admin_user').del();
    await trx('organization').del();

    // --- Organizations ---
    const organizations = await trx('organization')
      .insert([
        { name: 'Castle Ravenloft', status: 'active', created_at: trx.fn.now(), updated_at: trx.fn.now() },
        { name: 'The Misty Mountains', status: 'active', created_at: trx.fn.now(), updated_at: trx.fn.now() },
        { name: 'Mad Mage Tower', status: 'inactive', created_at: trx.fn.now(), updated_at: trx.fn.now() },
      ])
      .returning('*');

    // --- Admin Users ---
    const adminUsers = await trx('admin_user')
      .insert([
        { organization_id: organizations[0].id, email: 'admin1@org1.test', role: 'owner', created_at: trx.fn.now(), updated_at: trx.fn.now() },
        { organization_id: organizations[1].id, email: 'admin2@org2.test', role: 'owner', created_at: trx.fn.now(), updated_at: trx.fn.now() },
        { organization_id: organizations[2].id, email: 'admin3@org3.test', role: 'owner', created_at: trx.fn.now(), updated_at: trx.fn.now() },
      ])
      .returning('*');

    // --- Booking Locations ---
    const locations = await trx('booking_location')
      .insert([
        { organization_id: organizations[0].id, name: 'loc1', timezone: 'UTC', created_at: trx.fn.now(), updated_at: trx.fn.now() },
        { organization_id: organizations[1].id, name: 'loc2', timezone: 'UTC', created_at: trx.fn.now(), updated_at: trx.fn.now() },
        { organization_id: organizations[2].id, name: 'loc3', timezone: 'UTC', created_at: trx.fn.now(), updated_at: trx.fn.now() },
      ])
      .returning('*');

    // --- Time Slots ---
    const timeSlots = await trx('time_slot')
      .insert([
        { booking_location_id: locations[0].id, start_time: '2026-01-20T18:00:00Z', end_time: '2026-01-20T20:00:00Z', status: 'available' },
        { booking_location_id: locations[1].id, start_time: '2026-01-21T18:00:00Z', end_time: '2026-01-21T20:00:00Z', status: 'available' },
        { booking_location_id: locations[2].id, start_time: '2026-01-22T18:00:00Z', end_time: '2026-01-22T20:00:00Z', status: 'available' },
      ])
      .returning('*');

    // --- Bookings ---
    await trx('booking')
      .insert([
        { organization_id: organizations[0].id, time_slot_id: timeSlots[0].id, party_name: 'party1', party_size: 4, status: 'confirmed', created_at: trx.fn.now(), updated_at: trx.fn.now() },
        { organization_id: organizations[1].id, time_slot_id: timeSlots[1].id, party_name: 'party2', party_size: 5, status: 'confirmed', created_at: trx.fn.now(), updated_at: trx.fn.now() },
        { organization_id: organizations[2].id, time_slot_id: timeSlots[2].id, party_name: 'party3', party_size: 3, status: 'pending', created_at: trx.fn.now(), updated_at: trx.fn.now() },
      ]);
  });
}
