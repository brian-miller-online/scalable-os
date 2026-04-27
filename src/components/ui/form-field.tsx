'use client'

interface FormFieldProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  error?: string
  defaultValue?: string | number
  min?: number
  max?: number
  autoFocus?: boolean
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  error,
  defaultValue,
  min,
  max,
  autoFocus,
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        min={min}
        max={max}
        autoFocus={autoFocus}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
          focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
          disabled:bg-gray-50 disabled:text-gray-500"
        style={{ minHeight: '44px' }}
        data-testid={`field-${name}`}
      />
      {error && (
        <p className="text-sm text-red-600" data-testid={`error-${name}`}>
          {error}
        </p>
      )}
    </div>
  )
}
