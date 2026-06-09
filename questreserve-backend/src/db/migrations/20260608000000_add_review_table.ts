import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("review", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("reviewer_id").notNullable();
    table.string("reviewer_type").notNullable().checkIn(["provider", "customer"]);
    table.uuid("target_id").notNullable();
    table.string("target_type").notNullable().checkIn(["provider", "customer", "location"]);
    table.uuid("booking_id").notNullable().references("id").inTable("booking").onDelete("CASCADE");
    table.integer("rating").notNullable().checkBetween([1, 5]);
    table.text("body").nullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.unique(["reviewer_id", "target_id", "target_type", "booking_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("review");
}
