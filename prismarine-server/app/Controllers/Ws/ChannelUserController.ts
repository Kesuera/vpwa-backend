import { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import type { ChannelUserRepositoryContract } from '@ioc:Repositories/ChannelUserRepository'
import { inject } from '@adonisjs/core/build/standalone'

@inject(['Repositories/ChannelUserRepository'])
export default class ChannelUserController {
  constructor(private channelUserRepository: ChannelUserRepositoryContract) {}

  public async loadUsers({ params }: WsContextContract) {
    return this.channelUserRepository.getAll(params.name)
  }
}
