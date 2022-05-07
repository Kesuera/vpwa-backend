import { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import type { ChannelUserRepositoryContract } from '@ioc:Repositories/ChannelUserRepository'
import { inject } from '@adonisjs/core/build/standalone'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

@inject(['Repositories/ChannelUserRepository'])
export default class ChannelUserController {
  constructor(private channelUserRepository: ChannelUserRepositoryContract) {}

  public async onConnected({ socket, auth }: WsContextContract) {
    socket.broadcast.emit('user', auth.user)
  }

  public async leaveChannel({ params, auth, socket }: WsContextContract) {
    const channel = await Channel.findByOrFail('name', params.name)
    // user is admin
    if (auth.user!.id === channel.adminId) {
      await channel.delete()
      socket.broadcast.emit('channel:delete')
    }
    // user is not admin
    else {
      const channelUser = await auth
        .user!.related('channels')
        .pivotQuery()
        .where('channel_id', channel.id)
        .firstOrFail()

      if (channelUser.is_banned) {
        return
      }

      await auth.user!.related('channels').detach([channel.id])
      channel.numberOfUsers--
      channel.save()
      socket.broadcast.emit('user:leave', auth.user!.id)
    }
  }

  public async loadUsers({ params }: WsContextContract) {
    return this.channelUserRepository.getAll(params.name)
  }

  public async kickUser({ params, auth, socket }: WsContextContract, username: string) {
    const channel = await Channel.findByOrFail('name', params.name)
    const user = await User.findByOrFail('username', username)

    await user.related('receivedKicks').create({
      kickedBy: auth.user!.id,
      channelId: channel.id,
    })
    // user is admin
    if (auth.user!.id === channel.adminId) {
      await user.related('channels').sync(
        {
          [channel.id]: {
            joined_at: null,
            is_banned: true,
          },
        },
        false
      )
      channel.numberOfUsers--
      channel.save()
      socket.nsp.emit('user:kick', user.id)
    }
    // user is not admin
    else {
      const count = (
        await user.related('receivedKicks').query().where('channelId', channel.id).count('*')
      )[0].$extras.count
      if (Number(count) === 3) {
        await user.related('channels').sync(
          {
            [channel.id]: {
              joined_at: null,
              is_banned: true,
            },
          },
          false
        )
        channel.numberOfUsers--
        channel.save()
        socket.nsp.emit('user:kick', user.id)
      }
    }
  }

  public async revoke({ params, auth, socket }: WsContextContract, username: string) {
    const channel = await Channel.query()
      .where('name', params.name)
      .where('adminId', auth.user!.id)
      .firstOrFail()
    const user = await User.findByOrFail('username', username)
    await user.related('channels').sync(
      {
        [channel.id]: {
          joined_at: null,
          is_banned: true,
        },
      },
      false
    )
    channel.numberOfUsers--
    channel.save()
    socket.nsp.emit('user:revoke', user.id)
  }
}
