import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import { SerializedMessage } from '@ioc:Repositories/MessageRepository'

export default class ChannelController {
  async loadMore({ params }: HttpContextContract) {
    const channel = await Channel.query()
      .where('name', params.name)
      .preload('messages', (messagesQuery) =>
        messagesQuery
          .orderBy('createdAt', 'desc')
          .offset(params.currentNumber)
          .limit(20)
          .preload('author')
      )
      .firstOrFail()
    channel.messages.reverse()
    return channel.messages.map((message) => message.serialize() as SerializedMessage)
  }
}
