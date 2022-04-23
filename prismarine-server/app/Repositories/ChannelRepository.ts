import type {
  ChannelRepositoryContract,
  SerializedChannel,
  SerializedUser,
} from '@ioc:Repositories/ChannelRepository'
import Channel from 'App/Models/Channel'
import { ChannelType } from 'Contracts/enums'

export default class ChannelRepository implements ChannelRepositoryContract {
  public async create(name: string, userId: number, type: ChannelType): Promise<SerializedChannel> {
    const channel = await Channel.create({ adminId: userId, name, type })
    return channel.serialize() as SerializedChannel
  }
  public async getUsers(channelName: string): Promise<SerializedUser[]> {
    const channel = await Channel.query()
      .where('name', channelName)
      .preload('users', (usersQuery) => usersQuery.whereNotNullPivot('joined_at'))
      .firstOrFail()

    return channel.users.map((user) => user.serialize() as SerializedUser)
  }
}
