export interface Message {
  from: string
  to: string
  content: string
}

export interface ClientToServerEvents {
  'chat message': (
    to: string,
    content: string,
    clientOffset: string,
    callback: (serverOffset: number) => void,
  ) => void
  typing: (
    {
      username,
      isTyping,
    }: {
      username: string
      isTyping: boolean
    },
    callback: () => void,
  ) => void
}

export interface ServerToClientEvents {
  'user connect': (username: string) => void
  'user disconnect': (username: string) => void
  users: (users: string[]) => void
  'chat message': (
    { from, to, content }: Message,
    serverOffset: number | undefined,
  ) => void
  typing: ({
    username,
    isTyping,
  }: {
    username: string
    isTyping: boolean
  }) => void
  'increment connection count': () => void
}

export interface InterServerEvents {
  'user connect': (username: string) => void
  'user disconnect': (username: string) => void
}

export interface SocketData {
  username: string
  serverOffset: number
}
