import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import ChannelUser from 'App/Models/ChannelUser'
import Message from 'App/Models/Message'
import Kick from 'App/Models/Kick'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public username: string

  @column()
  public email: string

  @column()
  public fullname: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken?: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @hasMany(() => Message, {
    foreignKey: 'sentBy',
  })
  public sentMessages: HasMany<typeof Message>

  @hasMany(() => ChannelUser, {
    foreignKey: 'userId',
  })
  public channels: HasMany<typeof ChannelUser>

  @hasMany(() => Kick, {
    foreignKey: 'kickedBy',
  })
  public sentKicks: HasMany<typeof Kick>

  @hasMany(() => Kick, {
    foreignKey: 'kickedUserId',
  })
  public receivedKicks: HasMany<typeof Kick>
}
