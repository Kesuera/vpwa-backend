import type {
  ChannelRepositoryContract,
  SerializedChannel,
} from '@ioc:Repositories/ChannelRepository'
import Channel from 'App/Models/Channel'
import { ChannelType } from 'Contracts/enums'

export default class ChannelRepository implements ChannelRepositoryContract {
  public async create(name: string, userId: number, type: ChannelType): Promise<SerializedChannel> {
    const channel = await Channel.create({ adminId: userId, name, type })
    return channel.serialize() as SerializedChannel
  }
}
