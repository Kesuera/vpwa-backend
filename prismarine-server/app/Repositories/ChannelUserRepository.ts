import type {
  ChannelUserRepositoryContract,
  SerializedChannelUser,
} from '@ioc:Repositories/ChannelUserRepository'
import Channel from 'App/Models/Channel'

export default class ChannelRepository implements ChannelUserRepositoryContract {
  public async getAll(channelName: string): Promise<SerializedChannelUser[]> {
    const channel = await Channel.query()
      .where('name', channelName)
      .preload('users', (usersQuery) => usersQuery.whereNotNullPivot('joined_at'))
      .firstOrFail()

    return channel.users.map((user) => user.serialize() as SerializedChannelUser)
  }
}
