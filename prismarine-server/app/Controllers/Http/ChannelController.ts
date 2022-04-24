import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateChannelValidator from 'App/Validators/CreateChannelValidator'
import { DateTime } from 'luxon'
import Channel from 'App/Models/Channel'

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
}
