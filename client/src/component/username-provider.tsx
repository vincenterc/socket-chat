'use client'

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react'

const UsernameContext = createContext<{
  username: string
  setUsername: Dispatch<SetStateAction<string>>
} | null>(null)

export const useUsername = () => {
  const object = useContext(UsernameContext)
  if (!object) {
    throw new Error('useUsername must be used within a UsernameProvider')
  }
  return object
}

interface Props {
  children: ReactNode
}

export function UsernameProvider({ children }: Props) {
  const [username, setUsername] = useState('')

  const auth = useMemo(() => {
    return { username, setUsername }
  }, [username])

  return (
    <UsernameContext.Provider value={auth}>{children}</UsernameContext.Provider>
  )
}
