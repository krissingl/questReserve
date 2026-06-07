import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("message", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("booking_id").notNullable().references("id").inTable("booking").onDelete("CASCADE");
    table.uuid("sender_id").notNullable();
    table.string("sender_type").notNullable().checkIn(["provider", "customer"]);
    table.text("body").notNullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("read_at", { useTz: true }).nullable();
    table.index(["booking_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("message");
}
