'use client'

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

import { socket } from '@/socket'
import { generatedId } from '@/lib/utils'
import { Message } from '@/types'

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

interface Props {
  username: string
}

export function Chat({ username }: Props) {
  const [users, setUsers] = useState<string[]>([])
  const [content, setContent] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [toggleConnBtnText, setToggleConnBtnText] = useState('Disconnect')
  const [typings, setTypings] = useState<string[]>([])
  const [to, setTo] = useState<string>('')
  const msgListRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    socket.auth = { ...socket.auth, username }
    socket.connect()

    const onConnectError = (error: Error) => {
      console.error(error.message)
    }

    const onUserConnect = (username: string) => {
      setUsers((prev) => [...prev, username])
      // TODO
      // setMessages((prev) => [...prev, `*(${username}) connected*`])
    }

    const onUserDisconnect = (username: string) => {
      setUsers((prev) => prev.filter((u) => u !== username))
      // TODO
      // setMessages((prev) => [...prev, `*(${username}) disconnected*`])
      if (
        typings.length !== 0 &&
        typings.findIndex((u) => u === username) !== -1
      ) {
        setTypings((prev) => prev.filter((u) => u !== username))
      }
    }

    const onUsers = (users: string[]) => setUsers(users)

    const onChatMessage = (
      from: string,
      to: string,
      content: string,
      serverOffset: number,
    ) => {
      setMessages((prev) => [...prev, { from, to, content }])
      socket.auth = { ...socket.auth, serverOffset }
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

    socket.on('connect_error', onConnectError)
    socket.on('user connect', onUserConnect)
    socket.on('user disconnect', onUserDisconnect)
    socket.on('users', onUsers)
    socket.on('chat message', onChatMessage)
    socket.on('typing', onTyping)

    return () => {
      socket.off('connect_error')
      socket.off('user connect')
      socket.off('user disconnect')
      socket.off('users')
      socket.off('chat message')
      socket.off('typing', onTyping)
    }
  }, [typings, username])

  useEffect(() => {
    msgListRef.current?.scrollTo(0, msgListRef.current.scrollHeight)
  }, [messages, typings])

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

  const handleClickUserItem = (username: string) => () => setTo(username)

  return (
    <div className="h-screen flex">
      <div className="grow max-w-80 p-2 flex flex-col bg-gray-800">
        <h1 className="py-2 px-4 text-white text-3xl font-bold ">{username}</h1>
        <ul className="grow overflow-y-auto">
          {to ? (
            <li
              onClick={handleClickUserItem('')}
              className="mt-2 py-2 px-4 flex items-center gap-2 bg-gray-600 rounded-2xl align-middle text-white text-xl hover:cursor-pointer hover:bg-gray-700"
            >
              <ArrowLeftIcon className="size-5 text-white" />
              {to}
            </li>
          ) : (
            users.map(
              (u, i) =>
                u !== username && (
                  <li
                    onClick={handleClickUserItem(u)}
                    key={`${u}-${i}`}
                    className="mt-2 py-2 px-4 bg-gray-600 rounded-2xl align-middle text-white text-xl hover:cursor-pointer hover:bg-gray-700"
                  >
                    {u}
                  </li>
                ),
            )
          )}
        </ul>
      </div>
      <div className="grow-[2] relative">
        <ul ref={msgListRef} className="h-full pb-12 overflow-y-auto">
          {messages
            .filter((msg) =>
              to
                ? (msg.from === username && msg.to === to) ||
                  (msg.from === to && msg.to === username)
                : msg.to === to,
            )
            .map((msg, i) => (
              <li
                className="py-2 px-4 odd:bg-[#efefef]"
                key={`${msg.content}-${i}`}
              >
                {`${msg.from === username ? '(yourself)' : msg.from}: ${msg.content}`}
              </li>
            ))}
          {typings.map((username, i) => (
            <p
              key={`${username}-${i}`}
              className="py-2 px-4 text-gray-400"
            >{`${username} is typing`}</p>
          ))}
        </ul>
        <form
          onSubmit={handleSubmit}
          className="bg-[rgb(0,0,0,0.15)] p-1 absolute bottom-0 left-0 right-0 flex h-12 box-border backdrop-blur-[10px]"
        >
          <input
            value={content}
            onChange={handleChange}
            autoComplete="off"
            className="border-none py-0 px-4 grow rounded-[2rem] m-1 focus:outline-none"
          />
          <button className="bg-[#333] border-none py-0 px-4 m-1 rounded-[3px] outline-none text-[#fff]">
            Send
          </button>
          <button
            onClick={handleToggleConnBtnClick}
            className="bg-[#aaa] py-0 px-4 m-1 rounded-[3px]"
          >
            {toggleConnBtnText}
          </button>
        </form>
      </div>
    </div>
  )
}
