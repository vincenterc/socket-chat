export interface ClientToServerEvents {
  'chat message': (
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
  'chat message': (from: string, content: string, serverOffset: number) => void
  typing: ({
    username,
    isTyping,
  }: {
    username: string
    isTyping: boolean
  }) => void
}
