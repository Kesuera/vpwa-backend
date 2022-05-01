import type {
  ChannelUserRepositoryContract,
  SerializedChannelUser,
} from '@ioc:Repositories/ChannelUserRepository'
import { InviteRepositoryContract } from '@ioc:Repositories/InviteRepository'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

export default class InviteRepository implements InviteRepositoryContract {
  public async invite(channelName: string, username: string): Promise<User> {
    const channel = await Channel.findByOrFail('name', channelName)
    const user = await User.findByOrFail('username', username)
    await channel.related('users').attach({
      [user.id]: {
        joined_at: null,
      },
    })
    return user
  }
}
