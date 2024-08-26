'use client'

import { io } from 'socket.io-client'

const ServerURL = 'http://localhost:3000'
export const socket = io(ServerURL, { autoConnect: false })
