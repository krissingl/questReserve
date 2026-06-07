import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("provider", (table) => {
    table.string("profile_picture_url").nullable();
  });
  await knex.schema.alterTable("end_user", (table) => {
    table.string("profile_picture_url").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("provider", (table) => {
    table.dropColumn("profile_picture_url");
  });
  await knex.schema.alterTable("end_user", (table) => {
    table.dropColumn("profile_picture_url");
  });
}
