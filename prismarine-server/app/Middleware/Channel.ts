import { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'

export default class ChannelMiddleware {
  /**
   * Handle ws namespace connection
   */
  public async wsHandle({ auth, params }: WsContextContract, next: () => Promise<void>) {
    await auth
      .user!.related('channels')
      .query()
      .where('name', params.name)
      .whereNotNullPivot('joined_at')
      .firstOrFail()

    await next()
  }
}
