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
    from: string,
    to: string,
    content: string,
    serverOffset: number | undefined,
  ) => void
  typing: ({
    username,
    isTyping,
  }: {
    username: string
    isTyping: boolean
  }) => void
}

export interface InterServerEvents {
  'user connect': (username: string) => void
  'user disconnect': (username: string) => void
}

export interface SocketData {
  username: string
  serverOffset: number
}
