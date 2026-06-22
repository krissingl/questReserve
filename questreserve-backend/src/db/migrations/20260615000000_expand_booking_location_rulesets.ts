import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("booking_location", (table) => {
    // Core specs
    table.integer("party_size_min").nullable();
    table.integer("party_size_max").nullable();
    table.integer("level_range_min").nullable();
    table.integer("level_range_max").nullable();

    // Environment
    table.text("landscape_type").nullable();
    table.text("setting").nullable();
    table.specificType("environment_tags", "text[]").nullable();

    // Restrictions
    table.specificType("magic_restrictions", "text[]").nullable();
    table.specificType("class_restrictions", "text[]").nullable();
    table.specificType("race_restrictions", "text[]").nullable();
    table.specificType("faction_restrictions", "text[]").nullable();
    table.specificType("party_composition_tags", "text[]").nullable();
    table.specificType("physical_access", "text[]").nullable();
    table.boolean("mount_permitted").notNullable().defaultTo(false);
    table.boolean("familiar_permitted").notNullable().defaultTo(false);
    table.boolean("solo_permitted").notNullable().defaultTo(false);
    table.text("booking_type").nullable();

    // Tone & content
    table.specificType("tone_tags", "text[]").nullable();
    table.integer("gore_level").nullable();
    table.boolean("non_lethal_mode").notNullable().defaultTo(false);
    table.boolean("permadeath_risk").notNullable().defaultTo(false);
    table.text("primary_focus").nullable();
    table.boolean("boss_encounter").notNullable().defaultTo(false);
    table.boolean("pvp_permitted").notNullable().defaultTo(false);
    table.boolean("scouting_permitted").notNullable().defaultTo(false);

    // Run logistics
    table.integer("run_time_minutes").nullable();
    table.integer("reset_time_hours").nullable();
    table.integer("time_limit_minutes").nullable();

    // Amenities & loot
    table.boolean("has_safe_room").notNullable().defaultTo(false);
    table.boolean("has_merchant").notNullable().defaultTo(false);
    table.boolean("equipment_provided").notNullable().defaultTo(false);
    table.boolean("guide_provided").notNullable().defaultTo(false);
    table.text("loot_type").nullable();
    table.boolean("boss_loot").notNullable().defaultTo(false);
    table.boolean("unique_item_chance").notNullable().defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("booking_location", (table) => {
    // Core specs
    table.dropColumn("party_size_min");
    table.dropColumn("party_size_max");
    table.dropColumn("level_range_min");
    table.dropColumn("level_range_max");

    // Environment
    table.dropColumn("landscape_type");
    table.dropColumn("setting");
    table.dropColumn("environment_tags");

    // Restrictions
    table.dropColumn("magic_restrictions");
    table.dropColumn("class_restrictions");
    table.dropColumn("race_restrictions");
    table.dropColumn("faction_restrictions");
    table.dropColumn("party_composition_tags");
    table.dropColumn("physical_access");
    table.dropColumn("mount_permitted");
    table.dropColumn("familiar_permitted");
    table.dropColumn("solo_permitted");
    table.dropColumn("booking_type");

    // Tone & content
    table.dropColumn("tone_tags");
    table.dropColumn("gore_level");
    table.dropColumn("non_lethal_mode");
    table.dropColumn("permadeath_risk");
    table.dropColumn("primary_focus");
    table.dropColumn("boss_encounter");
    table.dropColumn("pvp_permitted");
    table.dropColumn("scouting_permitted");

    // Run logistics
    table.dropColumn("run_time_minutes");
    table.dropColumn("reset_time_hours");
    table.dropColumn("time_limit_minutes");

    // Amenities & loot
    table.dropColumn("has_safe_room");
    table.dropColumn("has_merchant");
    table.dropColumn("equipment_provided");
    table.dropColumn("guide_provided");
    table.dropColumn("loot_type");
    table.dropColumn("boss_loot");
    table.dropColumn("unique_item_chance");
  });
}
