export interface Message {
  from: string
  msg: string
  offset: number | undefined
}

export interface ClientToServerEvents {
  'chat message': (
    msg: string,
    clientOffset: string,
    callback: () => void,
  ) => void
}

export interface ServerToClientEvents {
  'user connect': (username: string) => void
  'user disconnect': (username: string) => void
  'chat message': ({ from, msg, offset }: Message) => void
}

export interface InterServerEvents {}

export interface SocketData {
  username: string
}
