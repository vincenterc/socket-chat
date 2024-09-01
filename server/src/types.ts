export interface ClientToServerEvents {
  'chat message': (
    content: string,
    clientOffset: string,
    callback: (serverOffset: number) => void,
  ) => void
}

export interface ServerToClientEvents {
  'user connect': (username: string) => void
  'user disconnect': (username: string) => void
  'chat message': (
    from: string,
    content: string,
    serverOffset: number | undefined,
  ) => void
}

export interface InterServerEvents {}

export interface SocketData {
  username: string
  serverOffset: number
}
