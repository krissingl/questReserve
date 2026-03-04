import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provider_status') THEN
        CREATE TYPE provider_status AS ENUM ('ACTIVE', 'SUSPENDED');
      END IF;
    END $$;
  `);

  await knex.schema.alterTable("provider", (table) => {
    table
      .specificType("status", "provider_status")
      .notNullable()
      .defaultTo("ACTIVE");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("provider", (table) => {
    table.dropColumn("status");
  });

  await knex.schema.raw(`DROP TYPE IF EXISTS provider_status;`);
}
