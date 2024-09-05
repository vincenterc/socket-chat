'use client'

import { redirect } from 'next/navigation'

import { useUsername } from '@/component/username-provider'

export default function Page() {
  const { username } = useUsername()

  if (!username) redirect('/login')
  else redirect('/chat')
}
