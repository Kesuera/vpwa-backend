import { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import type { ChannelUserRepositoryContract } from '@ioc:Repositories/ChannelUserRepository'
import { inject } from '@adonisjs/core/build/standalone'
import Channel from 'App/Models/Channel'

@inject(['Repositories/ChannelUserRepository'])
export default class ChannelUserController {
  constructor(private channelUserRepository: ChannelUserRepositoryContract) {}

  public async leaveChannel({ params, auth, socket }: WsContextContract) {
    const channel = await Channel.findByOrFail('name', params.name)

    // user is admin
    if (auth.user!.id === channel.adminId) {
      await channel.delete()
      socket.broadcast.emit('channel:delete', params.name)
    }
    // user is not admin
    else {
      await auth.user?.related('channels').detach([channel.id])
      socket.broadcast.emit('user:leave', auth.user!.id)
    }
  }

  public async loadUsers({ params }: WsContextContract) {
    return this.channelUserRepository.getAll(params.name)
  }
}
