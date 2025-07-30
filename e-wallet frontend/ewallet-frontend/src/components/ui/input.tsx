import React from 'react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={`border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      />
    );
  }
);
Input.displayName = 'Input';