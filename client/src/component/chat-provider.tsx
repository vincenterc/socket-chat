'use client'

import {
  ChangeEvent,
  createContext,
  Dispatch,
  FormEvent,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useParams } from 'next/navigation'

import { generatedId } from '@/lib/utils'
import { socket } from '@/socket'
import { Message, User } from '@/types'
import { useUsername } from './username-provider'
import { toast } from './toaster'

interface Chat {
  content: string
  messages: Message[]
  users: User[]
  to: string
  toggleConnBtnText: string
  typings: string[]
  setUsers: Dispatch<SetStateAction<User[]>>
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
  handleToggleConnBtnClick: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void
}

let counter = 0
let isTyping = false
const getId = (function () {
  let id = ''
  return function () {
    if (!id) {
      id = generatedId(20)
    }
    return id
  }
})()

const ChatText = createContext<Chat | null>(null)
export const useChat = () => {
  const obj = useContext(ChatText)

  if (!obj) {
    throw new Error('useChat must be used within a ChatProvider')
  }

  return obj
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { username } = useUsername()
  const [users, setUsers] = useState<User[]>([])
  const [typings, setTypings] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [toggleConnBtnText, setToggleConnBtnText] = useState('Disconnect')
  const to = (useParams().to as string) || ''

  useEffect(() => {
    socket.auth = { ...socket.auth, username }
    socket.connect()

    const onConnectError = (error: Error) => {
      console.error(error.message)
    }

    const onUserConnect = (username: string) => {
      setUsers((prev) => [...prev, { name: username, hasNewMessage: false }])
      toast(`${username} connected`)
    }

    const onUserDisconnect = (username: string) => {
      setUsers((prev) => prev.filter((u) => u.name !== username))
      toast(`${username} disconnected`)
      if (
        typings.length !== 0 &&
        typings.findIndex((u) => u === username) !== -1
      ) {
        setTypings((prev) => prev.filter((u) => u !== username))
      }
    }

    const onUsers = (users: string[]) =>
      setUsers(users.map((u) => ({ name: u, hasNewMessage: false })))

    const onChatMessage = (msg: Message, serverOffset: number) => {
      setMessages((prev) => [...prev, msg])
      socket.auth = { ...socket.auth, serverOffset }

      if (msg.to && socket.auth.connectionCount > 0) {
        const index = users.findIndex((u) => u.name === msg.from)
        if (index !== -1) {
          setUsers((prev) => [
            ...prev.slice(0, index),
            { ...prev[index], hasNewMessage: msg.from !== to },
            ...prev.slice(index + 1),
          ])
        }
      }
    }

    const onTyping = ({
      username,
      isTyping,
    }: {
      username: string
      isTyping: boolean
    }) => {
      if (isTyping) {
        setTypings((prev) => [...prev, username])
      } else {
        setTypings((prev) => prev.filter((u) => u !== username))
      }
    }

    const onIncrementConnectionCount = () =>
      (socket.auth = {
        ...socket.auth,
        connectionCount:
          (socket.auth as { [key: string]: any }).connectionCount + 1,
      })

    socket.on('connect_error', onConnectError)
    socket.on('user connect', onUserConnect)
    socket.on('user disconnect', onUserDisconnect)
    socket.on('users', onUsers)
    socket.on('chat message', onChatMessage)
    socket.on('typing', onTyping)
    socket.on('increment connection count', onIncrementConnectionCount)

    return () => {
      socket.off('connect_error')
      socket.off('user connect')
      socket.off('user disconnect')
      socket.off('users')
      socket.off('chat message')
      socket.off('typing', onTyping)
      socket.off('increment connection count', onIncrementConnectionCount)
    }
  }, [username, users, typings, to])

  useEffect(() => {
    if (!isTyping && content !== '') {
      isTyping = true
      socket.emit('typing', { username, isTyping: true })
    } else if (isTyping && content === '') {
      isTyping = false
      socket.emit('typing', { username, isTyping: false })
    }
  }, [username, content])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (content) {
      const socketId = socket.id || getId()
      const clientOffset = `${socketId}-${counter++}`
      socket.emit(
        'chat message',
        to,
        content,
        clientOffset,
        // ackTimeout set up in the config
        (_err, serverOffset) => {
          socket.auth = { ...socket.auth, serverOffset }
        },
      )
      setMessages((prev) => [...prev, { from: username, to, content }])
      setContent('')
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setContent(e.target.value)

  const handleToggleConnBtnClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault()
    if (socket.connected) {
      setToggleConnBtnText('Connect')
      socket.disconnect()
    } else {
      setToggleConnBtnText('Disconnect')
      socket.connect()
    }
  }

  return (
    <ChatText.Provider
      value={{
        content,
        messages,
        users,
        to,
        toggleConnBtnText,
        typings,
        setUsers,
        handleChange,
        handleSubmit,
        handleToggleConnBtnClick,
      }}
    >
      {children}
    </ChatText.Provider>
  )
}
