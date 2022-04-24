import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateChannelValidator from 'App/Validators/CreateChannelValidator'
import { DateTime } from 'luxon'
import Channel from 'App/Models/Channel'
import { SerializedMessage } from '@ioc:Repositories/MessageRepository'

export default class ChannelController {
  async createChannel({ auth, request }: HttpContextContract) {
    // if invalid, exception
    const data = await request.validate(CreateChannelValidator)
    const channel = await Channel.create({
      ...data,
      adminId: auth.user!.id,
    })
    await auth.user!.related('channels').attach({
      [channel.id]: {
        joined_at: DateTime.now(),
      },
    })
    return channel
  }

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
