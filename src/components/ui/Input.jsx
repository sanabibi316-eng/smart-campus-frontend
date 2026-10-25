const Input = ({ label, error, icon, type = 'text', className = '', ...rest }) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          type={type}
          className={`input-field ${icon ? 'pl-10' : ''} ${
            error ? 'border-accent-red focus:border-accent-red focus:ring-red-100' : ''
          }`}
          {...rest}
        />
      </div>
      {error && <p className="mt-1 text-xs text-accent-red">{error}</p>}
    </div>
  );
};

export default Input;