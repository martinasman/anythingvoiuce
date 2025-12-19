'use client'

import { cn } from '@/lib/utils/cn'
import { createContext, useContext, useState, ReactNode } from 'react'

interface AccordionContextValue {
  openItems: string[]
  toggle: (id: string) => void
  allowMultiple: boolean
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

interface AccordionProps {
  children: ReactNode
  allowMultiple?: boolean
  defaultOpen?: string[]
  className?: string
}

export function Accordion({
  children,
  allowMultiple = false,
  defaultOpen = [],
  className,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen)

  const toggle = (id: string) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      )
    } else {
      setOpenItems((prev) => (prev.includes(id) ? [] : [id]))
    }
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggle, allowMultiple }}>
      <div className={cn('divide-y divide-slate-200', className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps {
  id: string
  children: ReactNode
  className?: string
}

export function AccordionItem({ id, children, className }: AccordionItemProps) {
  return <div className={cn('', className)}>{children}</div>
}

interface AccordionTriggerProps {
  id: string
  children: ReactNode
  className?: string
}

export function AccordionTrigger({ id, children, className }: AccordionTriggerProps) {
  const context = useContext(AccordionContext)
  if (!context) throw new Error('AccordionTrigger must be used within Accordion')

  const isOpen = context.openItems.includes(id)

  return (
    <button
      onClick={() => context.toggle(id)}
      className={cn(
        'flex items-center justify-between w-full py-5 text-left font-medium text-slate-900 hover:text-[#5A9BC7] transition-colors',
        className
      )}
    >
      <span>{children}</span>
      <svg
        className={cn(
          'w-5 h-5 text-slate-400 transition-transform duration-200',
          isOpen && 'transform rotate-180'
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

interface AccordionContentProps {
  id: string
  children: ReactNode
  className?: string
}

export function AccordionContent({ id, children, className }: AccordionContentProps) {
  const context = useContext(AccordionContext)
  if (!context) throw new Error('AccordionContent must be used within Accordion')

  const isOpen = context.openItems.includes(id)

  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-200',
        isOpen ? 'max-h-96 pb-5' : 'max-h-0',
        className
      )}
    >
      <div className="text-slate-600 leading-relaxed">{children}</div>
    </div>
  )
}
