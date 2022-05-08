import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import User from 'App/Models/User'
import { ChannelType, UserStatus } from 'Contracts/enums'
import Channel from 'App/Models/Channel'
import { DateTime } from 'luxon'

export default class ActivityController {
  private getUserRoom(user: User): string {
    return `user:${user.id}`
  }

  public async onConnected({ socket, auth, logger }: WsContextContract) {
    // all connections for the same authenticated user will be in the room
    const room = this.getUserRoom(auth.user!)
    const userSockets = await socket.in(room).allSockets()

    // this is first connection for given user
    if (userSockets.size === 0) {
      socket.broadcast.emit('user:online', auth.user)
    }

    // add this socket to user room
    socket.join(room)
    // add userId to data shared between Socket.IO servers
    // https://socket.io/docs/v4/server-api/#namespacefetchsockets
    socket.data.userId = auth.user!.id

    // const allSockets = await socket.nsp.except(room).fetchSockets()
    // const onlineIds = new Set<number>()

    // for (const remoteSocket of allSockets) {
    //   // onlineIds.add(remoteSocket.data.userId)
    //   remoteSocket.emit('user:status:notify', room)
    // }

    // const onlineUsers = await User.findMany([...onlineIds])

    // socket.emit('user:list', onlineUsers)

    logger.info('new websocket connection')
  }

  // see https://socket.io/get-started/private-messaging-part-2/#disconnection-handler
  public async onDisconnected({ socket, auth, logger }: WsContextContract, reason: string) {
    const room = this.getUserRoom(auth.user!)
    const userSockets = await socket.in(room).allSockets()

    // user is disconnected
    if (userSockets.size === 0) {
      // notify other users
      socket.broadcast.emit('user:offline', auth.user)
    }

    logger.info('websocket disconnected', reason)
  }

  public async getStatus({ auth, socket }: WsContextContract) {
    const room = this.getUserRoom(auth.user!)
    const allSockets = await socket.nsp.except(room).fetchSockets()
    for (const remoteSocket of allSockets) {
      remoteSocket.emit('user:status:notify', room)
    }
  }

  public async notifyStatus(
    { auth, socket }: WsContextContract,
    status: UserStatus,
    room: string | null
  ) {
    if (room) {
      socket.to(room).emit('user:status', auth.user, status)
    } else {
      const room = this.getUserRoom(auth.user!)
      const allSockets = await socket.nsp.except(room).fetchSockets()
      for (const remoteSocket of allSockets) {
        remoteSocket.emit('user:status', auth.user, status)
      }
    }
  }
  public async inviteUser(
    { auth, socket }: WsContextContract,
    username: string,
    channelName: string
  ) {
    const channel = await Channel.findByOrFail('name', channelName)
    const user = await User.findByOrFail('username', username)
    await user
      .related('channels')
      .pivotQuery()
      .where('channel_id', channel.id)
      .firstOrFail()
      .then(async (channelUser) => {
        if (channelUser.is_banned && auth.user!.id === channel.adminId) {
          const kicks = await user.related('receivedKicks').query().where('channelId', channel.id)
          kicks.forEach((kick) => kick.delete())
          await user
            .related('channels')
            .sync(
              {
                [channel.id]: {
                  joined_at: null,
                  is_banned: false,
                },
              },
              false
            )
            .then(() => {
              socket.to('user:' + user.id).emit('user:invite', channel, auth.user)
            })
        } else if (channelUser.is_banned) {
          throw 'User is banned from this channel.'
        } else {
          return
        }
      })
      .catch(async () => {
        await channel
          .related('users')
          .attach({
            [user.id]: {
              joined_at: null,
            },
          })
          .then(() => {
            socket.to('user:' + user.id).emit('user:invite', channel, auth.user)
          })
      })
  }
  public async acceptInvite({ auth }: WsContextContract, channelName: string) {
    const channel = await Channel.findByOrFail('name', channelName)
    await channel
      .related('users')
      .sync(
        {
          [auth.user!.id]: {
            joined_at: DateTime.now(),
          },
        },
        false
      )
      .then(() => {
        channel.numberOfUsers++
        channel.save()
      })
    return channel
  }

  public async rejectInvite({ auth }: WsContextContract, channelName: string) {
    const channel = await Channel.findByOrFail('name', channelName)
    await channel.related('users').detach([auth.user!.id])
    return channel
  }

  public async joinCommand({ auth, socket }: WsContextContract, channelName: string, type: string) {
    const channel = await Channel.findBy('name', channelName)

    if (channel) {
      const lastMessage = await channel
        .related('messages')
        .query()
        .orderBy('created_at', 'desc')
        .first()
      if (lastMessage !== null && Math.abs(lastMessage.createdAt.diffNow().as('days')) > 30) {
        await channel.delete()
        socket.broadcast.emit('user:delete', channel) //TODO check
        const newChannel = await Channel.create({
          name: channelName,
          type: ChannelType.PUBLIC === type ? ChannelType.PUBLIC : ChannelType.PRIVATE,
          adminId: auth.user!.id,
        })
        await auth.user!.related('channels').attach({
          [newChannel.id]: {
            joined_at: DateTime.now(),
          },
        })
        return newChannel
      }
      if (channel.type === ChannelType.PUBLIC) {
        await auth
          .user!.related('channels')
          .pivotQuery()
          .where('channel_id', channel.id)
          .firstOrFail()
          .catch(async () => {
            await auth.user!.related('channels').attach({
              [channel.id]: {
                joined_at: DateTime.now(),
              },
            })
            channel.numberOfUsers++
            channel.save()
            return channel
          })
        throw 'You are banned from this channel.'
      } else if (channel.type === ChannelType.PRIVATE) {
        throw 'Channel is private.'
      }
    } else {
      //const data = await request.validate(CreateChannelValidator) TODO validator
      const channel = await Channel.create({
        name: channelName,
        type: ChannelType.PUBLIC === type ? ChannelType.PUBLIC : ChannelType.PRIVATE,
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
}
