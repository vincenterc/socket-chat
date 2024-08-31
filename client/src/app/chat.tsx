'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'

import { socket } from '@/socket'
import { Message } from '@/types'

let counter = 0

interface Props {
  username: string
}

export function Chat({ username }: Props) {
  const [content, setContent] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const [toggleConnBtnText, setToggleConnBtnText] = useState('Disconnect')

  useEffect(() => {
    socket.auth = { ...socket.auth, username }
    socket.connect()

    const onConnectError = (error: Error) => {
      alert(error.message)
    }

    const onUserConnect = (username: string) => {
      setMessages((prev) => [...prev, `*(${username}) connected*`])
    }

    const onUserDisconnect = (username: string) => {
      setMessages((prev) => [...prev, `*(${username}) disconnected*`])
    }

    const onChatMessage = ({ from, msg, serverOffset }: Message) => {
      setMessages((prev) => [
        ...prev,
        `${from === username ? '(yourself)' : from}: ${msg}`,
      ])
      socket.auth = { ...socket.auth, serverOffset }
    }

    socket.on('connect_error', onConnectError)
    socket.on('user connect', onUserConnect)
    socket.on('user disconnect', onUserDisconnect)
    socket.on('chat message', onChatMessage)

    return () => {
      socket.off('connect_error')
      socket.off('user connect')
      socket.off('user disconnect')
      socket.off('chat message')
    }
  }, [username])

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight)
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (content) {
      const clientOffset = `${socket.id}-${counter++}`
      socket.emit('chat message', content, clientOffset)
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
