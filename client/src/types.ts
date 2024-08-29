export interface ClientToServerEvents {
  'chat message': (content: string, clientOffset: string) => void
}

export interface ServerToClientEvents {
  'user connect': (socketId: string) => void
  'user disconnect': (socketId: string) => void
  'chat message': (msg: string, serverOffset: number) => void
}
