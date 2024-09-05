'use client'

import React, {
  Dispatch,
  ReactElement,
  SetStateAction,
  useEffect,
  useState,
} from 'react'

let updateToasts: Dispatch<SetStateAction<ReactElement[]>>
let timeoutIds: NodeJS.Timeout[] = []
let count: number = 0

export function toast(content: string) {
  const newToast = <Toast key={`content-${count++}`} content={content} />

  updateToasts((prev) => [...prev, newToast])
  timeoutIds.push(setTimeout(() => updateToasts((prev) => prev.slice(1)), 2000))
}

export function Toaster() {
  const [toasts, setToasts] = useState<ReactElement[]>([])

  useEffect(() => {
    updateToasts = setToasts
  }, [setToasts])

  useEffect(
    () => () => {
      timeoutIds.forEach((id) => clearTimeout(id))
      timeoutIds.length = 0
    },
    [],
  )

  return (
    <div className="pointer-events-none fixed top-0 left-0 z-[99] w-full p-4 flex justify-end bg-transparent">
      <div>{toasts}</div>
    </div>
  )
}

interface ToastProps {
  content: string
}

function Toast({ content }: ToastProps) {
  return (
    <p className="px-4 py-2 rounded-lg border shadow-lg bg-white">{content}</p>
  )
}
