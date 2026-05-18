import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('location_images', (table) => {
    table.uuid('id').primary();
    table
      .uuid('booking_location_id')
      .notNullable()
      .references('id')
      .inTable('booking_location')
      .onDelete('CASCADE');
    table.string('image_url').notNullable();
    table.integer('display_order').notNullable().defaultTo(0);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('location_images');
}
