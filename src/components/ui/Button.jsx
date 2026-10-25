const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon,
  className = '',
  ...rest
}) => {
  const variants = {
    primary:
      'bg-primary-500 hover:bg-primary-600 text-white shadow-soft hover:shadow-glow',
    secondary:
      'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200',
    danger: 'bg-accent-red hover:bg-red-600 text-white',
    ghost: 'bg-primary-50 hover:bg-primary-100 text-primary-600',
    outline:
      'bg-transparent hover:bg-primary-50 text-primary-600 border border-primary-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      ) : (
        icon
      )}
      {children}
    </button>
  );
};

export default Button;