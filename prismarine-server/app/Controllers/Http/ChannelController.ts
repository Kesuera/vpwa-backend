import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import ChannelUser from 'App/Models/ChannelUser'
import CreateChannelValidator from 'App/Validators/CreateChannelValidator'
import { DateTime } from 'luxon'

export default class ChannelController {
  async createChannel({ auth, request }: HttpContextContract) {
    // if invalid, exception
    const channelData = await request.validate(CreateChannelValidator)
    const channel = await Channel.create(channelData)
    const channelUserData = {
      userId: auth.user!.id,
      channelId: channel.id,
      joinedAt: DateTime.now(),
      isAdmin: true,
    }
    await ChannelUser.create(channelUserData)
    return channel
  }
}
