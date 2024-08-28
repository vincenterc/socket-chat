export interface ClientToServerEvents {
  'chat message': (msg: string) => void
}

export interface ServerToClientEvents {
  'chat message': (msg: string, offset: number | undefined) => void
}

export interface InterServerEvents {}

export interface SocketData {}
