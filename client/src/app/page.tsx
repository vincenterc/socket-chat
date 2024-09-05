'use client'

import { Chat } from './chat'
import { Login } from './login'

import { useUsername } from '@/component/username-provider'

export default function Page() {
  const { username } = useUsername()

  return <>{username ? <Chat /> : <Login />}</>
}
