import { open } from 'sqlite'
import sqlite3 from 'sqlite3'
import cluster from 'cluster'
import { createServer } from 'http'
import { setupMaster, setupWorker } from '@socket.io/sticky'
import { createAdapter, setupPrimary } from '@socket.io/cluster-adapter'
import { availableParallelism } from 'os'
import { Server } from 'socket.io'

import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from './types.js'

export let io: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>
export const port = 3000

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`)

  const httpServer = createServer()

  // setup sticky sessions
  setupMaster(httpServer, {
    loadBalancingMethod: 'least-connection',
  })

  // setup connections between the workers (the adapter on the primary thread)
  setupPrimary()

  httpServer.listen(port, () => {
    console.log(`server running at http://localhost:${port}`)
  })

  const numCPUS = availableParallelism()

  // create one worker per available core
  for (let i = 0; i < numCPUS; i++) {
    cluster.fork({})
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`)
    cluster.fork()
  })
} else {
  console.log(`Worker ${process.pid} started`)

  // open the database file
  const db = await open({
    filename: 'chat.db',
    driver: sqlite3.Database,
  })

  // create a 'message' table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_offset TEXT UNIQUE,
      sender TEXT,
      receiver TEXT,
      content TEXT
    );
  `)

  const users: string[] = []

  const ClientURL = 'http://localhost:3001'
  const httpServer = createServer()
  io = new Server(httpServer, {
    cors: {
      origin: ClientURL,
    },
    connectionStateRecovery: {},
    // set up the adapter on each worker thread
    adapter: createAdapter(),
  })

  // setup connection with the primary process
  setupWorker(io)

  io.use((socket, next) => {
    const username = socket.handshake.auth.username
    if (!username) {
      next(new Error('Invalid username'))
    }
    socket.data.username = username
    next()
  })

  io.on('connection', async (socket) => {
    socket.data.serverOffset = socket.handshake.auth.serverOffset

    io.serverSideEmit('user connect', socket.data.username)
    socket.broadcast.emit('user connect', socket.data.username)
    users.push(socket.data.username)
    socket.emit('users', users)

    socket.join(socket.data.username)

    socket.on('disconnect', () => {
      const index = users.findIndex((u) => u === socket.data.username)
      if (index !== -1) {
        users.splice(index, 1)
      }
      io.serverSideEmit('user disconnect', socket.data.username)
      socket.broadcast.emit('user disconnect', socket.data.username)
    })

    socket.on('chat message', async (to, content, clientOffset, callback) => {
      let result
      try {
        // store the message in the database
        result = await db.run(
          'INSERT INTO messages (sender, receiver, content, client_offset) VALUES (?, ?, ?, ?)',
          socket.data.username,
          to,
          content,
          clientOffset,
        )
      } catch (e) {
        if ((e as any).errno === 19 /* SQLITE_CONSTRAINT */) {
          // the message was already inserted, so we notify the client
          callback(
            result?.lastID === undefined
              ? socket.data.serverOffset
              : result.lastID,
          )
        } else {
          // nothing to do, just let the client retry
        }
        return
      }

      // include the offset with the message
      if (!to) {
        socket.broadcast.emit(
          'chat message',
          socket.data.username,
          to,
          content,
          result.lastID,
        )
      } else {
        socket
          .to(to)
          .emit(
            'chat message',
            socket.data.username,
            to,
            content,
            result.lastID,
          )
      }
      // acknowledge the event
      callback(
        result.lastID === undefined ? socket.data.serverOffset : result.lastID,
      )
    })

    socket.on('typing', ({ username, isTyping }, callback) => {
      socket.broadcast.emit('typing', { username, isTyping })
      callback()
    })

    if (!socket.recovered) {
      // if the connection state recovery was not successful
      try {
        await db.each<{
          id: number
          sender: string
          receiver: string
          content: string
        }>(
          'SELECT id, sender, receiver, content FROM messages WHERE id > ? AND (sender == ? OR receiver == "" OR receiver == ?)',
          [
            socket.data.serverOffset || 0,
            socket.data.username,
            socket.data.username,
          ],
          (_err, row) => {
            socket.emit(
              'chat message',
              row.sender,
              row.receiver,
              row.content,
              row.id,
            )
          },
        )
      } catch (e) {
        // something went wrong
      }
    }
  })

  io.on('user connect', (username: string) => {
    users.push(username)
  })

  io.on('user disconnect', (username: string) => {
    const index = users.findIndex((u) => u === username)
    if (index !== -1) {
      users.splice(index, 1)
    }
  })
}
