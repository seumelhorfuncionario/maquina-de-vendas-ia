import type { ReactNode } from 'react'

interface Props {
  title: string
  description?: string
  action?: ReactNode
}

export default function PageHeader({ title, description, action }: Props) {
  // Mobile stack vertical (title em cima, action embaixo); desktop row.
  // min-w-0 no title container pra flex truncar bem longos em vez de empurrar o row.
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-theme-primary">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-theme-tertiary mt-1 font-medium">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2 flex-wrap shrink-0">{action}</div>}
    </div>
  )
}
