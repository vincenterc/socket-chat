'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'

import { socket } from '@/socket'
import { generatedId } from '@/lib/utils'

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
  const [content, setContent] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const [toggleConnBtnText, setToggleConnBtnText] = useState('Disconnect')
  const [typings, setTypings] = useState<string[]>([])

  useEffect(() => {
    socket.auth = { ...socket.auth, username }
    socket.connect()

    const onConnectError = (error: Error) => {
      console.error(error.message)
    }

    const onUserConnect = (username: string) => {
      setMessages((prev) => [...prev, `*(${username}) connected*`])
    }

    const onUserDisconnect = (username: string) => {
      setMessages((prev) => [...prev, `*(${username}) disconnected*`])
    }

    const onChatMessage = (
      from: string,
      content: string,
      serverOffset: number,
    ) => {
      setMessages((prev) => [
        ...prev,
        `${from === username ? '(yourself)' : from}: ${content}`,
      ])
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
    socket.on('chat message', onChatMessage)
    socket.on('typing', onTyping)

    return () => {
      socket.off('connect_error')
      socket.off('user connect')
      socket.off('user disconnect')
      socket.off('chat message')
      socket.off('typing', onTyping)
    }
  }, [username])

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight)
  })

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
        content,
        clientOffset,
        // ackTimeout set up in the config
        (_err, serverOffset) => {
          socket.auth = { ...socket.auth, serverOffset }
        },
      )
      setMessages((prev) => [...prev, `(yourself): ${content}`])
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
    <>
      <ul>
        {messages.map((msg, i) => (
          <li className="py-2 px-4 odd:bg-[#efefef]" key={`${msg}-${i}`}>
            {msg}
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
        className="bg-[rgb(0,0,0,0.15)] p-1 fixed bottom-0 left-0 right-0 flex h-12 box-border backdrop-blur-[10px]"
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
    </>
  )
}
