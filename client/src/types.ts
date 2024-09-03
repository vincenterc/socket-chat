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
    callback: (err: Error, serverOffset: number) => void,
  ) => void
  typing: ({
    username,
    isTyping,
  }: {
    username: string
    isTyping: boolean
  }) => void
}

export interface ServerToClientEvents {
  'user connect': (username: string) => void
  'user disconnect': (username: string) => void
  users: (users: string[]) => void
  'chat message': (
    from: string,
    to: string,
    content: string,
    serverOffset: number,
  ) => void
  typing: ({
    username,
    isTyping,
  }: {
    username: string
    isTyping: boolean
  }) => void
}
