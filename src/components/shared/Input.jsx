import { forwardRef, useId } from 'react';
import { cn } from './cn.js';

const Input = forwardRef(
  (
    {
      label,
      hint,
      error,
      type = 'text',
      className = '',
      id: idProp,
      required,
      ...rest
    },
    ref,
  ) => {
    const reactId = useId();
    const id = idProp ?? reactId;

    return (
      <div className={cn('block', className)}>
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-xs font-semibold text-lic-charcoal"
          >
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          type={type}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={hint || error ? `${id}-help` : undefined}
          className={cn(
            'min-h-[48px] w-full rounded-card border-2 border-black/[0.08] bg-white px-4 py-2.5 text-sm text-lic-charcoal',
            'shadow-inner shadow-black/[0.02] transition-all duration-200 ease-material placeholder:text-lic-body/50',
            'focus:outline-none focus:ring-2 focus:ring-lic-teal/35 focus:border-lic-teal',
            error
              ? 'border-red-400 focus:ring-red-200'
              : '',
          )}
          {...rest}
        />
        {(hint || error) && (
          <span
            id={`${id}-help`}
            className={cn(
              'mt-1 block text-[11px]',
              error ? 'text-red-600' : 'text-lic-body/80',
            )}
          >
            {error || hint}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
