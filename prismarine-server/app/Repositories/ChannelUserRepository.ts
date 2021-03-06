import type {
  ChannelUserRepositoryContract,
  SerializedChannelUser,
} from '@ioc:Repositories/ChannelUserRepository'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

export default class ChannelRepository implements ChannelUserRepositoryContract {
  public async getAll(channelName: string): Promise<SerializedChannelUser[]> {
    const channel = await Channel.query()
      .where('name', channelName)
      .preload('users', (usersQuery) =>
        usersQuery.whereNotNullPivot('joined_at').orderBy('fullname'.toLowerCase(), 'asc')
      )
      .firstOrFail()

    return channel.users.map((user) => user.serialize() as SerializedChannelUser)
  }
}
