import { createServer } from 'http'
import { Server } from 'socket.io'
import { open } from 'sqlite'
import sqlite3 from 'sqlite3'

import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from './types.js'

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
    content TEXT
  );
`)

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
  connectionStateRecovery: {},
})

io.on('connection', async (socket) => {
  socket.on('chat message', async (msg, clientOffset, callback) => {
    let result
    try {
      // store the message in the database
      result = await db.run(
        'INSERT INTO messages (content, client_offset) VALUES (?, ?)',
        msg,
        clientOffset,
      )
    } catch (e) {
      if (e.errno === 19 /* SQLITE_CONSTRAINT */) {
        // the message was already inserted, so we notify the client
        callback()
      } else {
        // nothing to do, just let the client retry
      }
      return
    }

    // include the offset with the message
    io.emit('chat message', msg, result.lastID)
    // acknowledge the event
    callback()
  })

  if (!socket.recovered) {
    // if the connection state recovery was not successful
    try {
      await db.each(
        'SELECT id, content FROM messages WHERE id > ?',
        [socket.handshake.auth.serverOffset || 0],
        (_err, row) => {
          socket.emit('chat message', row.content, row.id)
        },
      )
    } catch (e) {
      // something went wrong
    }
  }
})

export const port = 3000
server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`)
})
