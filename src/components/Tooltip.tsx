import { useState, useRef, type ReactNode } from 'react'

interface Props {
  content: ReactNode
  children: ReactNode
  position?: 'top' | 'bottom'
  maxWidth?: number
}

export default function Tooltip({ content, children, position = 'top', maxWidth = 280 }: Props) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setVisible(true), 200)
  }

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setVisible(false)
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={`absolute z-50 px-3 py-2 rounded-lg text-[11px] leading-relaxed font-normal text-white shadow-lg pointer-events-none
            ${position === 'top' ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' : 'top-full mt-2 left-1/2 -translate-x-1/2'}
          `}
          style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            maxWidth,
            animation: 'tooltip-in 0.15s ease-out',
          }}
        >
          {content}
          <span
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${position === 'top' ? '-bottom-1' : '-top-1'}`}
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', borderWidth: position === 'top' ? '0 1px 1px 0' : '1px 0 0 1px' }}
          />
        </span>
      )}
    </span>
  )
}
