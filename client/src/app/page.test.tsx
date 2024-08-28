import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Server, Socket as ServerSocket } from 'socket.io'
import { createServer } from 'http'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import { ServerPort } from '@/socket.js'
import HomePage from './page.js'

const user = userEvent.setup()
const delay = (sec: number) =>
  new Promise((resolve) => setTimeout(resolve, sec * 1000))

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

  it('Emit and receive chat messages', async () => {
    await new Promise(async (resolve) => {
      io.on('connection', (socket) => {
        socket.on('chat message', (msg) => {
          expect(msg).toEqual('hello')
          io.emit('chat message', msg)
          resolve(null)
        })
      })
      render(<HomePage />)
      const button = screen.getByText('Send')
      const input = screen.getByRole<HTMLInputElement>('textbox')
      await user.type(input, 'hello')
      expect(input.value).toEqual('hello')
      await user.click(button)
      expect(input.value).toEqual('')
    })
    await delay(1)
    const lis = screen.queryAllByRole<HTMLLIElement>('listitem')
    const lastLi = lis[lis.length - 1]
    expect(lastLi.textContent).toEqual('hello')
  })
})
