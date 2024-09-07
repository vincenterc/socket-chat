'use client'

import { useEffect, useRef } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

import { useChat } from '@/component/chat-provider'
import { useUsername } from '@/component/username-provider'

export function Chat() {
  const { username } = useUsername()
  const {
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
  } = useChat()
  const msgListRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    msgListRef.current?.scrollTo(0, msgListRef.current.scrollHeight)
  }, [messages, typings])

  const handleClickLink = (username: string) => () => {
    const index = users.findIndex((u) => u.name === username)
    if (index !== -1 && users[index].hasNewMessage) {
      setUsers((prev) =>
        prev.map((u) =>
          u.name === username ? { ...u, hasNewMessage: false } : u,
        ),
      )
    }
  }

  return (
    <div className="h-screen flex">
      <div className="grow max-w-80 p-2 flex flex-col bg-gray-800">
        <h1 className="py-2 px-4 text-white text-3xl font-bold ">{username}</h1>
        <ul className="grow overflow-y-auto">
          {to ? (
            <li>
              <Link
                href="/chat"
                className="mt-2 py-2 px-4 flex items-center gap-2 bg-gray-600 rounded-2xl align-middle text-white text-xl hover:cursor-pointer hover:bg-gray-700"
              >
                <ArrowLeftIcon className="size-5 text-white" />
                {to}
              </Link>
            </li>
          ) : (
            users.map(
              (u, i) =>
                u.name !== username && (
                  <li key={`${u}-${i}`}>
                    <Link
                      href={`/chat/${u.name}`}
                      onClick={handleClickLink(u.name)}
                      className="mt-2 py-2 px-4 bg-gray-600 rounded-2xl flex justify-between items-center text-white text-xl hover:cursor-pointer hover:bg-gray-700"
                    >
                      {u.name}
                      {u.hasNewMessage && (
                        <div className="w-2 h-2 bg-red-600 rounded-[50%]" />
                      )}
                    </Link>
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
