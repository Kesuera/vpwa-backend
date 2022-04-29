import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import User from 'App/Models/User'
import { UserStatus } from 'Contracts/enums'

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
}
