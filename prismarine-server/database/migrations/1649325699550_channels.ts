import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { ChannelType } from 'Contracts/enums'

export default class Channels extends BaseSchema {
  protected tableName = 'channels'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name', 30).notNullable().unique()
      table.enum('type', Object.values(ChannelType)).notNullable()
      table.string('number_of_users').notNullable().defaultTo(1)

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
