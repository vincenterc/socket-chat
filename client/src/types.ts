export interface ClientToServerEvents {
  'chat message': (content: string) => void
}

export interface ServerToClientEvents {}
