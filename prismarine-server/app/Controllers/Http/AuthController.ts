import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Channel from 'App/Models/Channel'
import RegisterUserValidator from 'App/Validators/RegisterUserValidator'
import { DateTime } from 'luxon'

export default class AuthController {
  async register({ request }: HttpContextContract) {
    // if invalid, exception
    const data = await request.validate(RegisterUserValidator)
    const user = await User.create(data)
    const general = await Channel.findByOrFail('name', 'general')
    general.numberOfUsers++
    await user.related('channels').attach({
      [general.id]: {
        joined_at: DateTime.now(),
      },
    })
    general.save()
    return user
  }

  async login({ auth, request }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    return auth.use('api').attempt(email, password)
  }

  async logout({ auth }: HttpContextContract) {
    return auth.use('api').logout()
  }

  async me({ auth }: HttpContextContract) {
    await auth.user!.load('channels', (channelQuery) =>
      channelQuery.whereNotNullPivot('joined_at').orderBy('name'.toLowerCase(), 'asc')
    )
    await auth.user!.load('channelInvites', (channelQuery) =>
      channelQuery.whereNullPivot('joined_at')
    )
    return auth.user
  }
}
