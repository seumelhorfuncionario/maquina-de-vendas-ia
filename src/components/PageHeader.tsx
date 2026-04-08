import type { ReactNode } from 'react'

interface Props {
  title: string
  description?: string
  action?: ReactNode
}

export default function PageHeader({ title, description, action }: Props) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#888]">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-[#666] mt-1 font-medium">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
