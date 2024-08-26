import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Server, Socket as ServerSocket } from 'socket.io'
import { createServer } from 'http'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import { ServerPort, socket as clientSocket } from '@/socket.js'
import HomePage from './page.js'

const user = userEvent.setup()

describe('socket-chat-client', () => {
  let io: Server, serverSocket: ServerSocket

  beforeAll(
    () =>
      new Promise((resolve) => {
        const httpServer = createServer()
        io = new Server(httpServer)
        httpServer.listen(ServerPort)
        clientSocket.connect()
        io.on('connection', (socket) => {
          serverSocket = socket
          resolve()
        })
      }),
  )

  afterAll(() => {
    io.close()
    clientSocket.disconnect()
  })

  it('Emit chat message', () => {
    render(<HomePage />)
    const button = screen.getByRole<HTMLButtonElement>('button')
    const input = screen.getByRole<HTMLInputElement>('textbox')
    input.value = 'hello'
    user.click(button)
    serverSocket.on('chat message', (msg) => {
      expect(msg).toEqual('hello')
    })
  })
})
