'use client'

import { redirect } from 'next/navigation'

import { useUsername } from '@/component/username-provider'
import { Chat } from './chat'

const ChatPage = () => {
  const { username } = useUsername()

  if (!username) redirect('/login')

  return <Chat />
}

export default ChatPage
