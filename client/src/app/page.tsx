'use client'

import { useEffect } from 'react'
import { socket } from '@/socket'

export default function Page() {
  useEffect(() => {
    socket.connect()
  })

  return (
    <>
      <ul></ul>
      <form className="bg-[rgb(0,0,0,0.15)] p-1 fixed bottom-0 left-0 right-0 flex h-12 box-border backdrop-blur-[10px]">
        <input
          autoComplete="off"
          className="border-none py-0 px-4 grow rounded-[2rem] m-1 focus:outline-none"
        />
        <button className="bg-[#333] border-none py-0 px-4 m-1 rounded-[3px] outline-none text-[#fff]">
          Send
        </button>
      </form>
    </>
  )
}
