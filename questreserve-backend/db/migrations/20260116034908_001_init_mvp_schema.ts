import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  /* =====================
     CREATE TABLES
  ===================== */

  // ORGANIZATION
  await knex.schema.createTable("organization", (table) => {
    table.uuid("id").primary();
    table.string("name").notNullable();
    table.string("plan").notNullable().defaultTo("FREE");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // ADMIN USER
  await knex.schema.createTable("admin_user", (table) => {
    table.uuid("id").primary();
    table
      .uuid("organization_id")
      .references("id")
      .inTable("organization")
      .onDelete("CASCADE");
    table.string("name").notNullable();
    table.string("email").notNullable().unique();
    table.string("password_hash").notNullable();
    table.string("role").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.index(["organization_id"]);
  });

  // BOOKING LOCATION
  await knex.schema.createTable("booking_location", (table) => {
    table.uuid("id").primary();
    table
      .uuid("organization_id")
      .references("id")
      .inTable("organization")
      .onDelete("CASCADE");
    table.string("name").notNullable();
    table.text("description");
    table.string("difficulty").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.index(["organization_id"]);
  });

  // TIME SLOT
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

  // BOOKING
  await knex.schema.createTable("booking", (table) => {
    table.uuid("id").primary();
    table
      .uuid("time_slot_id")
      .references("id")
      .inTable("time_slot")
      .onDelete("CASCADE");
    table.string("customer_name").notNullable();
    table.string("customer_email").notNullable();
    table.string("status").notNullable().defaultTo("BOOKED");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.index(["time_slot_id"]);
  });

  /* =====================
     ADD CONSTRAINTS FOR ALLOWED VALUES
  ===================== */

  await knex.raw(`
    ALTER TABLE organization
      ADD CONSTRAINT organization_plan_allowed_values_check
      CHECK (plan IN ('FREE','PRO','ENTERPRISE'));

    ALTER TABLE admin_user
      ADD CONSTRAINT admin_user_role_allowed_values_check
      CHECK (role IN ('PLATFORM_ADMIN','ORG_ADMIN','SUPERUSER'));

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
  await knex.schema.dropTableIfExists("admin_user");
  await knex.schema.dropTableIfExists("organization");
}
