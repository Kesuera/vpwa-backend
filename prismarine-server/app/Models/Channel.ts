import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Message from 'App/Models/Message'
import ChannelUser from 'App/Models/ChannelUser'
import Kick from 'App/Models/Kick'
import { ChannelType } from 'Contracts/enums'

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public type: ChannelType

  @column()
  public numberOfUsers: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Message, {
    foreignKey: 'channelId',
  })
  public messages: HasMany<typeof Message>

  @hasMany(() => ChannelUser, {
    foreignKey: 'channelId',
  })
  public users: HasMany<typeof ChannelUser>

  @hasMany(() => Kick, {
    foreignKey: 'channelId',
  })
  public kicks: HasMany<typeof Kick>
}
