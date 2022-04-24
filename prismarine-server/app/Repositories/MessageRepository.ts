import type {
  MessageRepositoryContract,
  SerializedMessage,
} from '@ioc:Repositories/MessageRepository'
import Channel from 'App/Models/Channel'

export default class MessageRepository implements MessageRepositoryContract {
  public async firstLoad(channelName: string): Promise<SerializedMessage[]> {
    const channel = await Channel.query()
      .where('name', channelName)
      .preload('messages', (messagesQuery) =>
        messagesQuery.orderBy('createdAt', 'desc').limit(20).preload('author')
      )
      .firstOrFail()
    channel.messages.reverse()
    return channel.messages.map((message) => message.serialize() as SerializedMessage)
  }

  public async create(
    channelName: string,
    userId: number,
    content: string
  ): Promise<SerializedMessage> {
    const channel = await Channel.findByOrFail('name', channelName)
    const message = await channel.related('messages').create({ sentBy: userId, content })
    await message.load('author')

    return message.serialize() as SerializedMessage
  }
}
