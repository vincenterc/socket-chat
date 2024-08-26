import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { io as ioc, Socket as ClientSocket } from 'socket.io-client'

import { port } from './index.js'

const wait = (second: number) =>
  new Promise((resolve) => setTimeout(resolve, second * 1000))

describe('socket-chat-server', () => {
  let clientSocket: ClientSocket
  const consoleMock = vi
    .spyOn(console, 'log')
    .mockImplementation(() => undefined)

  beforeAll(() => {
    clientSocket = ioc(`http://localhost:${port}`, { autoConnect: false })
  })

  afterAll(() => {
    clientSocket.disconnect()
  })

  it('On connection', async () => {
    clientSocket.connect()
    await wait(1)
    expect(consoleMock).toHaveBeenCalledWith('a user connected')
  })

  it('On disconnection', async () => {
    clientSocket.connect()
    clientSocket.disconnect()
    await wait(1)
    expect(consoleMock).toHaveBeenCalledWith('user disconnected')
  })
})
