export interface ClientToServerEvents {
  'chat message': (content: string, clientOffset: string) => void
}

export interface ServerToClientEvents {
  'chat message': (msg: string, serverOffset: number) => void
}
