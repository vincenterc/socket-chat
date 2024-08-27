import { createServer } from 'http'
import { Server } from 'socket.io'
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from './types.js'

const ClientURL = 'http://localhost:3001'

const server = createServer()
export const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: ClientURL,
  },
})

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg)
  })
})

export const port = 3000
server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`)
})
