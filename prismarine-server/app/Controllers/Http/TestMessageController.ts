import type { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
import { inject } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

@inject(['Repositories/MessageRepository'])
export default class TestMessageController {
  constructor(private messageRepository: MessageRepositoryContract) {}

  public async loadMessages({ params }: HttpContextContract) {
    return this.messageRepository.getAll(params.name)
  }

  public async addMessage({ params, request }: HttpContextContract) {
    const message = await this.messageRepository.create(params.name, 1, request.input('content'))
    // return message to sender
    return message
  }
}
