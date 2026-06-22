import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(
    `ALTER TABLE booking_location ALTER COLUMN primary_focus TYPE integer USING NULL`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw(
    `ALTER TABLE booking_location ALTER COLUMN primary_focus TYPE text USING NULL`
  );
}
