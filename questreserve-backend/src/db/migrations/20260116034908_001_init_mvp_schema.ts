import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {

  // ADMIN USERS
  await knex.schema.createTable("admin_user", (table) => {
    table.uuid("id").primary();
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.string("email").notNullable().unique();
    table.string("password_hash").notNullable();
    table.enu("role", ["PLATFORM_ADMIN", "CLIENT_SUCCESS", "SUPERUSER"]).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // PROVIDERS
  await knex.schema.createTable("provider", (table) => {
    table.uuid("id").primary();
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.string("email").notNullable().unique();
    table.string("password_hash").notNullable();
    table.string("organization_name");
    table.enu("plan", ["FREE", "STANDARD", "PREMIUM"]).notNullable().defaultTo("FREE");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // END USERS
  await knex.schema.createTable("end_user", (table) => {
    table.uuid("id").primary();
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.string("email").notNullable().unique();
    table.string("password_hash").notNullable();
    table.enu("role", ["REGULAR", "PREMIERE", "CORPORATE", "RESTRICTED"]).notNullable().defaultTo("REGULAR");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // BOOKING LOCATIONS
  await knex.schema.createTable("booking_location", (table) => {
    table.uuid("id").primary();
    table.uuid("provider_id").references("id").inTable("provider").onDelete("CASCADE");
    table.string("name").notNullable();
    table.text("description");
    table.enu("difficulty", ["EASY", "MEDIUM", "HARD", "LEGENDARY"]).notNullable();
    table.string("cancellation_policy").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.index(["provider_id"]);
  });

  // TIME SLOTS
  await knex.schema.createTable("time_slot", (table) => {
    table.uuid("id").primary();
    table.uuid("booking_location_id").references("id").inTable("booking_location").onDelete("CASCADE");
    table.timestamp("start_time").notNullable();
    table.timestamp("end_time").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.index(["booking_location_id"]);
  });

  // BOOKINGS
  await knex.schema.createTable("booking", (table) => {
    table.uuid("id").primary();
    table.uuid("time_slot_id").references("id").inTable("time_slot").onDelete("CASCADE");
    table.uuid("end_user_id").references("id").inTable("end_user").onDelete("CASCADE");
    table.enu("status", ["BOOKED", "CANCELLED"]).notNullable().defaultTo("BOOKED");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.index(["time_slot_id"]);
    table.index(["end_user_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("booking");
  await knex.schema.dropTableIfExists("time_slot");
  await knex.schema.dropTableIfExists("booking_location");
  await knex.schema.dropTableIfExists("end_user");
  await knex.schema.dropTableIfExists("provider");
  await knex.schema.dropTableIfExists("admin_user");
}
