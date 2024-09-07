import { ReactNode } from 'react'
import { ChatProvider } from '@/component/chat-provider'

export default function ChatLayout({ children }: { children: ReactNode }) {
  return <ChatProvider>{children}</ChatProvider>
}
