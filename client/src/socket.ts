'use client'

import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from './types'

export const ServerPort = 3000
const ServerURL = `http://localhost:${ServerPort}`
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  ServerURL,
  {
    autoConnect: false,
    auth: {
      username: '',
      serverOffset: 0,
      connectionCount: 0,
    },
    ackTimeout: 10000,
    retries: 3,
  },
)
