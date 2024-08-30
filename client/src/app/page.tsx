'use client'

import { useState } from 'react'
import { Chat } from './chat'
import { Login } from './login'

export default function Page() {
  const [username, setUsername] = useState('')

  return (
    <>
      {username ? (
        <Chat username={username} />
      ) : (
        <Login login={(username) => setUsername(username)} />
      )}
    </>
  )
}
