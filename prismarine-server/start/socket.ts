/*
|--------------------------------------------------------------------------
| Websocket events
|--------------------------------------------------------------------------
|
| This file is dedicated for defining websocket namespaces and event handlers.
|
*/

import Ws from '@ioc:Ruby184/Socket.IO/Ws'

Ws.namespace('/')
  .connected('ActivityController.onConnected')
  .disconnected('ActivityController.onDisconnected')
  .on('notifyStatus', 'ActivityController.notifyStatus')
  .on('getStatus', 'ActivityController.getStatus')
  .on('inviteUser', 'ActivityController.inviteUser')
  .on('acceptInvite', 'ActivityController.acceptInvite')
  .on('rejectInvite', 'ActivityController.rejectInvite')
  .on('joinCommand', 'ActivityController.joinCommand')

// this is dynamic namespace, in controller methods we can use params.name
Ws.namespace('channels/:name')
  .middleware('channel')
  .connected('ChannelUserController.onConnected')
  .on('loadMessages', 'MessageController.loadMessages')
  .on('addMessage', 'MessageController.addMessage')
  .on('loadUsers', 'ChannelUserController.loadUsers')
  .on('leaveChannel', 'ChannelUserController.leaveChannel')
  .on('kickUser', 'ChannelUserController.kickUser')
