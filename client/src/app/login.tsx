'use client'

import { useState } from 'react'

import { useUsername } from '@/component/username-provider'

export function Login() {
  const [username, setUsername] = useState('')
  const auth = useUsername()

  return (
    <div className="h-screen flex justify-center items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          auth.setUsername(username)
          setUsername('')
        }}
        className="w-full max-w-80"
      >
        <div className="h-11 w-full mb-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Please enter your username"
            className="w-full h-full p-3 rounded-md border border-gray-400  focus:border-[2px] focus:border-gray-900 focus:outline-none text-sm font-normal text-gray-700"
          />
        </div>
        <div className="flex justify-end items-center">
          <button className="px-6 py-3 rounded-lg bg-gray-900 text-xs font-bold text-white uppercase">
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
