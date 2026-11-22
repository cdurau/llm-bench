import type { ReactNode } from 'react'
import { ArrowRight } from '@phosphor-icons/react'

export default function EmptyState({
  title,
  body,
  action,
  icon
}: {
  title: string
  body: string
  action?: { label: string; onClick: () => void }
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6 reveal">
      {icon && (
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#EFEDE8] dark:bg-[#2A2926] text-[#6B6862] dark:text-[#A39E94] mb-4">
          {icon}
        </div>
      )}
      <h3 className="font-serif text-2xl tracking-tight text-[#2F3437] dark:text-[#EDEAE4]">
        {title}
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-[#6B6862] dark:text-[#A39E94] max-w-[280px]">
        {body}
      </p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-6 inline-flex items-center gap-2 min-h-11 px-5 rounded-md bg-[#111111] dark:bg-[#EDEAE4] text-white dark:text-[#171614] text-[15px] font-semibold tracking-tight transition-transform active:scale-[0.98] hover:bg-[#2A2A2A] dark:hover:bg-[#F4F2EE]"
        >
          {action.label}
          <ArrowRight size={16} weight="bold" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
