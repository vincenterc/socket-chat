import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Server, Socket as ServerSocket } from 'socket.io'
import { createServer } from 'http'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import { ServerPort } from '@/socket.js'
import HomePage from './page.js'

const user = userEvent.setup()

describe('socket-chat-client', () => {
  let io: Server, serverSocket: ServerSocket

  beforeAll(() => {
    const httpServer = createServer()
    io = new Server(httpServer)
    httpServer.listen(ServerPort)
  })

  afterAll(() => {
    io.close()
  })

  it('Emit chat message', () => {
    return new Promise(async (resolve) => {
      io.on('connection', (socket) => {
        socket.on('chat message', (msg) => {
          expect(msg).toEqual('hello')
          resolve(null)
        })
      })
      render(<HomePage />)
      const button = screen.getByRole('button')
      const input = screen.getByRole<HTMLInputElement >('textbox')
      await user.type(input, 'hello')
      expect(input.value).toEqual('hello')
      await user.click(button)
      expect(input.value).toEqual('')
    })
  })
})
