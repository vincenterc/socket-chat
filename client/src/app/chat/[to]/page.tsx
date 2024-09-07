'use client'

import { notFound, redirect } from 'next/navigation'

import { useChat } from '@/component/chat-provider'
import { useUsername } from '@/component/username-provider'
import { Chat } from '../chat'

const ChatToPage = ({ params: { to } }: { params: { to: string } }) => {
  const { username } = useUsername()
  const { users } = useChat()

  if (!username) redirect('/login')
  if (users.findIndex((u) => u.name === to) === -1) {
    notFound()
  }

  return <Chat />
}

export default ChatToPage
