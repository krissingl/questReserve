import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  /* =====================
     CREATE TABLES
  ===================== */

  // --- PROVIDERS / ORGANIZATIONS ---
  await knex.schema.createTable("provider", (table) => {
    table.uuid("id").primary();
    table.string("name").notNullable();
    table.string("plan").notNullable().defaultTo("FREE"); // FREE, STANDARD, PREMIUM
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // --- ADMIN USERS (platform staff / wizards) ---
  await knex.schema.createTable("admin_user", (table) => {
    table.uuid("id").primary();
    table.string("name").notNullable();
    table.string("email").notNullable().unique();
    table.string("password_hash").notNullable();
    table.string("role").notNullable(); // PLATFORM_ADMIN, CLIENT_SUCCESS, SUPERUSER
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // --- END USERS / CUSTOMERS ---
  await knex.schema.createTable("end_user", (table) => {
    table.uuid("id").primary();
    table.string("name").notNullable();
    table.string("email").notNullable().unique();
    table.string("password_hash").notNullable();
    table.string("role").notNullable().defaultTo("REGULAR"); // REGULAR, PREMIERE, CORPORATE, RESTRICTED
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // --- BOOKING LOCATIONS ---
  await knex.schema.createTable("booking_location", (table) => {
    table.uuid("id").primary();
    table
      .uuid("provider_id")
      .references("id")
      .inTable("provider")
      .onDelete("CASCADE");
    table.string("name").notNullable();
    table.text("description");
    table.string("difficulty").notNullable(); // EASY, MEDIUM, HARD, LEGENDARY
    table.text("cancellation_policy");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.index(["provider_id"]);
  });

  // --- TIME SLOTS ---
  await knex.schema.createTable("time_slot", (table) => {
    table.uuid("id").primary();
    table
      .uuid("booking_location_id")
      .references("id")
      .inTable("booking_location")
      .onDelete("CASCADE");
    table.timestamp("start_time").notNullable();
    table.timestamp("end_time").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.index(["booking_location_id"]);
  });

  // --- BOOKINGS ---
  await knex.schema.createTable("booking", (table) => {
    table.uuid("id").primary();
    table
      .uuid("time_slot_id")
      .references("id")
      .inTable("time_slot")
      .onDelete("CASCADE");
    table
      .uuid("end_user_id")
      .references("id")
      .inTable("end_user")
      .onDelete("CASCADE");
    table.string("status").notNullable().defaultTo("BOOKED"); // BOOKED, CANCELLED
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.index(["time_slot_id"]);
    table.index(["end_user_id"]);
  });

  /* =====================
     ENUM-LIKE CONSTRAINTS
  ===================== */

  await knex.raw(`
    ALTER TABLE provider
      ADD CONSTRAINT provider_plan_allowed_values_check
      CHECK (plan IN ('FREE','STANDARD','PREMIUM'));

    ALTER TABLE admin_user
      ADD CONSTRAINT admin_user_role_allowed_values_check
      CHECK (role IN ('PLATFORM_ADMIN','CLIENT_SUCCESS','SUPERUSER'));

    ALTER TABLE end_user
      ADD CONSTRAINT end_user_role_allowed_values_check
      CHECK (role IN ('REGULAR','PREMIERE','CORPORATE','RESTRICTED'));

    ALTER TABLE booking_location
      ADD CONSTRAINT booking_location_difficulty_allowed_values_check
      CHECK (difficulty IN ('EASY','MEDIUM','HARD','LEGENDARY'));

    ALTER TABLE booking
      ADD CONSTRAINT booking_status_allowed_values_check
      CHECK (status IN ('BOOKED','CANCELLED'));
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("booking");
  await knex.schema.dropTableIfExists("time_slot");
  await knex.schema.dropTableIfExists("booking_location");
  await knex.schema.dropTableIfExists("end_user");
  await knex.schema.dropTableIfExists("admin_user");
  await knex.schema.dropTableIfExists("provider");
}
