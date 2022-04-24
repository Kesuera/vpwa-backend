// here we are declaring our MessageRepository types for Repositories/MessageRepository
// container binding. See providers/AppProvider.ts for how we are binding the implementation
declare module '@ioc:Repositories/MessageRepository' {
  export interface SerializedMessage {
    createdBy: number
    content: string
    channelId: number
    createdAt: string
    updatedAt: string
    id: number
    author: {
      id: number
      username: string
      email: string
      fullname: string
      createdAt: string
      updatedAt: string
    }
  }

  export interface MessageRepositoryContract {
    firstLoad(channelName: string): Promise<SerializedMessage[]>
    create(channelName: string, userId: number, content: string): Promise<SerializedMessage>
  }

  const MessageRepository: MessageRepositoryContract
  export default MessageRepository
}

declare module '@ioc:Repositories/ChannelUserRepository' {
  export interface SerializedChannelUser {
    id: number
    username: string
    email: string
    fullname: string
    createdAt: string
    updatedAt: string
  }

  export interface ChannelUserRepositoryContract {
    getAll(channelName: string): Promise<SerializedChannelUser[]>
  }

  const ChannelUserRepository: ChannelUserRepositoryContract
  export default ChannelUserRepository
}
