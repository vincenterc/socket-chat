export interface ClientToServerEvents {
  'chat message': (content: string) => void
}

export interface ServerToClientEvents {
  'chat message': (msg: string) => void
}
