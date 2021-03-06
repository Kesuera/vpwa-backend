import { DateTime } from 'luxon'
import { BaseModel, column, BelongsTo, belongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Channel from 'App/Models/Channel'

export default class Kick extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public kickedUserId: number

  @column()
  public kickedBy: number

  @column()
  public channelId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'kickedUserId',
  })
  public receiver: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'kickedBy',
  })
  public sender: BelongsTo<typeof User>

  @belongsTo(() => Channel, {
    foreignKey: 'channelId',
  })
  public channel: BelongsTo<typeof Channel>
}
