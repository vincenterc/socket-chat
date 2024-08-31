export interface ClientToServerEvents {
  'chat message': (content: string, clientOffset: string) => void
}

export interface ServerToClientEvents {
  'user connect': (username: string) => void
  'user disconnect': (username: string) => void
  'chat message': (from: string, content: string, serverOffset: number) => void
}
