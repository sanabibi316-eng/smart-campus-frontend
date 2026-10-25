import { HiChevronDown } from 'react-icons/hi';

const Select = ({
  label,
  options = [],
  children,
  error,
  className = '',
  disabled = false,
  ...rest
}) => (
  <div className={`w-full ${className}`}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
    )}
    <div className="relative">
      <select
        disabled={disabled}
        className={`input-field appearance-none cursor-pointer bg-white pr-10 text-sm font-normal text-gray-800 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400 ${
          error ? 'border-accent-red focus:border-accent-red focus:ring-red-100' : ''
        }`}
        {...rest}
      >
        {children
          ? children
          : options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
        <HiChevronDown className="w-5 h-5" />
      </div>
    </div>
    {error && <p className="mt-1 text-xs text-accent-red">{error}</p>}
  </div>
);

export default Select;
