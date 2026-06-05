import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('provider', (table) => {
    table.text('bio').nullable();
  });

  await knex.schema.alterTable('end_user', (table) => {
    table.text('bio').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('provider', (table) => {
    table.dropColumn('bio');
  });

  await knex.schema.alterTable('end_user', (table) => {
    table.dropColumn('bio');
  });
}
