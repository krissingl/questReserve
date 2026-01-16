import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  /* =====================
     ENUM DEFINITIONS
  ===================== */

  await knex.raw(`
    CREATE TYPE organization_plan_enum AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
    CREATE TYPE admin_user_role_enum AS ENUM ('PLATFORM_ADMIN', 'ORG_ADMIN', 'SUPERUSER');
    CREATE TYPE booking_location_difficulty_enum AS ENUM ('EASY', 'MEDIUM', 'HARD', 'LEGENDARY');
    CREATE TYPE booking_status_enum AS ENUM ('BOOKED', 'CANCELLED');
  `);

  /* =====================
     ORGANIZATION (TENANT)
  ===================== */

  await knex.schema.createTable("organization", (table) => {
    table.uuid("id").primary();
    table.string("name").notNullable();

    table
      .enu("plan", null, {
        useNative: true,
        enumName: "organization_plan_enum",
      })
      .notNullable()
      .defaultTo("FREE");

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  /* =====================
     ADMIN USER
  ===================== */

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

    table
      .enu("role", null, {
        useNative: true,
        enumName: "admin_user_role_enum",
      })
      .notNullable();

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["organization_id"]);
  });

  /* =====================
     BOOKING LOCATION
  ===================== */

  await knex.schema.createTable("booking_location", (table) => {
    table.uuid("id").primary();

    table
      .uuid("organization_id")
      .references("id")
      .inTable("organization")
      .onDelete("CASCADE");

    table.string("name").notNullable();
    table.text("description");

    table
      .enu("difficulty", null, {
        useNative: true,
        enumName: "booking_location_difficulty_enum",
      })
      .notNullable();

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["organization_id"]);
  });

  /* =====================
     TIME SLOT
  ===================== */

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

  /* =====================
     BOOKING
  ===================== */

  await knex.schema.createTable("booking", (table) => {
    table.uuid("id").primary();

    table
      .uuid("time_slot_id")
      .references("id")
      .inTable("time_slot")
      .onDelete("CASCADE");

    table.string("customer_name").notNullable();
    table.string("customer_email").notNullable();

    table
      .enu("status", null, {
        useNative: true,
        enumName: "booking_status_enum",
      })
      .notNullable()
      .defaultTo("BOOKED");

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["time_slot_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("booking");
  await knex.schema.dropTableIfExists("time_slot");
  await knex.schema.dropTableIfExists("booking_location");
  await knex.schema.dropTableIfExists("admin_user");
  await knex.schema.dropTableIfExists("organization");

  await knex.raw(`
    DROP TYPE IF EXISTS booking_status_enum;
    DROP TYPE IF EXISTS booking_location_difficulty_enum;
    DROP TYPE IF EXISTS admin_user_role_enum;
    DROP TYPE IF EXISTS organization_plan_enum;
  `);
}
