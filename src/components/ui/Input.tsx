
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, id, error, icon, className = '', ...props }) => {
  const baseInputClasses = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent";
  const errorInputClasses = "border-red-500 focus:ring-red-300";
  const iconPadding = icon ? "pl-10" : "";

  return (
    <div className="mb-4 w-full">
      {label && (
        <label htmlFor={id || props.name} className="block text-gray-700 text-sm font-bold mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {icon}
            </div>
        )}
        <input
          id={id || props.name}
          className={`${baseInputClasses} ${error ? errorInputClasses : 'border-gray-300'} ${iconPadding} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
    </div>
  );
};

export default Input;
    