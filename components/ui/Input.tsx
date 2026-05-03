import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.replace(/\s+/g, '-').toLowerCase()

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label-text">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'input-field',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {hint && !error && (
        <p className="mt-1 text-xs text-white/40">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.replace(/\s+/g, '-').toLowerCase()

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label-text">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'input-field resize-none min-h-[100px]',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ label, error, options, placeholder, className, id, ...props }: SelectProps) {
  const inputId = id ?? label?.replace(/\s+/g, '-').toLowerCase()

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label-text">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          'input-field appearance-none cursor-pointer',
          error && 'border-red-500',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="bg-brand-dark">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-brand-dark">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}
