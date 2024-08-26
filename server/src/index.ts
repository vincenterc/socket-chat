import { createServer } from 'http'
import { Server } from 'socket.io'

const ClientURL = 'http://localhost:3001'

const server = createServer()
export const io = new Server(server, {
  cors: {
    origin: ClientURL,
  },
})

io.on('connection', (socket) => {
  console.log('a user connected')
})

export const port = 3000
server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`)
})
