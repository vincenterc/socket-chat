'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { socket } from '@/socket'

let counter = 0

export default function Page() {
  const [content, setContent] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const [toggleConnBtnText, setToggleConnBtnText] = useState('Disconnect')

  useEffect(() => {
    socket.connect()

    const onChatMessage = (msg: string, serverOffset: number) => {
      setMessages((prev) => [...prev, msg])
      socket.auth.serverOffset = serverOffset
    }

    socket.on('chat message', onChatMessage)

    return () => {
      socket.off('chat message')
    }
  }, [])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (content) {
      const clientOffset = `${socket.id}-${counter++}`
      socket.emit('chat message', content, clientOffset)
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
        {messages.map((msg) => (
          <li className="py-2 px-4 odd:bg-[#efefef]" key={msg}>
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
