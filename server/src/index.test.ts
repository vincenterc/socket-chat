import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { io as ioc, Socket as ClientSocket } from 'socket.io-client'

import { port } from './index.js'

const wait = (second: number) =>
  new Promise((resolve) => setTimeout(resolve, second * 1000))

describe('socket-chat-server', () => {
  let clientSocket1: ClientSocket, clientSocket2: ClientSocket
  const consoleMock = vi
    .spyOn(console, 'log')
    .mockImplementation(() => undefined)

  beforeAll(() => {
    clientSocket1 = ioc(`http://localhost:${port}`, { autoConnect: false })
    clientSocket2 = ioc(`http://localhost:${port}`, { autoConnect: false })
  })

  afterAll(() => {
    clientSocket1.disconnect()
    clientSocket2.disconnect()
  })

  it('Receive and emit chat messages', async () => {
    clientSocket1.connect()
    clientSocket2.connect()
    clientSocket1.emit('chat message', 'hello')

    const p1 = new Promise((resolve) => {
      clientSocket1.on('chat message', resolve)
    })
    const p2 = new Promise((resolve) => {
      clientSocket2.on('chat message', resolve)
    })
    const response = await Promise.all([p1, p2])

    expect(response).toStrictEqual(['hello', 'hello'])
  })
})
