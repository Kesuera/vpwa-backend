import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import type { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
import { inject } from '@adonisjs/core/build/standalone'
import CreateChannelValidator from 'App/Validators/CreateChannelValidator'
import { DateTime } from 'luxon'

@inject(['Repositories/ChannelRepository'])
export default class ChannelController {
  constructor(private channelRepository: ChannelRepositoryContract) {}

  async createChannel({ auth, request }: HttpContextContract) {
    // if invalid, exception
    const data = await request.validate(CreateChannelValidator)
    const channel = await this.channelRepository.create(data.name, auth.user!.id, data.type)
    await auth.user!.related('channels').attach({
      [channel.id]: {
        joined_at: DateTime.now(),
      },
    })
    return channel
  }
}
